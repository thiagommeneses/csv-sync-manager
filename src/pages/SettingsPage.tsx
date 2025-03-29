
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, MessageSquare, AlertTriangle, TrashIcon, Download, Trash2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { clearRecentFiles, getCurrentFile, saveCurrentFile } from "@/utils/csvUtils";
import { clearAllExportHistory } from "@/services/exportHistory";

// Define the structure of an error log entry
interface ErrorLog {
  id: string;
  timestamp: string;
  type: 'error' | 'warning';
  message: string;
  details?: string;
  component?: string;
}

const SettingsPage = () => {
  const [feedback, setFeedback] = useState("");
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  
  // Load error logs from localStorage on component mount
  useEffect(() => {
    const savedLogs = localStorage.getItem('csv-sync-error-logs');
    if (savedLogs) {
      try {
        setErrorLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error("Failed to parse saved error logs", e);
        // Initialize with empty array if parsing fails
        setErrorLogs([]);
      }
    }
  }, []);
  
  const handleSubmitFeedback = () => {
    if (feedback.trim().length < 5) {
      toast.error("Por favor, escreva uma sugestão com pelo menos 5 caracteres.");
      return;
    }
    
    // Here you would typically send the feedback to a backend
    console.log("Feedback submitted:", feedback);
    
    toast.success("Obrigado pelo seu feedback! Sua sugestão foi recebida.");
    setFeedback("");
  };
  
  const handleViewLogDetails = (log: ErrorLog) => {
    setSelectedLog(log);
    setShowLogDetails(true);
  };
  
  const handleClearLogs = () => {
    if (confirm("Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.")) {
      localStorage.removeItem('csv-sync-error-logs');
      setErrorLogs([]);
      toast.success("Todos os logs foram removidos com sucesso.");
    }
  };
  
  const handleDownloadLogs = () => {
    const logData = JSON.stringify(errorLogs, null, 2);
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `csv-sync-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Logs baixados com sucesso.");
  };
  
  const handleClearAllData = async () => {
    try {
      // Clear current file
      saveCurrentFile(null);
      
      // Clear all recent files from localStorage
      clearRecentFiles();
      
      // Clear logs
      localStorage.removeItem('csv-sync-error-logs');
      setErrorLogs([]);
      
      // Clear export history from database
      await clearAllExportHistory();
      
      // Clear any other app-specific data
      localStorage.removeItem('csv-sync-settings');
      localStorage.removeItem('csv-sync-filters');
      
      toast.success("Todos os dados do aplicativo foram removidos com sucesso.");
      setShowClearDataDialog(false);
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      toast.error("Ocorreu um erro ao tentar limpar os dados.");
    }
  };
  
  // For testing purposes - add some sample logs
  // This would be removed in production and logs would be added by the application
  useEffect(() => {
    if (errorLogs.length === 0) {
      const sampleLogs: ErrorLog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          type: 'error',
          message: 'Erro ao exportar para Zenvia',
          details: 'O serviço Zenvia retornou um erro de formato, mas o arquivo aparentemente foi gerado corretamente.',
          component: 'ExportModal'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          type: 'warning',
          message: 'Formato de CSV não reconhecido',
          details: 'O arquivo importado tem um formato não padrão que pode causar problemas de compatibilidade.',
          component: 'CSVUpload'
        }
      ];
      
      setErrorLogs(sampleLogs);
      localStorage.setItem('csv-sync-error-logs', JSON.stringify(sampleLogs));
    }
  }, [errorLogs.length]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>
      
      {/* Error Log Card */}
      <Card className="border-amber-100 dark:border-amber-900">
        <CardHeader className="bg-amber-50 dark:bg-amber-900/30 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Registro de Alertas e Erros
          </CardTitle>
          <CardDescription>
            Histórico de erros e alertas gerados durante o uso da aplicação
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {errorLogs.length === 0 ? (
            <Alert>
              <AlertTitle>Nenhum erro registrado</AlertTitle>
              <AlertDescription>
                Não há registros de erros ou alertas nesta sessão.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex justify-between mb-4">
                <span className="text-sm text-gray-500">{errorLogs.length} {errorLogs.length === 1 ? 'registro' : 'registros'}</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownloadLogs}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearLogs}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Limpar
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Data/Hora</TableHead>
                      <TableHead className="w-[100px]">Tipo</TableHead>
                      <TableHead>Mensagem</TableHead>
                      <TableHead className="w-[100px] text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errorLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {formatDate(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          {log.type === 'error' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                              <AlertTriangle className="h-3 w-3" />
                              Erro
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                              <AlertTriangle className="h-3 w-3" />
                              Alerta
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.message}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewLogDetails(log)}
                          >
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
          
          {/* Log details dialog */}
          <Dialog open={showLogDetails} onOpenChange={setShowLogDetails}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detalhes do {selectedLog?.type === 'error' ? 'Erro' : 'Alerta'}</DialogTitle>
                <DialogDescription>
                  Informações detalhadas sobre o registro
                </DialogDescription>
              </DialogHeader>
              
              {selectedLog && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 py-2 border-b">
                    <div className="font-medium">Tipo:</div>
                    <div className="col-span-2">
                      {selectedLog.type === 'error' ? 'Erro' : 'Alerta'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 py-2 border-b">
                    <div className="font-medium">Data/Hora:</div>
                    <div className="col-span-2">
                      {formatDate(selectedLog.timestamp)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 py-2 border-b">
                    <div className="font-medium">Mensagem:</div>
                    <div className="col-span-2">
                      {selectedLog.message}
                    </div>
                  </div>
                  
                  {selectedLog.component && (
                    <div className="grid grid-cols-3 gap-4 py-2 border-b">
                      <div className="font-medium">Componente:</div>
                      <div className="col-span-2">
                        {selectedLog.component}
                      </div>
                    </div>
                  )}
                  
                  {selectedLog.details && (
                    <div className="grid grid-cols-3 gap-4 py-2 border-b">
                      <div className="font-medium">Detalhes:</div>
                      <div className="col-span-2 whitespace-pre-wrap">
                        {selectedLog.details}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <DialogClose asChild>
                      <Button variant="secondary">Fechar</Button>
                    </DialogClose>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      
      {/* Clear All Data Card */}
      <Card className="border-red-100 dark:border-red-900">
        <CardHeader className="bg-red-50 dark:bg-red-900/30 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Limpar Dados da Aplicação
          </CardTitle>
          <CardDescription>
            Apagar todo o histórico, cache e arquivos enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Esta opção removerá todos os dados armazenados localmente pelo aplicativo, incluindo:
          </p>
          <ul className="list-disc pl-5 mb-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>Histórico de arquivos recentes</li>
            <li>Registros de logs e alertas</li>
            <li>Histórico de exportações</li>
            <li>Arquivo atual aberto</li>
            <li>Configurações e preferências salvas</li>
          </ul>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-red-500 font-medium">Esta ação não pode ser desfeita.</p>
            <Button 
              variant="destructive" 
              onClick={() => setShowClearDataDialog(true)}
              className="flex items-center gap-1"
            >
              <Database className="h-4 w-4" />
              Limpar Todos os Dados
            </Button>
          </div>
          
          <Dialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Limpar todos os dados</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja remover todos os dados da aplicação? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex justify-end space-x-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  variant="destructive" 
                  onClick={handleClearAllData}
                >
                  Limpar Todos os Dados
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Novos recursos em breve
          </CardTitle>
          <CardDescription>
            Estamos constantemente trabalhando para melhorar o CSV Sync Manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Nossa equipe está desenvolvendo novos recursos para tornar o gerenciamento de CSV ainda mais eficiente. 
            Fique atento às atualizações!
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            Envie suas sugestões
          </CardTitle>
          <CardDescription>
            Suas ideias são importantes para nós
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tem alguma sugestão para melhorar nossa plataforma? Compartilhe conosco!
          </p>
          
          <Textarea 
            placeholder="Escreva sua sugestão aqui..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[120px]"
          />
          
          <Button onClick={handleSubmitFeedback}>
            Enviar sugestão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
