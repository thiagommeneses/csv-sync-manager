import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export interface ExportRecord {
  id?: string;
  name: string;
  type: 'omnichat' | 'zenvia' | 'import';
  exported_at: string;
  row_count: number;
  file_size?: number;
  theme?: string | null;
  scheduled_for?: string | null;
}

export const saveExportHistory = async (record: Omit<ExportRecord, 'id' | 'exported_at'>): Promise<ExportRecord | null> => {
  try {
    const newRecord = {
      ...record,
      exported_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('export_history')
      .insert(newRecord)
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao salvar histórico de exportação:', error);
      return null;
    }
    
    // Ensure the type is properly cast
    return data ? {
      ...data,
      type: data.type as 'omnichat' | 'zenvia' | 'import',
    } : null;
  } catch (error) {
    console.error('Erro ao salvar histórico de exportação:', error);
    return null;
  }
};

export const saveImportHistory = async (fileName: string, rowCount: number, fileSize?: number): Promise<ExportRecord | null> => {
  return saveExportHistory({
    name: fileName,
    type: 'import',
    row_count: rowCount,
    file_size: fileSize
  });
};

export const getExportHistory = async (): Promise<ExportRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('export_history')
      .select('*')
      .order('exported_at', { ascending: false })
      .limit(100);
      
    if (error) {
      console.error('Erro ao obter histórico de exportação:', error);
      return [];
    }
    
    // Ensure the type is properly cast for each record
    return data ? data.map(record => ({
      ...record,
      type: record.type as 'omnichat' | 'zenvia' | 'import'
    })) : [];
  } catch (error) {
    console.error('Erro ao obter histórico de exportação:', error);
    return [];
  }
};

export const deleteExportRecord = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('export_history')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Erro ao excluir registro de exportação:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir registro de exportação:', error);
    return false;
  }
};

export const clearAllExportHistory = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('export_history')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This deletes all records
      
    if (error) {
      console.error('Erro ao limpar histórico de exportação:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao limpar histórico de exportação:', error);
    return false;
  }
};
