import { Upload, X, FileText, FileImage, File as FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  label: string;
  category: string;
  files: File[];
  onChange: (files: File[]) => void;
}

const iconByMime = (mime: string) => {
  if (mime.includes("pdf")) return FileText;
  if (mime.includes("image") || mime.includes("dwg")) return FileImage;
  return FileIcon;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function DocumentUpload({
  label,
  category,
  files,
  onChange,
}: DocumentUploadProps) {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = [...files, ...Array.from(e.target.files)];
      onChange(newFiles);
    }
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <h4 className="font-body font-medium text-sm text-foreground">{label}</h4>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const Icon = iconByMime(file.type);
            return (
              <div
                key={index}
                className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3"
              >
                <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add button */}
      <label
        className={cn(
          "flex items-center gap-2 border border-dashed rounded-lg p-3 cursor-pointer",
          "hover:border-primary/50 hover:bg-primary/5 transition-colors",
        )}
      >
        <Upload className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground font-body">
          Ajouter un document
        </span>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.dwg,.png,.jpg,.jpeg"
          multiple
          onChange={handleFileInput}
        />
      </label>
    </div>
  );
}
