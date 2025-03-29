export interface RecentFile {
  id: string;
  name: string;
  date: string;
  rows: number;
  preview?: string;
  content?: string; // Added to store the full file content for quick loading
}

// Add function to load a saved CSV file
export const loadSavedCSVData = async (fileId: string): Promise<CSVData | null> => {
  try {
    const recentFilesJson = localStorage.getItem('csv-sync-recent-files');
    if (!recentFilesJson) return null;
    
    const recentFiles: RecentFile[] = JSON.parse(recentFilesJson);
    const file = recentFiles.find(f => f.id === fileId);
    
    if (!file || !file.content) return null;
    
    // Parse the stored content
    return parseCSV(file.content);
  } catch (error) {
    console.error('Error loading saved CSV data:', error);
    return null;
  }
};

// Modify the getRecentFiles to store and retrieve file content
export const getRecentFiles = (): RecentFile[] => {
  try {
    const recentFilesJson = localStorage.getItem('csv-sync-recent-files');
    if (!recentFilesJson) return [];
    
    return JSON.parse(recentFilesJson);
  } catch (error) {
    console.error('Error getting recent files:', error);
    return [];
  }
};

// Update addRecentFile to store file content
export const addRecentFile = (file: File, data: CSVData) => {
  try {
    // Generate a preview from the first row data
    let preview = '';
    if (data.rows.length > 0) {
      const firstRow = data.rows[0];
      const phoneIndex = data.headers.findIndex(h => 
        h.toLowerCase().includes('phone') || h.toLowerCase().includes('telefone'));
      const messageIndex = data.headers.findIndex(h => 
        h.toLowerCase().includes('message') || h.toLowerCase().includes('mensagem'));
      
      if (phoneIndex >= 0 && messageIndex >= 0) {
        preview = `${firstRow[phoneIndex]}: ${firstRow[messageIndex].substring(0, 30)}...`;
      } else if (phoneIndex >= 0) {
        preview = firstRow[phoneIndex];
      } else if (data.headers.length > 0 && firstRow.length > 0) {
        preview = firstRow[0];
      }
    }
    
    const newFile: RecentFile = {
      id: Date.now().toString(),
      name: file.name,
      date: new Date().toISOString(),
      rows: data.totalRows,
      preview,
      content: data.rawData // Store the raw CSV content
    };
    
    let recentFiles: RecentFile[] = [];
    const recentFilesJson = localStorage.getItem('csv-sync-recent-files');
    
    if (recentFilesJson) {
      recentFiles = JSON.parse(recentFilesJson);
    }
    
    // Add new file at the beginning
    recentFiles.unshift(newFile);
    
    // Keep only the latest 10 files
    if (recentFiles.length > 10) {
      recentFiles = recentFiles.slice(0, 10);
    }
    
    localStorage.setItem('csv-sync-recent-files', JSON.stringify(recentFiles));
  } catch (error) {
    console.error('Error adding recent file:', error);
  }
};

import Papa from 'papaparse';

export interface CSVData {
  headers: string[];
  rows: string[][];
  rawData: string;
  totalRows: number;
}

export interface CSVStats {
  totalRecords: number;
  validPhoneNumbers: number;
  duplicatePhoneNumbers: number;
  emptyMessages: number;
}

export interface FilterOptions {
  phoneNumbers: {
    removeDuplicates: boolean;
    fixFormat: boolean;
  };
  messages: 'all' | 'withContent' | 'empty';
  templates: 'all' | 'withTemplate' | 'noTemplate';
  showOnlyMainColumns: boolean;
}

export const parseCSV = (csvText: string): CSVData => {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const headers = result.meta.fields || [];
  const rows = result.data.map((row: any) => headers.map(header => row[header] || ''));

  return {
    headers,
    rows,
    rawData: csvText,
    totalRows: rows.length,
  };
};

export const validateCSVStructure = (data: CSVData): boolean => {
  const requiredColumns = ['phone', 'template_title', 'reply_message_text'];
  const lowerCaseHeaders = data.headers.map(h => h.toLowerCase());
  
  return requiredColumns.every(col => 
    lowerCaseHeaders.some(header => header.includes(col))
  );
};

export const validateCSVDataAdvanced = (data: CSVData): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  const lowerCaseHeaders = data.headers.map(h => h.toLowerCase());
  
  // Check for required columns
  const requiredColumns = [
    { name: 'phone', alias: ['telefone', 'celular', 'mobile'] },
    { name: 'template_title', alias: ['template', 'modelo', 'título do template'] },
    { name: 'reply_message_text', alias: ['message', 'mensagem', 'texto'] }
  ];
  
  for (const col of requiredColumns) {
    const found = lowerCaseHeaders.some(header => 
      header.includes(col.name) || col.alias.some(alias => header.includes(alias))
    );
    
    if (!found) {
      issues.push(`Coluna obrigatória não encontrada: ${col.name} (ou alternativas: ${col.alias.join(', ')})`);
    }
  }
  
  // Check for empty rows
  if (data.rows.some(row => row.every(cell => cell.trim() === ''))) {
    issues.push('O arquivo contém linhas vazias que podem causar problemas na importação');
  }
  
  // Check for phone number format issues
  const phoneIndex = lowerCaseHeaders.findIndex(h => 
    h.includes('phone') || h.includes('telefone') || h.includes('celular')
  );
  
  if (phoneIndex >= 0) {
    const invalidPhones = data.rows.filter(row => {
      const phone = row[phoneIndex].trim();
      return phone && !isValidPhoneNumber(phone);
    }).length;
    
    if (invalidPhones > 0) {
      issues.push(`${invalidPhones} números de telefone parecem estar em formato inválido`);
    }
  }
  
  // Check for duplicate phone numbers
  if (phoneIndex >= 0) {
    const phones = data.rows.map(row => row[phoneIndex].trim()).filter(Boolean);
    const uniquePhones = new Set(phones);
    
    if (uniquePhones.size < phones.length) {
      issues.push(`Existem ${phones.length - uniquePhones.size} números de telefone duplicados`);
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

export const isValidPhoneNumber = (phone: string): boolean => {
  // Basic validation for Brazilian phone numbers
  // Should have 10-11 digits, possibly with country code
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length < 10 || digits.length > 13) {
    return false;
  }
  
  // Check if it starts with valid country code or area code
  if (digits.length >= 12) {
    return digits.startsWith('55') || digits.startsWith('1');
  }
  
  return true;
};

export const analyzeCSV = (data: CSVData): CSVStats => {
  const phoneIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('phone') || h.toLowerCase().includes('telefone')
  );
  
  const messageIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('message') || h.toLowerCase().includes('mensagem')
  );
  
  let validPhoneNumbers = 0;
  let emptyMessages = 0;
  let phoneNumbers = new Set<string>();
  let duplicateCount = 0;
  
  if (phoneIndex >= 0) {
    data.rows.forEach(row => {
      const phone = row[phoneIndex].trim();
      
      if (isValidPhoneNumber(phone)) {
        validPhoneNumbers++;
        
        if (phoneNumbers.has(phone)) {
          duplicateCount++;
        } else {
          phoneNumbers.add(phone);
        }
      }
      
      if (messageIndex >= 0 && row[messageIndex].trim() === '') {
        emptyMessages++;
      }
    });
  }
  
  return {
    totalRecords: data.rows.length,
    validPhoneNumbers,
    duplicatePhoneNumbers: duplicateCount,
    emptyMessages
  };
};

export const applyFilters = (data: CSVData, filters: FilterOptions): CSVData => {
  if (!data.rows.length) return data;
  
  let filteredRows = [...data.rows];
  const phoneIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('phone') || h.toLowerCase().includes('telefone')
  );
  
  const messageIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('message') || h.toLowerCase().includes('mensagem') || 
    h.toLowerCase().includes('reply_message_text')
  );
  
  const templateIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('template') || h.toLowerCase().includes('modelo')
  );
  
  // Filter by phone number options
  if (phoneIndex >= 0) {
    if (filters.phoneNumbers.removeDuplicates) {
      const seenPhones = new Set<string>();
      filteredRows = filteredRows.filter(row => {
        const phone = row[phoneIndex].trim();
        if (!phone || seenPhones.has(phone)) return false;
        seenPhones.add(phone);
        return true;
      });
    }
    
    if (filters.phoneNumbers.fixFormat) {
      filteredRows = filteredRows.map(row => {
        const newRow = [...row];
        let phone = newRow[phoneIndex].trim();
        
        // Remove all non-digit characters
        phone = phone.replace(/\D/g, '');
        
        // Ensure it has country code
        if (phone.length === 10 || phone.length === 11) {
          phone = '55' + phone;
        }
        
        newRow[phoneIndex] = phone;
        return newRow;
      });
    }
  }
  
  // Filter by message content
  if (messageIndex >= 0) {
    if (filters.messages === 'withContent') {
      filteredRows = filteredRows.filter(row => row[messageIndex].trim() !== '');
    } else if (filters.messages === 'empty') {
      filteredRows = filteredRows.filter(row => row[messageIndex].trim() === '');
    }
  }
  
  // Filter by template
  if (templateIndex >= 0) {
    if (filters.templates === 'withTemplate') {
      filteredRows = filteredRows.filter(row => row[templateIndex].trim() !== '');
    } else if (filters.templates === 'noTemplate') {
      filteredRows = filteredRows.filter(row => row[templateIndex].trim() === '');
    }
  }
  
  // Calculate stats for the filtered data
  const stats = {
    totalRecords: filteredRows.length,
    validPhoneNumbers: 0,
    duplicatePhoneNumbers: 0,
    emptyMessages: 0
  };
  
  if (phoneIndex >= 0) {
    const phoneNumbers = new Set<string>();
    
    filteredRows.forEach(row => {
      const phone = row[phoneIndex].trim();
      
      if (isValidPhoneNumber(phone)) {
        stats.validPhoneNumbers++;
        
        if (phoneNumbers.has(phone)) {
          stats.duplicatePhoneNumbers++;
        } else {
          phoneNumbers.add(phone);
        }
      }
      
      if (messageIndex >= 0 && row[messageIndex].trim() === '') {
        stats.emptyMessages++;
      }
    });
  }
  
  return {
    headers: data.headers,
    rows: filteredRows,
    rawData: data.rawData,
    totalRows: filteredRows.length,
    stats
  } as CSVData & { stats: CSVStats };
};

export const splitCSVFile = (data: CSVData, rowsPerPart: number): CSVData[] => {
  if (rowsPerPart <= 0 || data.rows.length <= rowsPerPart) {
    return [data];
  }
  
  const parts: CSVData[] = [];
  const totalParts = Math.ceil(data.rows.length / rowsPerPart);
  
  for (let i = 0; i < totalParts; i++) {
    const startIdx = i * rowsPerPart;
    const endIdx = Math.min(startIdx + rowsPerPart, data.rows.length);
    const partRows = data.rows.slice(startIdx, endIdx);
    
    parts.push({
      headers: data.headers,
      rows: partRows,
      rawData: '', // This will be generated when needed
      totalRows: partRows.length
    });
  }
  
  return parts;
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Ensure it has country code
  if (digits.length === 10 || digits.length === 11) {
    return '55' + digits;
  }
  
  return digits;
};

export const convertToOmnichatFormat = (data: CSVData): CSVData => {
  // Find relevant column indices
  const phoneIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('phone') || h.toLowerCase().includes('telefone')
  );
  
  const messageIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('message') || h.toLowerCase().includes('mensagem') || 
    h.toLowerCase().includes('reply_message_text')
  );
  
  const templateIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('template') || h.toLowerCase().includes('modelo') ||
    h.toLowerCase().includes('template_title')
  );
  
  // Create OmniChat format headers
  const omnichatHeaders = ['phone', 'template_title', 'reply_message_text'];
  
  // Map rows to OmniChat format
  const omnichatRows = data.rows.map(row => {
    const phone = phoneIndex >= 0 ? formatPhoneNumber(row[phoneIndex]) : '';
    const template = templateIndex >= 0 ? row[templateIndex] : '';
    const message = messageIndex >= 0 ? row[messageIndex] : '';
    
    return [phone, template, message];
  });
  
  return {
    headers: omnichatHeaders,
    rows: omnichatRows,
    rawData: '', // This will be generated when needed
    totalRows: omnichatRows.length
  };
};

export const convertToZenviaFormat = (data: CSVData): CSVData => {
  // Find relevant column indices
  const phoneIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('phone') || h.toLowerCase().includes('telefone')
  );
  
  const messageIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('message') || h.toLowerCase().includes('mensagem') || 
    h.toLowerCase().includes('reply_message_text')
  );
  
  // Create Zenvia format headers
  const zenviaHeaders = ['id', 'phone', 'message'];
  
  // Map rows to Zenvia format
  const zenviaRows = data.rows.map((row, index) => {
    const id = (index + 1).toString();
    const phone = phoneIndex >= 0 ? formatPhoneNumber(row[phoneIndex]) : '';
    const message = messageIndex >= 0 ? row[messageIndex] : '';
    
    return [id, phone, message];
  });
  
  return {
    headers: zenviaHeaders,
    rows: zenviaRows,
    rawData: '', // This will be generated when needed
    totalRows: zenviaRows.length
  };
};
