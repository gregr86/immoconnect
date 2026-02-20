import { MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ConversationDetail } from "@/types";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ChatHeader({
  detail,
  currentUserId,
}: {
  detail: ConversationDetail;
  currentUserId: string;
}) {
  const other = detail.participants.find((p) => p.userId !== currentUserId);
  const displayName = other?.name ?? detail.participants[0]?.name ?? "?";
  const displayCompany = other?.companyName;
  const propertyRef = detail.property?.title;

  return (
    <div className="h-16 px-4 border-b flex items-center justify-between bg-card shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-card" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-sm">{displayName}</span>
            {displayCompany && (
              <span className="text-xs text-muted-foreground">
                · {displayCompany}
              </span>
            )}
          </div>
          {propertyRef && (
            <p className="text-xs text-muted-foreground">
              Réf : {propertyRef}
            </p>
          )}
        </div>
      </div>

      <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
        <MoreVertical className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  );
}
