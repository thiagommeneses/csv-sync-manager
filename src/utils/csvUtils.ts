import { CSVData, CSVStats, FilterOptions, CSVValidation, RecentFile } from "@/types/csv";
import Papa from "papaparse";

// Function to validate if a phone number is valid
export const isValidPhoneNumber = (phone: string): boolean => {
  // Remove non-digit characters
  const cleanedPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid phone number (basic validation)
  // Brazilian numbers typically have 10-11 digits (including area code)
  return cleanedPhone.length >= 10 && cleanedPhone.length <= 13;
};

// Check if a value is empty considering null, undefined, or whitespace
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
};

export const analyzeCSV = (data: CSVData): CSVStats => {
  const phoneIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('phone') || h.toLowerCase().includes('telefone')
  );
  
  const messageIndex = findMessageColumnIndex(data.headers);
  
  let validPhoneNumbers = 0;
  let emptyMessages = 0;
  let phoneNumbers = new Set<string>();
  let duplicateCount = 0;
  let correctedPhoneNumbers = 0;
  
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
      
      if (messageIndex >= 0 && row.length > messageIndex) {
        // Check if message is empty, null, undefined or just whitespace
        if (isEmpty(row[messageIndex])) {
          emptyMessages++;
        }
      }
    });
  }
  
  return {
    totalRecords: data.rows.length,
    validPhoneNumbers,
    duplicatePhoneNumbers: duplicateCount,
    emptyMessages,
    correctedPhoneNumbers
  };
};

// Helper function to find the exact message column index
export const findMessageColumnIndex = (headers: string[]): number => {
  // Look specifically for reply_message_text first (exact match)
  const exactIndex = headers.findIndex(h => h === 'reply_message_text');
  if (exactIndex >= 0) return exactIndex;
  
  // If not found, try more general matches
  return headers.findIndex(h => 
    h.toLowerCase().includes('message') || h.toLowerCase().includes('mensagem') ||
    h.toLowerCase().includes('reply_message_text')
  );
};

export const parseCSV = (csvText: string): CSVData => {
  const parsedData = Papa.parse(csvText, { 
    header: true,
    skipEmptyLines: true
  });
  
  const headers = parsedData.meta.fields || [];
  const rows = parsedData.data.map((row: any) => 
    headers.map(header => row[header] !== undefined ? String(row[header]) : '')
  );
  
  return {
    headers,
    rows,
    rawData: csvText,
    totalRows: rows.length
  };
};

export const validateCSVStructure = (data: CSVData): boolean => {
  const hasPhone = data.headers.some(header => 
    header.toLowerCase().includes('phone') || header.toLowerCase().includes('telefone')
  );
  
  const hasTemplate = data.headers.some(header => 
    header.toLowerCase().includes('template_title')
  );
  
  const hasMessage = data.headers.some(header => 
    header.toLowerCase().includes('reply_message_text')
  );
  
  return hasPhone && (hasTemplate || hasMessage);
};

export const validateCSVDataAdvanced = (data: CSVData): CSVValidation => {
  const issues: string[] = [];
  
  // Check if phone column exists
  const phoneIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('phone') || h.toLowerCase().includes('telefone')
  );
  
  if (phoneIndex === -1) {
    issues.push("Coluna de telefone não encontrada. O arquivo deve ter uma coluna com 'phone' ou 'telefone' no título.");
  }
  
  // Count valid phone numbers
  let validPhones = 0;
  if (phoneIndex >= 0) {
    data.rows.forEach(row => {
      if (isValidPhoneNumber(row[phoneIndex])) {
        validPhones++;
      }
    });
    
    if (validPhones === 0) {
      issues.push("Nenhum número de telefone válido encontrado no arquivo.");
    } else if (validPhones < data.rows.length * 0.5) {
      issues.push(`Apenas ${validPhones} de ${data.rows.length} números de telefone parecem válidos.`);
    }
  }
  
  // Check additional expected columns
  const expectedColumns = ['template_title', 'reply_message_text', 'campaign_id'];
  const missingColumns = expectedColumns.filter(col => 
    !data.headers.some(h => h.toLowerCase().includes(col.toLowerCase()))
  );
  
  if (missingColumns.length > 0) {
    issues.push(`Colunas recomendadas não encontradas: ${missingColumns.join(', ')}`);
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    validationDate: new Date()
  };
};

export const applyFilters = (data: CSVData, filters: FilterOptions): CSVData => {
  let filteredRows = [...data.rows];
  let stats: CSVStats = {
    totalRecords: data.rows.length,
    validPhoneNumbers: 0,
    duplicatePhoneNumbers: 0,
    emptyMessages: 0,
    correctedPhoneNumbers: 0
  };
  
  // Get column indexes
  const phoneIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('phone') || h.toLowerCase().includes('telefone')
  );
  
  // Use the specific helper to find the message column index
  const messageIndex = findMessageColumnIndex(data.headers);
  
  console.log(`Message column index found: ${messageIndex}, column name: ${data.headers[messageIndex]}`);
  
  const templateIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('template_title')
  );
  
  // Phone number processing
  if (phoneIndex >= 0) {
    const seenPhones = new Set<string>();
    
    if (filters.phoneNumbers.fixFormat) {
      // Fix phone number formats
      filteredRows = filteredRows.map(row => {
        const phone = row[phoneIndex];
        const cleaned = phone.replace(/\D/g, '');
        
        // Apply Brazilian format logic if needed
        let formatted = cleaned;
        if (cleaned.length === 11 && cleaned.startsWith('55')) {
          formatted = `+${cleaned}`;
          stats.correctedPhoneNumbers++;
        } else if (cleaned.length === 10 || cleaned.length === 11) {
          formatted = `+55${cleaned}`;
          stats.correctedPhoneNumbers++;
        }
        
        const newRow = [...row];
        newRow[phoneIndex] = formatted;
        return newRow;
      });
    }
    
    // Remove duplicates if requested
    if (filters.phoneNumbers.removeDuplicates) {
      const uniqueRows: string[][] = [];
      
      filteredRows.forEach(row => {
        const phone = row[phoneIndex];
        if (!seenPhones.has(phone)) {
          seenPhones.add(phone);
          uniqueRows.push(row);
        } else {
          stats.duplicatePhoneNumbers++;
        }
      });
      
      filteredRows = uniqueRows;
    }
  }
  
  // Filter by message content
  if (messageIndex >= 0) {
    if (filters.messages === 'empty') {
      console.log(`Filtering for empty messages in column index ${messageIndex} (${data.headers[messageIndex]})`);
      
      filteredRows = filteredRows.filter(row => {
        const hasEmptyMessage = row.length <= messageIndex || isEmpty(row[messageIndex]);
        
        // Additional debug logging
        if (filteredRows.length < 5) {
          console.log(`Row check: ${row[messageIndex] || 'undefined'}, isEmpty: ${hasEmptyMessage}`);
        }
        
        return hasEmptyMessage;
      });
      
      console.log(`Found ${filteredRows.length} rows with empty messages`);
    } else if (filters.messages === 'withContent') {
      filteredRows = filteredRows.filter(row => {
        return row.length > messageIndex && !isEmpty(row[messageIndex]);
      });
    } else if (filters.messages === 'custom' && filters.customMessageFilter) {
      const searchTerms = filters.customMessageFilter.toLowerCase().split(' ').filter(term => term.trim() !== '');
      
      filteredRows = filteredRows.filter(row => {
        if (row.length <= messageIndex) return false;
        const message = (row[messageIndex] || '').toLowerCase();
        return searchTerms.every(term => message.includes(term));
      });
    }
  }
  
  // Filter by template
  if (templateIndex >= 0) {
    if (filters.templates === 'noTemplate') {
      filteredRows = filteredRows.filter(row => 
        isEmpty(row[templateIndex])
      );
    } else if (filters.templates === 'withTemplate') {
      filteredRows = filteredRows.filter(row => 
        !isEmpty(row[templateIndex])
      );
    } else if (filters.templates === 'custom' && filters.customTemplateFilter) {
      const searchTerms = filters.customTemplateFilter.toLowerCase().split(' ').filter(term => term.trim() !== '');
      
      filteredRows = filteredRows.filter(row => {
        const template = (row[templateIndex] || '').toLowerCase();
        return searchTerms.every(term => template.includes(term));
      });
    }
  }
  
  // Update stats
  stats.totalRecords = filteredRows.length;
  
  // Count valid phone numbers in filtered data
  if (phoneIndex >= 0) {
    filteredRows.forEach(row => {
      if (isValidPhoneNumber(row[phoneIndex])) {
        stats.validPhoneNumbers++;
      }
    });
  }
  
  // Count empty messages in filtered data
  if (messageIndex >= 0) {
    stats.emptyMessages = filteredRows.filter(row => 
      row.length <= messageIndex || isEmpty(row[messageIndex])
    ).length;
  }
  
  // Return filtered data with stats attached
  const result: CSVData = {
    headers: data.headers,
    rows: filteredRows,
    rawData: data.rawData,
    totalRows: filteredRows.length
  };
  
  (result as any).stats = stats;
  
  return result;
};

export const splitCSVFile = (data: CSVData, rowsPerPart: number): CSVData[] => {
  const parts: CSVData[] = [];
  
  for (let i = 0; i < data.rows.length; i += rowsPerPart) {
    const partRows = data.rows.slice(i, i + rowsPerPart);
    
    parts.push({
      headers: [...data.headers],
      rows: partRows,
      rawData: '', // This will be generated later if needed
      totalRows: partRows.length
    });
  }
  
  return parts;
};

export const exportToOmniChat = (data: CSVData): string => {
  // Find phone column index
  const phoneIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('phone') || h.toLowerCase().includes('telefone')
  );
  
  if (phoneIndex === -1) {
    throw new Error("Coluna de telefone não encontrada");
  }
  
  // Create new CSV with just one column 'fullNumber'
  const header = ['fullNumber'];
  const rows = data.rows.map(row => {
    let phone = row[phoneIndex].trim().replace(/\D/g, '');
    
    // Format validation/correction
    if (!phone.startsWith('55') && (phone.length === 10 || phone.length === 11)) {
      phone = `55${phone}`;
    }
    
    return [phone];
  });
  
  // Convert to CSV string
  const csvRows = [
    header.join(','),
    ...rows.map(row => row.join(','))
  ];
  
  return csvRows.join('\n');
};

export const exportToZenvia = (data: CSVData, smsText: string, delimiter: string = ','): string => {
  // Find phone column index
  const phoneIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('phone') || h.toLowerCase().includes('telefone')
  );
  
  if (phoneIndex === -1) {
    throw new Error("Coluna de telefone não encontrada");
  }
  
  // Create new CSV with 'celular' and 'sms' columns
  const header = ['celular', 'sms'];
  const rows = data.rows.map(row => {
    let phone = row[phoneIndex].trim().replace(/\D/g, '');
    
    // Format validation/correction
    if (phone.startsWith('55') && phone.length > 11) {
      phone = phone.substring(2);
    }
    
    return [phone, smsText];
  });
  
  // Convert to CSV string using the specified delimiter
  const csvRows = [
    header.join(delimiter),
    ...rows.map(row => row.join(delimiter))
  ];
  
  return csvRows.join('\n');
};

export const generateFileName = (channel: string, date: Date, theme?: string): string => {
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };
  
  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}${minutes}`;
  };
  
  const dateStr = formatDate(date);
  const timeStr = formatTime(date);
  const themeStr = theme ? `_${theme}` : '';
  const currentDate = formatDate(new Date());
  const currentTime = formatTime(new Date());
  
  return `V4-MKT_${channel.toUpperCase()}_DISPARO_${dateStr}_${timeStr}${themeStr}_GERADO-${currentDate}_${currentTime}.csv`;
};

const RECENT_FILES_KEY = 'csv-manager-recent-files';
const MAX_RECENT_FILES = 10;

export const saveRecentFile = (data: CSVData, name: string): RecentFile => {
  const files = getRecentFiles();
  
  // Create a preview of the first few rows
  const previewRows = data.rows.slice(0, 3);
  const previewData = {
    headers: data.headers,
    rows: previewRows
  };
  
  const fileSize = new Blob([data.rawData]).size;
  
  const newFile: RecentFile = {
    id: `file_${Date.now()}`,
    name,
    date: new Date().toISOString(),
    rows: data.rows.length,
    size: fileSize,
    preview: JSON.stringify(previewData),
    content: data.rawData
  };
  
  // Add to front of array and limit to max files
  const updatedFiles = [newFile, ...files.filter(f => f.id !== newFile.id)]
    .slice(0, MAX_RECENT_FILES);
  
  // Save to localStorage
  localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updatedFiles));
  
  return newFile;
};

export const getRecentFiles = (): RecentFile[] => {
  try {
    const filesJson = localStorage.getItem(RECENT_FILES_KEY);
    if (!filesJson) return [];
    
    const files = JSON.parse(filesJson);
    return Array.isArray(files) ? files : [];
  } catch (error) {
    console.error('Error loading recent files:', error);
    return [];
  }
};

export const loadSavedCSVData = async (fileId: string): Promise<CSVData | null> => {
  const files = getRecentFiles();
  const file = files.find(f => f.id === fileId);
  
  if (!file || !file.content) {
    return null;
  }
  
  try {
    return parseCSV(file.content);
  } catch (error) {
    console.error('Error parsing saved CSV:', error);
    return null;
  }
};

export type { RecentFile };
