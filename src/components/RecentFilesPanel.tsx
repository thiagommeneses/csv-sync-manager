
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, Table, HardDrive } from "lucide-react";
import { RecentFile } from "@/types/csv";

interface RecentFilesPanelProps {
  files: RecentFile[];
  onFileSelect: (file: RecentFile) => void;
}

const RecentFilesPanel = ({ files, onFileSelect }: RecentFilesPanelProps) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Format file size for display
  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined) return "Desconhecido";
    
    if (bytes < 1024) {
      return bytes + " B";
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }
  };

  return (
    <Card className="border-blue-100 dark:border-blue-900">
      <CardHeader className="py-3 bg-blue-50 dark:bg-blue-900/30 rounded-t-lg">
        <CardTitle className="text-sm flex items-center gap-1 text-blue-700 dark:text-blue-300">
          <Calendar className="h-4 w-4" />
          Arquivos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="space-y-2">
          {files.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum arquivo recente</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-auto">
              {files.map((file) => (
                <div 
                  key={file.id}
                  className="flex items-start gap-3 p-2 text-sm border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => onFileSelect(file)}
                  title="Clique para usar este arquivo"
                >
                  <FileText className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                  <div className="overflow-hidden flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(file.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Table className="h-3 w-3" />
                        {file.rows} registros
                      </div>
                      {file.size !== undefined && (
                        <div className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {formatFileSize(file.size)}
                        </div>
                      )}
                    </div>
                    {file.preview && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        Amostra: {file.preview}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentFilesPanel;
