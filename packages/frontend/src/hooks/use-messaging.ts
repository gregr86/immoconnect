import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type {
  ConversationsResponse,
  ConversationDetail,
  MessagesResponse,
} from "@/types";

export function conversationsQueryOptions(search?: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const qs = params.toString();

  return queryOptions({
    queryKey: ["conversations", search],
    queryFn: () =>
      apiFetch<ConversationsResponse>(
        `/api/messaging/conversations${qs ? `?${qs}` : ""}`,
      ),
    refetchInterval: 10_000,
  });
}

export function conversationDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["conversation-detail", id],
    queryFn: () =>
      apiFetch<ConversationDetail>(`/api/messaging/conversations/${id}`),
    enabled: !!id,
  });
}

export function messagesQueryOptions(conversationId: string, before?: string) {
  const params = new URLSearchParams();
  if (before) params.set("before", before);
  const qs = params.toString();

  return queryOptions({
    queryKey: ["messages", conversationId, before],
    queryFn: () =>
      apiFetch<MessagesResponse>(
        `/api/messaging/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`,
      ),
    enabled: !!conversationId,
    refetchInterval: 5_000,
  });
}

export function unreadCountQueryOptions() {
  return queryOptions({
    queryKey: ["messaging-unread-count"],
    queryFn: () =>
      apiFetch<{ count: number }>("/api/messaging/unread-count"),
    refetchInterval: 15_000,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      propertyId: string;
      participantIds: string[];
      subject?: string;
    }) =>
      apiFetch<{ id: string }>("/api/messaging/conversations", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      file,
    }: {
      conversationId: string;
      content?: string;
      file?: File;
    }) => {
      if (file) {
        const formData = new FormData();
        if (content) formData.append("content", content);
        formData.append("file", file);

        const res = await fetch(
          `/api/messaging/conversations/${conversationId}/messages`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          },
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(body.error || res.statusText);
        }
        return res.json();
      }

      return apiFetch(
        `/api/messaging/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content }),
        },
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messaging-unread-count"] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      apiFetch<{ success: boolean }>(
        `/api/messaging/conversations/${conversationId}/read`,
        { method: "POST" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messaging-unread-count"] });
    },
  });
}
