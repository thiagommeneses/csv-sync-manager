
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
  phoneNumbers: 'all' | 'removeDuplicates' | 'fixFormat';
  messages: 'all' | 'empty' | 'custom';
  customMessageFilter?: string;
  templates: 'all' | 'empty' | 'custom';
  customTemplateFilter?: string;
}

export interface ExportOptions {
  format: 'omnichat' | 'zenvia';
  smsText?: string; // Only used for Zenvia exports
}

export interface BackupInfo {
  id: string;
  filename: string;
  timestamp: Date;
  size: number;
}
