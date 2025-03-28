
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { CSVData } from "@/types/csv";
import { exportToOmniChat, exportToZenvia } from "@/utils/csvUtils";

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

  const handleExport = () => {
    try {
      let csvContent: string;
      let filename: string;
      
      if (exportType === "omnichat") {
        csvContent = exportToOmniChat(csvData);
        filename = "omnichat_export.csv";
      } else {
        if (!smsText.trim()) {
          alert("Please enter SMS text for Zenvia export");
          return;
        }
        csvContent = exportToZenvia(csvData, smsText, delimiter);
        filename = "zenvia_export.csv";
      }
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export CSV file. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {exportType === "omnichat" ? "Export to OmniChat" : "Export to Zenvia"}
          </DialogTitle>
          <DialogDescription>
            {exportType === "omnichat" 
              ? "Export your data in OmniChat format with a single 'fullNumber' column." 
              : "Export your data in Zenvia format with 'celular' and 'sms' columns."}
          </DialogDescription>
        </DialogHeader>
        
        {exportType === "zenvia" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="sms-text" className="text-sm font-medium">
                SMS Message Text
              </label>
              <Textarea
                id="sms-text"
                placeholder="Enter your SMS message here..."
                className="min-h-[100px]"
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                maxLength={160}
              />
              <div className={`flex items-center justify-between text-xs ${statusColor}`}>
                <div className="flex items-center gap-1">
                  {statusEmoji}
                  <span>
                    {charCount <= 130 && "Recommended length"}
                    {charCount > 130 && charCount <= 159 && "Warning: approaching limit"}
                    {charCount > 159 && "Critical: message too long"}
                  </span>
                </div>
                <span>
                  {charCount}/160 characters
                </span>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            className="space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
