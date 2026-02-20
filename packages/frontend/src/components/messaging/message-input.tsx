import { useState, useRef, type KeyboardEvent } from "react";
import { Paperclip, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function MessageInput({
  onSend,
  disabled,
}: {
  onSend: (content: string, file?: File) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !selectedFile) return;

    onSend(trimmed, selectedFile ?? undefined);
    setText("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="border-t bg-card p-3 shrink-0">
      {selectedFile && (
        <div className="flex items-center gap-2 mb-2 px-2">
          <span className="text-xs bg-secondary rounded px-2 py-1">
            {selectedFile.name}
          </span>
          <button
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-xs text-destructive hover:underline"
          >
            Retirer
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.dwg,.zip,.rar,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setSelectedFile(file);
          }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-2.5 rounded-xl hover:bg-secondary transition-colors text-muted-foreground shrink-0"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message..."
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 bg-muted rounded-2xl px-4 py-2.5 text-sm font-body outline-none resize-none",
            "focus:ring-2 focus:ring-ring",
            "min-h-[40px] max-h-[120px]",
          )}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !selectedFile)}
          className={cn(
            "p-2.5 rounded-xl transition-colors shrink-0",
            text.trim() || selectedFile
              ? "bg-success text-success-foreground hover:bg-success/90"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
