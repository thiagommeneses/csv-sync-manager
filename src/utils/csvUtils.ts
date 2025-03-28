import { CSVData, CSVStats, FilterOptions } from '@/types/csv';

export const parseCSV = (csvText: string): CSVData => {
  try {
    const lines = csvText.split('\n');
    
    // Remove empty lines
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    if (nonEmptyLines.length === 0) {
      throw new Error('Arquivo CSV vazio');
    }

    // Parse headers
    const headers = parseCSVLine(nonEmptyLines[0]);
    
    // Parse rows
    const rows: string[][] = nonEmptyLines.slice(1).map(line => parseCSVLine(line));
    
    return {
      headers,
      rows,
      rawData: csvText,
      totalRows: rows.length
    };
  } catch (error) {
    console.error('Erro ao analisar CSV:', error);
    throw new Error('Falha ao analisar o arquivo CSV. Por favor, verifique o formato.');
  }
};

export const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let inQuotes = false;
  let currentValue = '';
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"' && inQuotes && nextChar === '"') {
      currentValue += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  result.push(currentValue);
  return result;
};

export const validateCSVStructure = (data: CSVData): boolean => {
  const requiredColumns = ['phone', 'template_title', 'reply_message_text'];
  const headers = data.headers.map(h => h.toLowerCase().trim());
  
  return requiredColumns.every(col => headers.includes(col));
};

export const analyzeCSV = (data: CSVData): CSVStats => {
  const phoneIndex = data.headers.findIndex(h => 
    h.toLowerCase().trim() === 'phone'
  );
  
  const messageIndex = data.headers.findIndex(h => 
    h.toLowerCase().trim() === 'reply_message_text'
  );
  
  const allPhoneNumbers = data.rows.map(row => 
    phoneIndex >= 0 && phoneIndex < row.length ? normalizePhoneNumber(row[phoneIndex]) : ''
  ).filter(Boolean);
  
  const uniquePhoneNumbers = new Set(allPhoneNumbers);
  
  const emptyMessages = data.rows.filter(row => 
    messageIndex >= 0 && 
    messageIndex < row.length && 
    (!row[messageIndex] || row[messageIndex].trim() === '')
  ).length;
  
  return {
    totalRecords: data.rows.length,
    validPhoneNumbers: allPhoneNumbers.length,
    duplicatePhoneNumbers: allPhoneNumbers.length - uniquePhoneNumbers.size,
    emptyMessages
  };
};

export const normalizePhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '');
  
  // Handle Brazilian numbers
  if (normalized.length === 11 && normalized.startsWith('0')) {
    normalized = normalized.substring(1);
  }
  
  // Ensure it has the international code for Brazil (55) if it doesn't already
  if ((normalized.length === 10 || normalized.length === 11) && !normalized.startsWith('55')) {
    normalized = '55' + normalized;
  }
  
  return normalized;
};

export const applyFilters = (data: CSVData, filters: FilterOptions): CSVData => {
  // Find column indexes
  const phoneIndex = data.headers.findIndex(h => 
    h.toLowerCase().trim() === 'phone'
  );
  
  const messageIndex = data.headers.findIndex(h => 
    h.toLowerCase().trim() === 'reply_message_text'
  );
  
  const templateIndex = data.headers.findIndex(h => 
    h.toLowerCase().trim() === 'template_title'
  );
  
  let filteredRows = [...data.rows];
  let correctedPhoneNumbers = 0;
  
  // Apply phone number filters
  if (filters.phoneNumbers.removeDuplicates && phoneIndex >= 0) {
    const seen = new Set<string>();
    filteredRows = filteredRows.filter(row => {
      if (phoneIndex >= row.length) return true;
      
      const phone = normalizePhoneNumber(row[phoneIndex]);
      if (!phone || seen.has(phone)) return false;
      
      seen.add(phone);
      return true;
    });
  }
  
  if (filters.phoneNumbers.fixFormat && phoneIndex >= 0) {
    filteredRows = filteredRows.map(row => {
      if (phoneIndex < row.length) {
        const originalPhone = row[phoneIndex];
        const fixedPhone = normalizePhoneNumber(originalPhone);
        
        // Contar números corrigidos
        if (originalPhone !== fixedPhone && fixedPhone) {
          correctedPhoneNumbers++;
        }
        
        const fixedRow = [...row];
        fixedRow[phoneIndex] = fixedPhone;
        return fixedRow;
      }
      return row;
    });
  }
  
  // Apply message filters
  if (messageIndex >= 0) {
    if (filters.messages === 'empty') {
      filteredRows = filteredRows.filter(row => 
        messageIndex < row.length && (!row[messageIndex] || row[messageIndex].trim() === '')
      );
    } else if (filters.messages === 'custom' && filters.customMessageFilter) {
      const lowerCustomFilter = filters.customMessageFilter.toLowerCase();
      filteredRows = filteredRows.filter(row => 
        messageIndex < row.length && 
        row[messageIndex] && 
        row[messageIndex].toLowerCase().includes(lowerCustomFilter)
      );
    }
  }
  
  // Apply template filters
  if (templateIndex >= 0) {
    if (filters.templates === 'empty') {
      filteredRows = filteredRows.filter(row => 
        templateIndex < row.length && (!row[templateIndex] || row[templateIndex].trim() === '')
      );
    } else if (filters.templates === 'custom' && filters.customTemplateFilter) {
      // Modificado para suportar múltiplos termos de busca
      const searchTerms = filters.customTemplateFilter.toLowerCase().split(/\s+/).filter(term => term.length > 0);
      
      filteredRows = filteredRows.filter(row => {
        if (templateIndex >= row.length || !row[templateIndex]) return false;
        
        const templateText = row[templateIndex].toLowerCase();
        // Verificar se TODOS os termos de busca estão presentes no template
        return searchTerms.every(term => templateText.includes(term));
      });
    }
  }
  
  const result = {
    ...data,
    rows: filteredRows,
    totalRows: filteredRows.length
  };
  
  // Incluir estatísticas adicionais se necessário
  if (filters.phoneNumbers.fixFormat) {
    const stats = analyzeCSV(result);
    stats.correctedPhoneNumbers = correctedPhoneNumbers;
    (result as any).stats = stats;
  }
  
  return result;
};

export const exportToOmniChat = (data: CSVData, fileName?: string): string => {
  const phoneIndex = data.headers.findIndex(h => 
    h.toLowerCase().trim() === 'phone'
  );
  
  if (phoneIndex === -1) {
    throw new Error('Coluna de telefone não encontrada nos dados CSV');
  }
  
  const newHeaders = ['fullNumber'];
  const newRows = data.rows.map(row => {
    const phone = phoneIndex < row.length ? normalizePhoneNumber(row[phoneIndex]) : '';
    return [phone];
  });
  
  return convertToCSVString(newHeaders, newRows, ',');
};

export const exportToZenvia = (data: CSVData, smsText: string, delimiter: string = ';'): string => {
  const phoneIndex = data.headers.findIndex(h => 
    h.toLowerCase().trim() === 'phone'
  );
  
  if (phoneIndex === -1) {
    throw new Error('Coluna de telefone não encontrada nos dados CSV');
  }
  
  const newHeaders = ['celular', 'sms'];
  const newRows = data.rows.map(row => {
    const phone = phoneIndex < row.length ? normalizePhoneNumber(row[phoneIndex]) : '';
    return [phone, smsText];
  });
  
  return convertToCSVString(newHeaders, newRows, delimiter);
};

export const convertToCSVString = (headers: string[], rows: string[][], delimiter: string = ','): string => {
  const headerLine = headers.join(delimiter);
  const rowLines = rows.map(row => row.map(cell => {
    // Escape quotes and wrap in quotes if needed
    if (cell.includes('"') || cell.includes(delimiter) || cell.includes('\n')) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  }).join(delimiter));
  
  return [headerLine, ...rowLines].join('\n');
};

export const countSMSCharacters = (text: string): number => {
  return text.length;
};

export const getSMSLengthStatus = (length: number): 'ok' | 'warning' | 'danger' => {
  if (length <= 130) return 'ok';
  if (length <= 159) return 'warning';
  return 'danger';
};

export const splitCSVFile = (data: CSVData, maxRowsPerPart: number): CSVData[] => {
  if (!data.rows.length || maxRowsPerPart <= 0) {
    return [data];
  }

  const totalParts = Math.ceil(data.rows.length / maxRowsPerPart);
  const result: CSVData[] = [];

  for (let i = 0; i < totalParts; i++) {
    const startIdx = i * maxRowsPerPart;
    const endIdx = Math.min((i + 1) * maxRowsPerPart, data.rows.length);
    const partRows = data.rows.slice(startIdx, endIdx);

    result.push({
      headers: [...data.headers],
      rows: partRows,
      rawData: '', // A rawData será recalculada se necessário
      totalRows: partRows.length
    });
  }

  return result;
};

export const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}h${minutes}`;
};

export const generateFileName = (
  channel: 'WhatsApp' | 'SMS', 
  scheduledDate: Date, 
  theme: string = ''
): string => {
  const prefix = 'V4-MKT';
  const type = 'DISPARO';
  const formattedScheduledDate = formatDate(scheduledDate);
  const formattedScheduledTime = formatTime(scheduledDate);
  
  const now = new Date();
  const formattedGeneratedDate = formatDate(now);
  const formattedGeneratedTime = formatTime(now);
  
  const themePart = theme ? `_${theme}` : '';
  
  return `${prefix}_${channel}_${type}_${formattedScheduledDate}_${formattedScheduledTime}${themePart}_GERADO-${formattedGeneratedDate}_${formattedGeneratedTime}.csv`;
};

export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
};

export const getFromLocalStorage = (key: string): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Erro ao recuperar do localStorage:', error);
    return null;
  }
};

export const validatePhoneNumber = (phone: string): { isValid: boolean; reason?: string } => {
  const normalized = normalizePhoneNumber(phone);
  
  if (!normalized) {
    return { isValid: false, reason: 'Número de telefone vazio' };
  }
  
  if (normalized.length < 12) {
    return { isValid: false, reason: 'Número de telefone muito curto' };
  }
  
  if (normalized.length > 13) {
    return { isValid: false, reason: 'Número de telefone muito longo' };
  }
  
  // Validação específica para números brasileiros
  if (normalized.startsWith('55')) {
    const ddd = normalized.substring(2, 4);
    const validDDDs = ['11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38', '41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
    
    if (!validDDDs.includes(ddd)) {
      return { isValid: false, reason: 'DDD inválido para Brasil' };
    }
  }
  
  return { isValid: true };
};

export const validateCSVDataAdvanced = (data: CSVData): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Verificar se há headers
  if (data.headers.length === 0) {
    issues.push('O arquivo CSV não contém cabeçalhos');
  }
  
  // Verificar se há colunas obrigatórias
  const requiredColumns = ['phone', 'template_title', 'reply_message_text'];
  const headers = data.headers.map(h => h.toLowerCase().trim());
  
  for (const col of requiredColumns) {
    if (!headers.includes(col)) {
      issues.push(`Coluna obrigatória ausente: ${col}`);
    }
  }
  
  // Verificar consistência das linhas
  const inconsistentRows = data.rows.filter(row => row.length !== data.headers.length);
  if (inconsistentRows.length > 0) {
    issues.push(`${inconsistentRows.length} linha(s) com número inconsistente de colunas`);
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

export interface RecentFile {
  id: string;
  name: string;
  date: string;
  rows: number;
  preview: string;
}

export const saveRecentFile = (data: CSVData, fileName: string): void => {
  try {
    const recentFiles: RecentFile[] = getFromLocalStorage('recentFiles') || [];
    
    // Criar um ID único baseado na data
    const id = `file_${Date.now()}`;
    
    // Criar uma amostra dos dados para pré-visualização
    const previewRows = data.rows.slice(0, 3);
    const preview = previewRows.map(row => {
      // Encontrar o índice da coluna de telefone
      const phoneIndex = data.headers.findIndex(h => h.toLowerCase().trim() === 'phone');
      return phoneIndex >= 0 && phoneIndex < row.length ? row[phoneIndex] : 'N/A';
    }).join(', ');
    
    const newRecentFile: RecentFile = {
      id,
      name: fileName,
      date: new Date().toISOString(),
      rows: data.rows.length,
      preview
    };
    
    // Adicionar ao início da lista e manter apenas os 10 mais recentes
    recentFiles.unshift(newRecentFile);
    if (recentFiles.length > 10) {
      recentFiles.pop();
    }
    
    saveToLocalStorage('recentFiles', recentFiles);
  } catch (error) {
    console.error('Erro ao salvar arquivo recente:', error);
  }
};

export const getRecentFiles = (): RecentFile[] => {
  return getFromLocalStorage('recentFiles') || [];
};
