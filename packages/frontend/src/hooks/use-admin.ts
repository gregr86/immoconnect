import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Property } from "@/types";

interface ModerationItem extends Property {
  ownerName?: string;
  ownerEmail?: string;
}

export function moderationQueryOptions() {
  return queryOptions({
    queryKey: ["admin", "moderation"],
    queryFn: () =>
      apiFetch<{ items: ModerationItem[] }>("/api/admin/moderation"),
  });
}

export function useValidateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/admin/${id}/validate`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "moderation"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useRejectProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch<{ success: boolean }>(`/api/admin/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "moderation"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
