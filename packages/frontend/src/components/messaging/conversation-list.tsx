import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Conversation } from "@/types";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? conversations.filter(
        (c) =>
          c.property?.title?.toLowerCase().includes(search.toLowerCase()) ||
          c.participants.some((p) =>
            p.name.toLowerCase().includes(search.toLowerCase()),
          ),
      )
    : conversations;

  return (
    <div className="w-80 border-r flex flex-col h-full bg-card">
      <div className="p-4 border-b shrink-0">
        <h2 className="font-heading font-bold text-lg mb-3">Messagerie</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary rounded-lg pl-9 pr-3 py-2 text-sm font-body outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground p-4 text-center">
            Aucune conversation
          </p>
        )}
        {filtered.map((conv) => {
          const otherParticipants = conv.participants.filter(
            (p) => p.userId !== conv.createdBy || conv.participants.length === 1,
          );
          const displayName =
            otherParticipants[0]?.name ?? conv.participants[0]?.name ?? "?";
          const displayCompany = otherParticipants[0]?.companyName;

          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors group",
                selectedId === conv.id
                  ? "bg-secondary"
                  : "hover:bg-secondary/50",
              )}
            >
              <div className="relative shrink-0">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-card" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm truncate">
                    {displayName}
                  </span>
                  {conv.lastMessage && (
                    <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                      {formatRelativeTime(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                {displayCompany && (
                  <p className="text-xs text-muted-foreground truncate">
                    {displayCompany}
                  </p>
                )}
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.lastMessage?.content ?? "Pièce jointe"}
                  </p>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {conv.unreadCount > 0 && (
                      <span className="h-5 min-w-5 px-1.5 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                        {conv.unreadCount}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
