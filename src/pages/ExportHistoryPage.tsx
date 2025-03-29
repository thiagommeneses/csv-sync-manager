
import { useState, useEffect } from "react";
import { getExportHistory, ExportRecord, deleteExportRecord } from "@/services/exportHistory";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, RefreshCw, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const ExportHistoryPage = () => {
  const { toast } = useToast();
  const [history, setHistory] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    const data = await getExportHistory();
    setHistory(data);
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const success = await deleteExportRecord(id);
    
    if (success) {
      setHistory(history.filter(record => record.id !== id));
      toast({
        title: "Registro excluído",
        description: "O registro foi excluído com sucesso.",
      });
    } else {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o registro. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
    
    setDeletingId(null);
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Histórico de Exportações</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Histórico completo de arquivos CSV exportados
          </p>
        </div>
        
        <Button onClick={loadHistory} variant="outline" size="sm" className="space-x-1">
          <RefreshCw className="h-4 w-4 mr-1" />
          <span>Atualizar</span>
        </Button>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <Table>
          <TableCaption>Histórico de todas as exportações</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Arquivo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Registros</TableHead>
              <TableHead>Data de Exportação</TableHead>
              <TableHead>Agendado para</TableHead>
              <TableHead>Tema</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum registro de exportação encontrado
                </TableCell>
              </TableRow>
            ) : (
              history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium truncate max-w-xs" title={record.name}>
                    {record.name}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      record.type === 'omnichat' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                    }`}>
                      {record.type === 'omnichat' ? 'OmniChat' : 'Zenvia'}
                    </span>
                  </TableCell>
                  <TableCell>{record.row_count}</TableCell>
                  <TableCell>{formatDateTime(record.exported_at)}</TableCell>
                  <TableCell>{record.scheduled_for ? formatDateTime(record.scheduled_for) : '-'}</TableCell>
                  <TableCell>{record.theme || '-'}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          disabled={deletingId === record.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir registro</AlertDialogTitle>
                          <AlertDialogDescription>
                            Você tem certeza que deseja excluir este registro do histórico?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => record.id && handleDelete(record.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ExportHistoryPage;
