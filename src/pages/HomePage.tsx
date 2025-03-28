import { useState } from "react";
import { Button } from "@/components/ui/button";
import CSVUpload from "@/components/CSVUpload";
import FilterPanel from "@/components/FilterPanel";
import CSVPreview from "@/components/CSVPreview";
import ExportModal from "@/components/ExportModal";
import { 
  FileText,
  Download,
  Database,
  HelpCircle,
} from "lucide-react";
import { CSVData, CSVStats, FilterOptions } from "@/types/csv";
import { analyzeCSV, applyFilters } from "@/utils/csvUtils";
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
  
  const handleFileUploaded = (data: CSVData) => {
    setIsLoading(true);
    
    // Simular um timeout de processamento para arquivos grandes
    setTimeout(() => {
      setOriginalCSVData(data);
      setFilteredCSVData(data);
      setStats(analyzeCSV(data));
      // Reset filters when new file is uploaded, but keep showOnlyMainColumns true
      setFilters({...defaultFilters, showOnlyMainColumns: true});
      setIsLoading(false);
      
      toast({
        title: "Arquivo carregado com sucesso",
        description: `${data.totalRows} registros encontrados.`,
      });
    }, 500);
  };
  
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setIsLoading(true);
    
    // Simular processamento para permitir que a UI atualize
    setTimeout(() => {
      const filtered = applyFilters(originalCSVData, newFilters);
      setFilteredCSVData(filtered);
      
      // Verificar se há estatísticas adicionais disponíveis
      if ((filtered as any).stats) {
        setStats((filtered as any).stats);
      } else {
        setStats(analyzeCSV(filtered));
      }
      
      setIsLoading(false);
    }, 100);
  };
  
  const handleResetFilters = () => {
    // Mantém a opção de mostrar apenas colunas principais ao resetar
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

  const hasData = originalCSVData.headers.length > 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">CSV Sync Manager</h1>
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
        </div>
      )}
    </div>
  );
};

export default HomePage;
