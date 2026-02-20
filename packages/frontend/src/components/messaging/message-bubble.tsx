import { Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize, getFileIconStyle } from "@/lib/format";
import type { Message } from "@/types";

export function MessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  const time = new Date(message.createdAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn("flex mb-3", isOwn ? "justify-end" : "justify-start")}
    >
      <div className={cn("max-w-[70%]")}>
        {!isOwn && message.sender && (
          <p className="text-xs text-muted-foreground mb-1 ml-1">
            {message.sender.name}
          </p>
        )}

        {message.content && (
          <div
            className={cn(
              "px-4 py-2.5 text-sm",
              isOwn
                ? "bg-primary text-primary-foreground rounded-2xl rounded-br-none"
                : "bg-secondary text-foreground rounded-2xl rounded-bl-none",
            )}
          >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        )}

        {message.attachments.map((att) => {
          const style = getFileIconStyle(att.mimeType);
          return (
            <a
              key={att.id}
              href={`/api/messaging/attachments/${att.id}/${att.fileName}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl mt-1 transition-colors",
                isOwn
                  ? "bg-primary/90 text-primary-foreground hover:bg-primary/80"
                  : "bg-secondary hover:bg-secondary/80",
              )}
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                  style.bgClass,
                )}
              >
                <FileText className={cn("h-5 w-5", style.textClass)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {att.originalName}
                </p>
                <p
                  className={cn(
                    "text-xs",
                    isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {formatFileSize(att.size)}
                </p>
              </div>
              <Download
                className={cn(
                  "h-4 w-4 shrink-0",
                  isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              />
            </a>
          );
        })}

        <p
          className={cn(
            "text-[10px] mt-1",
            isOwn ? "text-right text-muted-foreground" : "text-muted-foreground",
          )}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
