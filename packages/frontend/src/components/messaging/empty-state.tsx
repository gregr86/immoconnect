import { MessageSquare } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-heading font-bold text-lg">Messagerie</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Sélectionnez une conversation pour commencer à échanger avec vos
          contacts.
        </p>
      </div>
    </div>
  );
}
