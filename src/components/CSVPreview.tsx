
import { useState } from "react";
import { ArrowUp, ArrowDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CSVData } from "@/types/csv";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";

interface CSVPreviewProps {
  data: CSVData;
  isLoading?: boolean;
  showOnlyMainColumns?: boolean;
}

const CSVPreview = ({ data, isLoading = false, showOnlyMainColumns = false }: CSVPreviewProps) => {
  const [displayRows, setDisplayRows] = useState(50);
  const [sortColumn, setSortColumn] = useState<number>(-1);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const handleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
  };
  
  const getMainColumnIndexes = () => {
    const phoneIndex = data.headers.findIndex(h => h.toLowerCase().trim() === 'phone');
    const templateIndex = data.headers.findIndex(h => h.toLowerCase().trim() === 'template_title');
    const messageIndex = data.headers.findIndex(h => h.toLowerCase().trim() === 'reply_message_text');
    return [phoneIndex, templateIndex, messageIndex].filter(i => i !== -1);
  };
  
  const getVisibleColumns = () => {
    if (!showOnlyMainColumns) return data.headers.map((_, i) => i);
    return getMainColumnIndexes();
  };
  
  const visibleColumnIndexes = getVisibleColumns();
  
  const sortedRows = [...data.rows].sort((a, b) => {
    if (sortColumn === -1) return 0;
    
    const aValue = sortColumn < a.length ? a[sortColumn] : '';
    const bValue = sortColumn < b.length ? b[sortColumn] : '';
    
    if (aValue === bValue) return 0;
    const comparison = aValue.localeCompare(bValue, 'pt-BR', { numeric: true });
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const visibleRows = sortedRows.slice(0, displayRows);
  
  const handleLoadMore = () => {
    setDisplayRows(prev => Math.min(prev + 100, data.totalRows));
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
        ))}
      </div>
    );
  }

  if (!data.headers.length) {
    return (
      <div className="text-center p-12 border rounded-lg bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Nenhum dado para exibir</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-lg border shadow bg-white dark:bg-gray-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 px-4 py-3">#</TableHead>
            {visibleColumnIndexes.map(index => (
              <TableHead 
                key={index} 
                className="px-4 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => handleSort(index)}
              >
                <div className="flex items-center space-x-1">
                  <span>{data.headers[index]}</span>
                  {sortColumn === index && (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleRows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <TableCell className="px-4 py-3 text-gray-500">{rowIndex + 1}</TableCell>
              {visibleColumnIndexes.map(colIndex => (
                <TableCell key={colIndex} className="px-4 py-3">
                  {colIndex < row.length ? row[colIndex] : ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {displayRows < data.totalRows && (
        <div className="p-4 border-t text-center">
          <Button 
            variant="outline" 
            onClick={handleLoadMore}
            className="space-x-1"
          >
            <span>Carregar mais</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Exibindo {displayRows} de {data.totalRows} registros
          </p>
        </div>
      )}
    </div>
  );
};

export default CSVPreview;
