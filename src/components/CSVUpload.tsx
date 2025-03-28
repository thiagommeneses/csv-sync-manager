
import { useState, useCallback, useRef } from "react";
import { Upload, FileUp, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { parseCSV, validateCSVStructure } from "@/utils/csvUtils";
import { CSVData } from "@/types/csv";

interface CSVUploadProps {
  onFileUploaded: (data: CSVData) => void;
}

const CSVUpload = ({ onFileUploaded }: CSVUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Only CSV files are allowed');
      }

      // Check file size (50MB)
      const MAX_SIZE = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > MAX_SIZE) {
        throw new Error('File size exceeds the 50MB limit');
      }

      // Read file content
      const text = await file.text();
      const csvData = parseCSV(text);

      // Validate required columns
      if (!validateCSVStructure(csvData)) {
        throw new Error('CSV must contain required columns: phone, template_title, reply_message_text');
      }

      // Success
      toast.success(`File uploaded: ${file.name}`);
      onFileUploaded(csvData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setIsDragging(false);
    }
  }, [onFileUploaded]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, [processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  }, [processFile]);

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`dropzone ${isDragging ? 'dropzone-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-10 w-10 text-csvManager animate-spin mb-4" />
          ) : (
            <Upload className="h-10 w-10 text-csvManager mb-4" />
          )}
          <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
            Drag and drop your CSV file here, or click to select
          </p>
          <Button 
            variant="outline" 
            className="bg-white dark:bg-gray-800"
            disabled={isLoading}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Select File
          </Button>
          <p className="text-xs text-gray-400 mt-4">
            Maximum file size: 50MB
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CSVUpload;
