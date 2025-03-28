
import { CSVData, CSVStats, FilterOptions } from '@/types/csv';

export const parseCSV = (csvText: string): CSVData => {
  try {
    const lines = csvText.split('\n');
    
    // Remove empty lines
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    if (nonEmptyLines.length === 0) {
      throw new Error('CSV file is empty');
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
    console.error('Error parsing CSV:', error);
    throw new Error('Failed to parse CSV file. Please check the format.');
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
  if (normalized.length === 10 || normalized.length === 11) {
    if (!normalized.startsWith('55')) {
      normalized = '55' + normalized;
    }
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
  
  // Apply phone number filters
  if (filters.phoneNumbers === 'removeDuplicates' && phoneIndex >= 0) {
    const seen = new Set<string>();
    filteredRows = filteredRows.filter(row => {
      if (phoneIndex >= row.length) return true;
      
      const phone = normalizePhoneNumber(row[phoneIndex]);
      if (!phone || seen.has(phone)) return false;
      
      seen.add(phone);
      return true;
    });
  } else if (filters.phoneNumbers === 'fixFormat' && phoneIndex >= 0) {
    filteredRows = filteredRows.map(row => {
      if (phoneIndex < row.length) {
        const fixedRow = [...row];
        fixedRow[phoneIndex] = normalizePhoneNumber(row[phoneIndex]);
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
      const lowerCustomFilter = filters.customTemplateFilter.toLowerCase();
      filteredRows = filteredRows.filter(row => 
        templateIndex < row.length && 
        row[templateIndex] && 
        row[templateIndex].toLowerCase().includes(lowerCustomFilter)
      );
    }
  }
  
  return {
    ...data,
    rows: filteredRows,
    totalRows: filteredRows.length
  };
};

export const exportToOmniChat = (data: CSVData): string => {
  const phoneIndex = data.headers.findIndex(h => 
    h.toLowerCase().trim() === 'phone'
  );
  
  if (phoneIndex === -1) {
    throw new Error('Phone column not found in CSV data');
  }
  
  const newHeaders = ['fullNumber'];
  const newRows = data.rows.map(row => {
    const phone = phoneIndex < row.length ? normalizePhoneNumber(row[phoneIndex]) : '';
    return [phone];
  });
  
  return convertToCSVString(newHeaders, newRows);
};

export const exportToZenvia = (data: CSVData, smsText: string): string => {
  const phoneIndex = data.headers.findIndex(h => 
    h.toLowerCase().trim() === 'phone'
  );
  
  if (phoneIndex === -1) {
    throw new Error('Phone column not found in CSV data');
  }
  
  const newHeaders = ['celular', 'sms'];
  const newRows = data.rows.map(row => {
    const phone = phoneIndex < row.length ? normalizePhoneNumber(row[phoneIndex]) : '';
    return [phone, smsText];
  });
  
  return convertToCSVString(newHeaders, newRows);
};

export const convertToCSVString = (headers: string[], rows: string[][]): string => {
  const headerLine = headers.join(',');
  const rowLines = rows.map(row => row.map(cell => {
    // Escape quotes and wrap in quotes if needed
    if (cell.includes('"') || cell.includes(',') || cell.includes('\n')) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  }).join(','));
  
  return [headerLine, ...rowLines].join('\n');
};
