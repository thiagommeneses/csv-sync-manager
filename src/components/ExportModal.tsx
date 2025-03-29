
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveExportHistory } from "@/services/exportHistory";
import { useToast } from "@/components/ui/use-toast";
import { exportToOmniChat, exportToZenvia, generateFileName, saveRecentFile } from "@/utils/csvUtils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: "omnichat" | "zenvia";
  csvData: CSVData;
  delimiter?: string;
}

// Helper component for SMS text input
const SMSInput = ({ smsText, setSmsText }: { smsText: string, setSmsText: (text: string) => void }) => {
  const [charCount, setCharCount] = useState(0);
  const [statusColor, setStatusColor] = useState("text-green-500");
  const [statusEmoji, setStatusEmoji] = useState(<CheckCircle className="h-4 w-4" />);
  
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
  
  return (
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
  );
};

// Helper component for advanced settings
const AdvancedSettings = ({ 
  scheduledDate, 
  setScheduledDate, 
  scheduledTime, 
  setScheduledTime, 
  theme, 
  setTheme, 
  fileName, 
  setFileName 
}: { 
  scheduledDate: Date, 
  setScheduledDate: (date: Date) => void,
  scheduledTime: string,
  setScheduledTime: (time: string) => void,
  theme: string,
  setTheme: (theme: string) => void,
  fileName: string,
  setFileName: (name: string) => void
}) => {
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeOptions.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  
  return (
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
            onSelect={setScheduledDate}
            disabled={false}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="scheduled-time" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Hora do Disparo</span>
          </Label>
          <Select 
            value={scheduledTime} 
            onValueChange={setScheduledTime}
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
  );
};

const ExportModal = ({ isOpen, onClose, exportType, csvData, delimiter = ',' }: ExportModalProps) => {
  const { toast } = useToast();
  const [smsText, setSmsText] = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [theme, setTheme] = useState("");
  const [fileName, setFileName] = useState("");

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

  const handleExport = async () => {
    try {
      let csvContent: string;
      
      if (exportType === "omnichat") {
        csvContent = exportToOmniChat(csvData);
      } else {
        if (!smsText.trim()) {
          toast({
            title: "Erro",
            description: "Por favor, insira o texto do SMS para exportar para o Zenvia",
            variant: "destructive",
          });
          return;
        }
        csvContent = exportToZenvia(csvData, smsText, delimiter);
      }
      
      const downloadFileName = fileName || (exportType === "omnichat" ? "omnichat_export.csv" : "zenvia_export.csv");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", downloadFileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      saveRecentFile(csvData, downloadFileName);
      
      // Salvar no histórico do Supabase
      const dateTime = new Date(scheduledDate);
      const [hours, minutes] = scheduledTime.split(":").map(Number);
      dateTime.setHours(hours, minutes);
      
      const fileSize = new Blob([csvContent]).size;
      
      await saveExportHistory({
        name: downloadFileName,
        type: exportType,
        row_count: csvData.rows.length,
        theme: theme || null,
        scheduled_for: dateTime.toISOString(),
        file_size: fileSize,
      });
      
      toast({
        title: "Exportação concluída",
        description: `O arquivo ${downloadFileName} foi exportado com sucesso`,
      });
      
      onClose();
    } catch (error) {
      console.error("Erro na exportação:", error);
      toast({
        title: "Falha na exportação",
        description: "Ocorreu um erro ao exportar o arquivo CSV. Por favor, tente novamente.",
        variant: "destructive",
      });
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
              <SMSInput smsText={smsText} setSmsText={setSmsText} />
            )}
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 py-4">
            <AdvancedSettings 
              scheduledDate={scheduledDate}
              setScheduledDate={setScheduledDate}
              scheduledTime={scheduledTime}
              setScheduledTime={setScheduledTime}
              theme={theme}
              setTheme={setTheme}
              fileName={fileName}
              setFileName={setFileName}
            />
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
