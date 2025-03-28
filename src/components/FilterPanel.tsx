
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FilterX, ChevronDown, ChevronUp } from "lucide-react";
import { FilterOptions } from "@/types/csv";
import { CSVStats } from "@/types/csv";

interface FilterPanelProps {
  stats: CSVStats;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onResetFilters: () => void;
}

const FilterPanel = ({ 
  stats, 
  filters, 
  onFiltersChange, 
  onResetFilters 
}: FilterPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleResetFilters = () => {
    onResetFilters();
  };

  return (
    <Card className="mb-6">
      <CardHeader className="py-4 flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <CardTitle className="text-lg">Advanced Filters</CardTitle>
          <CardDescription>Filter and analyze your CSV data</CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </Button>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="font-medium text-sm">Useful Information</div>
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Total Records:</span>
                  <span className="font-medium">{stats.totalRecords}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Valid Phone Numbers:</span>
                  <span className="font-medium">{stats.validPhoneNumbers}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Duplicate Phone Numbers:</span>
                  <span className="font-medium">{stats.duplicatePhoneNumbers}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Empty Messages:</span>
                  <span className="font-medium">{stats.emptyMessages}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone-filter">Phone Number Filter</Label>
              <Select 
                value={localFilters.phoneNumbers} 
                onValueChange={(value) => handleFilterChange('phoneNumbers', value)}
              >
                <SelectTrigger id="phone-filter">
                  <SelectValue placeholder="Select filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All numbers</SelectItem>
                  <SelectItem value="removeDuplicates">Remove duplicates</SelectItem>
                  <SelectItem value="fixFormat">Fix number format</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message-filter">Message Filter</Label>
              <Select 
                value={localFilters.messages} 
                onValueChange={(value) => handleFilterChange('messages', value)}
              >
                <SelectTrigger id="message-filter">
                  <SelectValue placeholder="Select filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All messages</SelectItem>
                  <SelectItem value="empty">Empty messages</SelectItem>
                  <SelectItem value="custom">Custom text</SelectItem>
                </SelectContent>
              </Select>
              
              {localFilters.messages === 'custom' && (
                <Input
                  type="text"
                  placeholder="Filter by text..."
                  className="mt-2"
                  value={localFilters.customMessageFilter || ''}
                  onChange={(e) => handleFilterChange('customMessageFilter', e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-filter">Template Filter</Label>
              <Select 
                value={localFilters.templates} 
                onValueChange={(value) => handleFilterChange('templates', value)}
              >
                <SelectTrigger id="template-filter">
                  <SelectValue placeholder="Select filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All templates</SelectItem>
                  <SelectItem value="empty">Empty templates</SelectItem>
                  <SelectItem value="custom">Custom template</SelectItem>
                </SelectContent>
              </Select>
              
              {localFilters.templates === 'custom' && (
                <Input
                  type="text"
                  placeholder="Filter by template..."
                  className="mt-2"
                  value={localFilters.customTemplateFilter || ''}
                  onChange={(e) => handleFilterChange('customTemplateFilter', e.target.value)}
                />
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={handleResetFilters}
              className="space-x-2"
            >
              <FilterX className="h-4 w-4" />
              <span>Reset Filters</span>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default FilterPanel;
