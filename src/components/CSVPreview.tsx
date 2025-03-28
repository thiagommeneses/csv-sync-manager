
import { useState } from "react";
import { ArrowUp, ArrowDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CSVData } from "@/types/csv";

interface CSVPreviewProps {
  data: CSVData;
  isLoading?: boolean;
}

const CSVPreview = ({ data, isLoading = false }: CSVPreviewProps) => {
  const [displayRows, setDisplayRows] = useState(10);
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
  
  const sortedRows = [...data.rows].sort((a, b) => {
    if (sortColumn === -1) return 0;
    
    const aValue = sortColumn < a.length ? a[sortColumn] : '';
    const bValue = sortColumn < b.length ? b[sortColumn] : '';
    
    if (aValue === bValue) return 0;
    const comparison = aValue.localeCompare(bValue, undefined, { numeric: true });
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
        <p className="text-gray-500 dark:text-gray-400">No data to display</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-lg border shadow bg-white dark:bg-gray-900">
      <table className="csv-table">
        <thead>
          <tr>
            <th className="w-10 px-4 py-3">#</th>
            {data.headers.map((header, index) => (
              <th 
                key={index} 
                className="px-4 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => handleSort(index)}
              >
                <div className="flex items-center space-x-1">
                  <span>{header}</span>
                  {sortColumn === index && (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-3 text-gray-500">{rowIndex + 1}</td>
              {data.headers.map((_, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3">
                  {cellIndex < row.length ? row[cellIndex] : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {displayRows < data.totalRows && (
        <div className="p-4 border-t text-center">
          <Button 
            variant="outline" 
            onClick={handleLoadMore}
            className="space-x-1"
          >
            <span>Load more</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Showing {displayRows} of {data.totalRows} records
          </p>
        </div>
      )}
    </div>
  );
};

export default CSVPreview;
