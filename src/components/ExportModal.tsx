
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, AlertTriangle, AlertCircle, CheckCircle, Calendar, Clock, Tag } from "lucide-react";
import { CSVData } from "@/types/csv";
import { 
  exportToOmniChat, 
  exportToZenvia, 
  generateFileName,
  saveRecentFile 
} from "@/utils/csvUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: "omnichat" | "zenvia";
  csvData: CSVData;
  delimiter?: string;
}

const ExportModal = ({ isOpen, onClose, exportType, csvData, delimiter = ',' }: ExportModalProps) => {
  const [smsText, setSmsText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [statusColor, setStatusColor] = useState("text-green-500");
  const [statusEmoji, setStatusEmoji] = useState(<CheckCircle className="h-4 w-4" />);
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [theme, setTheme] = useState("");
  const [fileName, setFileName] = useState("");

  // Generate time options in 30-minute intervals
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeOptions.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  // Atualizar contagem de caracteres e status do SMS
  useEffect(() => {
    const count = smsText.length;
    setCharCount(count);

    if (count <= 130) {
      setStatusColor("text-green-500");
      setStatusEmoji(<CheckCircle className="h-4 w-4" />);
    } else if (count <= 159) {
      setStatusColor("text-yellow-500");
      setStatusEmoji(<AlertCircle className="h-4 w-4" />);
    } else {
      setStatusColor("text-red-500");
      setStatusEmoji(<AlertTriangle className="h-4 w-4" />);
    }
  }, [smsText]);

  // Atualizar nome do arquivo automaticamente quando as opções mudarem
  useEffect(() => {
    if (scheduledDate) {
      const dateTime = new Date(scheduledDate);
      const [hours, minutes] = scheduledTime.split(":").map(Number);
      dateTime.setHours(hours, minutes);
      
      const channel = exportType === "omnichat" ? "WhatsApp" : "SMS";
      const generatedFileName = generateFileName(channel, dateTime, theme);
      setFileName(generatedFileName);
    }
  }, [scheduledDate, scheduledTime, theme, exportType]);

  const handleTimeChange = (value: string) => {
    setScheduledTime(value);
  };

  const handleExport = () => {
    try {
      let csvContent: string;
      
      if (exportType === "omnichat") {
        csvContent = exportToOmniChat(csvData);
      } else {
        if (!smsText.trim()) {
          alert("Por favor, insira o texto do SMS para exportar para o Zenvia");
          return;
        }
        csvContent = exportToZenvia(csvData, smsText, delimiter);
      }
      
      // Usar o nome do arquivo personalizado ou gerar um padrão
      const downloadFileName = fileName || (exportType === "omnichat" ? "omnichat_export.csv" : "zenvia_export.csv");
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", downloadFileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Salvar na lista de arquivos recentes
      saveRecentFile(csvData, downloadFileName);
      
      onClose();
    } catch (error) {
      console.error("Erro na exportação:", error);
      alert("Falha ao exportar o arquivo CSV. Por favor, tente novamente.");
    }
  };

  const handleDatePicked = (date: Date | undefined) => {
    if (date) {
      setScheduledDate(date);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg animate-in fade-in-50 slide-in-from-bottom-10">
        <DialogHeader>
          <DialogTitle>
            {exportType === "omnichat" ? "Exportar para OmniChat" : "Exportar para Zenvia"}
          </DialogTitle>
          <DialogDescription>
            {exportType === "omnichat" 
              ? "Exporte seus dados no formato OmniChat com uma única coluna 'fullNumber'." 
              : "Exporte seus dados no formato Zenvia com as colunas 'celular' e 'sms'."}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full" onValueChange={(value) => setActiveTab(value as "basic" | "advanced")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 py-4">
            {exportType === "zenvia" && (
              <div className="space-y-2">
                <label htmlFor="sms-text" className="text-sm font-medium">
                  Texto da Mensagem SMS
                </label>
                <Textarea
                  id="sms-text"
                  placeholder="Digite sua mensagem SMS aqui..."
                  className="min-h-[100px]"
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  maxLength={160}
                />
                <div className={`flex items-center justify-between text-xs ${statusColor}`}>
                  <div className="flex items-center gap-1">
                    {statusEmoji}
                    <span>
                      {charCount <= 130 && "Comprimento recomendado"}
                      {charCount > 130 && charCount <= 159 && "Aviso: aproximando-se do limite"}
                      {charCount > 159 && "Crítico: mensagem muito longa"}
                    </span>
                  </div>
                  <span>
                    {charCount}/160 caracteres
                  </span>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Nomenclatura do Arquivo</h3>
                <p className="text-xs text-gray-500 mb-3">
                  O arquivo seguirá o padrão: V4-MKT_[CANAL]_DISPARO_[DATA]_[HORA]_[TEMA]_GERADO-[DATA-ATUAL]_[HORA-ATUAL].csv
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled-date" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Data do Disparo</span>
                  </Label>
                  <DatePicker 
                    date={scheduledDate} 
                    onSelect={handleDatePicked} 
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="scheduled-time" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Hora do Disparo</span>
                  </Label>
                  <Select 
                    value={scheduledTime} 
                    onValueChange={handleTimeChange}
                  >
                    <SelectTrigger id="scheduled-time" className="w-full">
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="theme" className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>Tema/Campanha (Opcional)</span>
                </Label>
                <Input
                  id="theme"
                  type="text"
                  placeholder="Ex: BlackFriday2025"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="file-name" className="text-sm font-medium">
                  Nome Final do Arquivo
                </Label>
                <Input
                  id="file-name"
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleExport}
            className="space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
