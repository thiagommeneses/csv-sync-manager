
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
  correctedPhoneNumbers?: number;
}

export interface FilterOptions {
  phoneNumbers: {
    removeDuplicates: boolean;
    fixFormat: boolean;
  };
  messages: 'all' | 'empty' | 'custom';
  customMessageFilter?: string;
  templates: 'all' | 'empty' | 'custom';
  customTemplateFilter?: string;
  showOnlyMainColumns: boolean;
}

export interface ExportOptions {
  format: 'omnichat' | 'zenvia';
  smsText?: string; // Only used for Zenvia exports
  delimiter?: string; // Para escolher o delimitador na exportação
}

export interface BackupInfo {
  id: string;
  filename: string;
  timestamp: Date;
  size: number;
}

export interface HelpTopic {
  id: string;
  title: string;
  content: string;
}
