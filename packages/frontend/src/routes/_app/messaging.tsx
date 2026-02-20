import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  conversationsQueryOptions,
  conversationDetailQueryOptions,
  messagesQueryOptions,
  useSendMessage,
  useMarkAsRead,
} from "@/hooks/use-messaging";
import { ConversationList } from "@/components/messaging/conversation-list";
import { ChatHeader } from "@/components/messaging/chat-header";
import { MessageBubble } from "@/components/messaging/message-bubble";
import { DateSeparator } from "@/components/messaging/date-separator";
import { MessageInput } from "@/components/messaging/message-input";
import { ContextPanel } from "@/components/messaging/context-panel";
import { EmptyState } from "@/components/messaging/empty-state";
import { formatMessageDate } from "@/lib/format";
import type { Message } from "@/types";

export const Route = createFileRoute("/_app/messaging")({
  component: MessagingPage,
  validateSearch: (search: Record<string, unknown>) => ({
    conversation: (search.conversation as string) || undefined,
  }),
});

function MessagingPage() {
  const navigate = useNavigate();
  const { conversation: selectedId } = Route.useSearch();
  const { data: sessionData } = useSession();
  const currentUserId = sessionData?.user?.id;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Conversations list
  const { data: convData, isLoading: convLoading } = useQuery(
    conversationsQueryOptions(),
  );
  const conversations = convData?.items ?? [];

  // Selected conversation detail
  const { data: detail } = useQuery(
    conversationDetailQueryOptions(selectedId ?? ""),
  );

  // Messages
  const { data: messagesData, isLoading: msgsLoading } = useQuery(
    messagesQueryOptions(selectedId ?? ""),
  );

  // Mutations
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  // Mark as read on select
  useEffect(() => {
    if (selectedId) {
      markAsRead.mutate(selectedId);
    }
  }, [selectedId]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messagesData?.items) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesData?.items?.length]);

  const handleSelect = (id: string) => {
    navigate({
      to: "/messaging",
      search: { conversation: id },
      replace: true,
    });
  };

  const handleSend = (content: string, file?: File) => {
    if (!selectedId) return;
    sendMessage.mutate(
      { conversationId: selectedId, content: content || undefined, file },
      {
        onSuccess: () => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        },
      },
    );
  };

  // Reverse messages (API returns desc) and group by date
  const messages = useMemo(
    () => [...(messagesData?.items ?? [])].reverse(),
    [messagesData?.items],
  );

  const messagesWithDates = useMemo(() => {
    const result: Array<{ type: "date"; date: string } | { type: "message"; message: Message }> = [];
    let lastDate = "";

    for (const msg of messages) {
      const msgDate = formatMessageDate(msg.createdAt);
      if (msgDate !== lastDate) {
        result.push({ type: "date", date: msg.createdAt });
        lastDate = msgDate;
      }
      result.push({ type: "message", message: msg });
    }

    return result;
  }, [messages]);

  return (
    <div className="flex h-full -m-6">
      {/* Left: Conversation List */}
      <ConversationList
        conversations={conversations}
        selectedId={selectedId ?? null}
        onSelect={handleSelect}
      />

      {/* Center: Chat */}
      {selectedId && detail ? (
        <div className="flex-1 flex flex-col min-w-0">
          <ChatHeader detail={detail} currentUserId={currentUserId ?? ""} />

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 bg-background"
          >
            {msgsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {messagesData?.hasMore && (
              <div className="text-center mb-4">
                <button className="text-xs text-primary hover:underline">
                  Charger les messages précédents
                </button>
              </div>
            )}

            {messagesWithDates.map((item, i) => {
              if (item.type === "date") {
                return <DateSeparator key={`date-${i}`} date={item.date} />;
              }
              return (
                <MessageBubble
                  key={item.message.id}
                  message={item.message}
                  isOwn={item.message.senderId === currentUserId}
                />
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          <MessageInput
            onSend={handleSend}
            disabled={sendMessage.isPending}
          />
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Right: Context Panel */}
      {selectedId && detail && <ContextPanel detail={detail} />}
    </div>
  );
}
