import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import CSVUpload from "@/components/CSVUpload";
import FilterPanel from "@/components/FilterPanel";
import CSVPreview from "@/components/CSVPreview";
import ExportModal from "@/components/ExportModal";
import RecentFilesPanel from "@/components/RecentFilesPanel";
import { 
  FileText,
  Download,
  Database,
  HelpCircle,
  Scissors,
} from "lucide-react";
import { CSVData, CSVStats, FilterOptions } from "@/types/csv";
import { 
  analyzeCSV, 
  applyFilters, 
  splitCSVFile,
  validateCSVDataAdvanced,
  getRecentFiles, 
  loadSavedCSVData,
  RecentFile
} from "@/utils/csvUtils";
import { useToast } from "@/components/ui/use-toast";

const emptyCSVData: CSVData = {
  headers: [],
  rows: [],
  rawData: "",
  totalRows: 0
};

const defaultStats: CSVStats = {
  totalRecords: 0,
  validPhoneNumbers: 0,
  duplicatePhoneNumbers: 0,
  emptyMessages: 0
};

const defaultFilters: FilterOptions = {
  phoneNumbers: {
    removeDuplicates: false,
    fixFormat: false
  },
  messages: 'all',
  templates: 'all',
  showOnlyMainColumns: true
};

const HomePage = () => {
  const { toast } = useToast();
  const [originalCSVData, setOriginalCSVData] = useState<CSVData>(emptyCSVData);
  const [filteredCSVData, setFilteredCSVData] = useState<CSVData>(emptyCSVData);
  const [stats, setStats] = useState<CSVStats>(defaultStats);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [exportType, setExportType] = useState<"omnichat" | "zenvia">("omnichat");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false);
  const [partsCount, setPartsCount] = useState(2);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [showRecentFiles, setShowRecentFiles] = useState(true);
  
  useEffect(() => {
    loadRecentFiles();
  }, []);
  
  const loadRecentFiles = () => {
    const files = getRecentFiles();
    setRecentFiles(files);
  };
  
  const handleFileUploaded = (data: CSVData) => {
    setIsLoading(true);
    
    setTimeout(() => {
      setOriginalCSVData(data);
      setFilteredCSVData(data);
      setStats(analyzeCSV(data));
      
      const validation = validateCSVDataAdvanced(data);
      if (!validation.isValid) {
        toast({
          title: "Avisos sobre o arquivo CSV",
          description: (
            <div>
              <p>Foram encontrados os seguintes problemas:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {validation.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          ),
          variant: "default",
        });
      }
      
      setFilters({...defaultFilters, showOnlyMainColumns: true});
      setIsLoading(false);
      
      toast({
        title: "Arquivo carregado com sucesso",
        description: `${data.totalRows} registros encontrados.`,
      });
      
      loadRecentFiles();
    }, 500);
  };

  const handleRecentFileSelect = async (file: RecentFile) => {
    setIsLoading(true);
    
    try {
      const data = await loadSavedCSVData(file.id);
      if (data) {
        setOriginalCSVData(data);
        setFilteredCSVData(data);
        setStats(analyzeCSV(data));
        setFilters({...defaultFilters, showOnlyMainColumns: true});
        
        toast({
          title: "Arquivo carregado com sucesso",
          description: `${file.name} com ${data.totalRows} registros.`,
        });
      } else {
        toast({
          title: "Erro ao carregar arquivo",
          description: "Não foi possível carregar os dados do arquivo selecionado.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar arquivo recente:", error);
      toast({
        title: "Erro ao carregar arquivo",
        description: "Ocorreu um erro ao tentar carregar o arquivo selecionado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setIsLoading(true);
    
    setTimeout(() => {
      const filtered = applyFilters(originalCSVData, newFilters);
      setFilteredCSVData(filtered);
      
      if ((filtered as any).stats) {
        setStats((filtered as any).stats);
      } else {
        setStats(analyzeCSV(filtered));
      }
      
      setIsLoading(false);
    }, 100);
  };
  
  const handleResetFilters = () => {
    const resetFilters = {...defaultFilters, showOnlyMainColumns: true};
    setFilters(resetFilters);
    setFilteredCSVData(originalCSVData);
    setStats(analyzeCSV(originalCSVData));
  };
  
  const handleExport = (type: "omnichat" | "zenvia") => {
    setExportType(type);
    setIsExportModalOpen(true);
  };

  const handleHelpClick = () => {
    window.location.href = '/help';
  };
  
  const handleSplitFile = () => {
    if (filteredCSVData.rows.length <= 1) {
      toast({
        title: "Erro",
        description: "Arquivo muito pequeno para dividir.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSplitDialogOpen(true);
  };
  
  const executeSplit = () => {
    if (partsCount < 2 || partsCount > 10) {
      toast({
        title: "Valor inválido",
        description: "O número de partes deve estar entre 2 e 10.",
        variant: "destructive",
      });
      return;
    }
    
    const rowsPerPart = Math.ceil(filteredCSVData.rows.length / partsCount);
    const parts = splitCSVFile(filteredCSVData, rowsPerPart);
    
    parts.forEach((part, index) => {
      const blob = new Blob([convertToCSVString(part.headers, part.rows)], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `parte_${index + 1}_de_${parts.length}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      
      setTimeout(() => {
        link.click();
        document.body.removeChild(link);
      }, index * 500);
    });
    
    setIsSplitDialogOpen(false);
    
    toast({
      title: "Arquivo dividido com sucesso",
      description: `O arquivo foi dividido em ${parts.length} partes.`,
      variant: "default",
    });
  };
  
  const convertToCSVString = (headers: string[], rows: string[][]): string => {
    const headerLine = headers.join(',');
    const rowLines = rows.map(row => row.map(cell => {
      if (cell.includes('"') || cell.includes(',') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(','));
    
    return [headerLine, ...rowLines].join('\n');
  };

  const hasData = originalCSVData.headers.length > 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">CSV Sync Manager v1.2</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Upload, gerenciamento e exportação de CSV para OmniChat e Zenvia
          </p>
        </div>
        
        {hasData && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="space-x-2"
              onClick={() => handleExport("omnichat")}
            >
              <Database className="h-4 w-4" />
              <span>Exportar para OmniChat</span>
            </Button>
            <Button
              className="space-x-2"
              onClick={() => handleExport("zenvia")}
            >
              <Download className="h-4 w-4" />
              <span>Exportar para Zenvia</span>
            </Button>
            <Button
              variant="secondary"
              className="space-x-2"
              onClick={handleSplitFile}
            >
              <Scissors className="h-4 w-4" />
              <span>Dividir Arquivo</span>
            </Button>
            <Button
              variant="ghost"
              className="space-x-2"
              onClick={handleHelpClick}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Ajuda</span>
            </Button>
          </div>
        )}
      </div>
      
      {!hasData ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <CSVUpload onFileUploaded={handleFileUploaded} />
            
            {recentFiles.length > 0 && (
              <div className="mt-6">
                <Button 
                  variant="ghost" 
                  className="text-sm mb-2"
                  onClick={() => setShowRecentFiles(!showRecentFiles)}
                >
                  {showRecentFiles ? "Ocultar arquivos recentes" : "Mostrar arquivos recentes"}
                </Button>
                
                {showRecentFiles && (
                  <RecentFilesPanel 
                    files={recentFiles} 
                    onFileSelect={handleRecentFileSelect}
                  />
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col justify-center items-center p-6 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <FileText className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum arquivo CSV carregado</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
              Faça upload de um arquivo CSV para visualizar e gerenciar seu conteúdo
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <FilterPanel 
            stats={stats}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onResetFilters={handleResetFilters}
          />
          
          <CSVPreview 
            data={filteredCSVData} 
            isLoading={isLoading} 
            showOnlyMainColumns={filters.showOnlyMainColumns} 
          />
          
          <ExportModal 
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            exportType={exportType}
            csvData={filteredCSVData}
            delimiter={exportType === 'zenvia' ? ';' : ','}
          />
          
          <AlertDialog 
            open={isSplitDialogOpen} 
            onOpenChange={setIsSplitDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Dividir arquivo CSV</AlertDialogTitle>
                <AlertDialogDescription>
                  Escolha em quantas partes você deseja dividir o arquivo com {filteredCSVData.rows.length} registros.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Número de partes:</span>
                  <Input
                    type="number"
                    min={2}
                    max={10}
                    value={partsCount}
                    onChange={(e) => setPartsCount(parseInt(e.target.value) || 2)}
                    className="w-20"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Isso criará {partsCount} arquivos separados com aproximadamente {Math.ceil(filteredCSVData.rows.length / partsCount)} registros cada.
                </p>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={executeSplit}>Dividir e Baixar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};

export default HomePage;
