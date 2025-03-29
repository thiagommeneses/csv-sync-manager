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
  messages: 'all' | 'withContent' | 'empty' | 'custom';
  customMessageFilter?: string;
  templates: 'all' | 'withTemplate' | 'noTemplate' | 'custom';
  customTemplateFilter?: string;
  showOnlyMainColumns: boolean;
}

export interface ExportOptions {
  format: 'omnichat' | 'zenvia';
  smsText?: string; // Only used for Zenvia exports
  delimiter?: string; // Para escolher o delimitador na exportação
  fileName?: string; // Nome personalizado do arquivo
  scheduledDate?: Date; // Data planejada para o disparo
  scheduledTime?: string; // Hora planejada para o disparo
  theme?: string; // Tema da campanha
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

export interface PhoneValidation {
  phone: string;
  isValid: boolean;
  reason?: string;
  suggestedFix?: string;
}

export interface CSVValidation {
  isValid: boolean;
  issues: string[];
  validationDate: Date;
}

export interface RecentFile {
  id: string;
  name: string;
  date: string;
  rows: number;
  size?: number;
  preview?: string;
  content?: string;
  originalFilename?: string;
}

export type FileSplitOptions = {
  partCount: number;
  maxRowsPerPart?: number;
  includeHeaders: boolean;
};
