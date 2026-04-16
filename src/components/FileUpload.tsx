import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatFileSize, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/lib/fileUpload';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  id: string;
  label: string;
  description?: string;
  accept?: string;
  maxSize?: number;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  previewUrl?: string | null;
  isUploading?: boolean;
  uploadProgress?: number;
}

export function FileUpload({
  id,
  label,
  description,
  accept = '*',
  maxSize = MAX_FILE_SIZE,
  value,
  onChange,
  error,
  previewUrl,
  isUploading = false,
  uploadProgress = 0,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`;
    }
    return null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setLocalError(validationError);
        return;
      }
      setLocalError(null);
      onChange(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setLocalError(validationError);
        return;
      }
      setLocalError(null);
      onChange(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setLocalError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const displayError = error || localError;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium flex items-center gap-2">
        {label}
      </label>
      
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="file-selected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative p-4 rounded-xl border-2 border-dashed border-primary/50 bg-primary/5"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {previewUrl && value.type.startsWith('image/') ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <FileText className="w-6 h-6 text-primary" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{value.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(value.size)}</p>
                
                {isUploading && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
                
                {!isUploading && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                    <Check className="w-3 h-3" />
                    <span>Ready to upload</span>
                  </div>
                )}
              </div>
              
              {!isUploading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "relative p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
              dragOver
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border bg-muted/50 hover:border-primary/50 hover:bg-muted"
            )}
          >
            <input
              ref={inputRef}
              id={id}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex flex-col items-center text-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                dragOver ? "bg-primary text-primary-foreground" : "bg-background"
              )}>
                <Upload className="w-5 h-5" />
              </div>
              
              <div>
                <p className="font-medium text-sm">
                  <span className="text-primary">Click to upload</span> or drag and drop
                </p>
                {description && (
                  <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {displayError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-1.5 text-xs text-destructive"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{displayError}</span>
        </motion.div>
      )}
    </div>
  );
}

interface FileUploadButtonProps {
  fileName?: string;
  isLoading?: boolean;
  onDownload?: () => void;
  onRemove?: () => void;
  variant?: 'default' | 'compact';
}

export function FileUploadButton({
  fileName,
  isLoading = false,
  onDownload,
  onRemove,
  variant = 'default',
}: FileUploadButtonProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        {fileName ? (
          <>
            <span className="text-sm truncate max-w-[150px]">{fileName}</span>
            <div className="flex gap-1">
              {onDownload && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onDownload}
                  disabled={isLoading}
                  className="h-7 w-7"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                </Button>
              )}
              {onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onRemove}
                  className="h-7 w-7 text-destructive hover:text-destructive"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">No file</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        {fileName ? (
          <p className="text-sm font-medium truncate">{fileName}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No file uploaded</p>
        )}
      </div>
      
      <div className="flex gap-1">
        {onDownload && fileName && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDownload}
            disabled={isLoading}
            className="h-8 w-8"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          </Button>
        )}
        {onRemove && fileName && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
