
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
} from "lucide-react";
import { CSVData, CSVStats, FilterOptions } from "@/types/csv";
import { analyzeCSV, applyFilters } from "@/utils/csvUtils";

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
  phoneNumbers: 'all',
  messages: 'all',
  templates: 'all'
};

const HomePage = () => {
  const [originalCSVData, setOriginalCSVData] = useState<CSVData>(emptyCSVData);
  const [filteredCSVData, setFilteredCSVData] = useState<CSVData>(emptyCSVData);
  const [stats, setStats] = useState<CSVStats>(defaultStats);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [exportType, setExportType] = useState<"omnichat" | "zenvia">("omnichat");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const handleFileUploaded = (data: CSVData) => {
    setOriginalCSVData(data);
    setFilteredCSVData(data);
    setStats(analyzeCSV(data));
    // Reset filters when new file is uploaded
    setFilters(defaultFilters);
  };
  
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    const filtered = applyFilters(originalCSVData, newFilters);
    setFilteredCSVData(filtered);
    setStats(analyzeCSV(filtered));
  };
  
  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setFilteredCSVData(originalCSVData);
    setStats(analyzeCSV(originalCSVData));
  };
  
  const handleExport = (type: "omnichat" | "zenvia") => {
    setExportType(type);
    setIsExportModalOpen(true);
  };

  const hasData = originalCSVData.headers.length > 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">CSV Sync Manager</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Upload, manage and export CSV files for OmniChat and Zenvia
          </p>
        </div>
        
        {hasData && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="space-x-2"
              onClick={() => handleExport("omnichat")}
            >
              <Database className="h-4 w-4" />
              <span>Export for OmniChat</span>
            </Button>
            <Button
              className="space-x-2"
              onClick={() => handleExport("zenvia")}
            >
              <Download className="h-4 w-4" />
              <span>Export for Zenvia</span>
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
            <h3 className="text-lg font-medium mb-2">No CSV File Loaded</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
              Upload a CSV file to view and manage its contents
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
          
          <CSVPreview data={filteredCSVData} />
          
          <ExportModal 
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            exportType={exportType}
            csvData={filteredCSVData}
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;
