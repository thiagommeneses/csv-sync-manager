
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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

  const handlePhoneFilterChange = (option: 'removeDuplicates' | 'fixFormat', checked: boolean) => {
    const updatedPhoneFilters = {
      ...localFilters.phoneNumbers,
      [option]: checked
    };
    
    const updatedFilters = {
      ...localFilters,
      phoneNumbers: updatedPhoneFilters
    };
    
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
          <CardTitle className="text-lg">Filtros Avançados</CardTitle>
          <CardDescription>Filtre e analise seus dados CSV</CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </Button>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="font-medium text-sm">Informações Úteis</div>
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Total de Registros:</span>
                  <span className="font-medium">{stats.totalRecords}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Números Válidos:</span>
                  <span className="font-medium">{stats.validPhoneNumbers}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Números Duplicados:</span>
                  <span className="font-medium">{stats.duplicatePhoneNumbers}</span>
                </li>
                {localFilters.phoneNumbers.fixFormat && (
                  <li className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Números Corrigidos:</span>
                    <span className="font-medium">{stats.correctedPhoneNumbers || 0}</span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Mensagens Vazias:</span>
                  <span className="font-medium">{stats.emptyMessages}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <Label>Filtro de Números de Telefone</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="removeDuplicates" 
                    checked={localFilters.phoneNumbers.removeDuplicates}
                    onCheckedChange={(checked) => 
                      handlePhoneFilterChange('removeDuplicates', checked as boolean)
                    }
                  />
                  <Label htmlFor="removeDuplicates" className="cursor-pointer">
                    Remover duplicados
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="fixFormat" 
                    checked={localFilters.phoneNumbers.fixFormat}
                    onCheckedChange={(checked) => 
                      handlePhoneFilterChange('fixFormat', checked as boolean)
                    }
                  />
                  <Label htmlFor="fixFormat" className="cursor-pointer">
                    Corrigir formato dos números
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-filter">Filtro de Templates</Label>
              <Select 
                value={localFilters.templates} 
                onValueChange={(value) => handleFilterChange('templates', value)}
              >
                <SelectTrigger id="template-filter">
                  <SelectValue placeholder="Selecione o filtro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os templates</SelectItem>
                  <SelectItem value="empty">Templates vazios</SelectItem>
                  <SelectItem value="custom">Template personalizado</SelectItem>
                </SelectContent>
              </Select>
              
              {localFilters.templates === 'custom' && (
                <Input
                  type="text"
                  placeholder="Filtrar por template..."
                  className="mt-2"
                  value={localFilters.customTemplateFilter || ''}
                  onChange={(e) => handleFilterChange('customTemplateFilter', e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message-filter">Filtro de Mensagens</Label>
              <Select 
                value={localFilters.messages} 
                onValueChange={(value) => handleFilterChange('messages', value)}
              >
                <SelectTrigger id="message-filter">
                  <SelectValue placeholder="Selecione o filtro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as mensagens</SelectItem>
                  <SelectItem value="empty">Mensagens vazias</SelectItem>
                  <SelectItem value="custom">Texto personalizado</SelectItem>
                </SelectContent>
              </Select>
              
              {localFilters.messages === 'custom' && (
                <Input
                  type="text"
                  placeholder="Filtrar por texto..."
                  className="mt-2"
                  value={localFilters.customMessageFilter || ''}
                  onChange={(e) => handleFilterChange('customMessageFilter', e.target.value)}
                />
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={localFilters.showOnlyMainColumns}
                onCheckedChange={(checked) => handleFilterChange('showOnlyMainColumns', checked)}
                id="columns-toggle"
              />
              <Label htmlFor="columns-toggle" className="cursor-pointer">
                Mostrar apenas colunas principais
              </Label>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleResetFilters}
              className="space-x-2"
            >
              <FilterX className="h-4 w-4" />
              <span>Limpar Filtros</span>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default FilterPanel;
