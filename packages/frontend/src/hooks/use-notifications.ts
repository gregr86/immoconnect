import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type {
  NotificationsResponse,
  NotificationPreferences,
} from "@/types";

export function notificationsQueryOptions(limit?: number, offset?: number) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (offset) params.set("offset", String(offset));
  const qs = params.toString();

  return queryOptions({
    queryKey: ["notifications", limit, offset],
    queryFn: () =>
      apiFetch<NotificationsResponse>(
        `/api/notifications${qs ? `?${qs}` : ""}`,
      ),
  });
}

export function notificationUnreadCountQueryOptions() {
  return queryOptions({
    queryKey: ["notification-unread-count"],
    queryFn: () =>
      apiFetch<{ count: number }>("/api/notifications/unread-count"),
    refetchInterval: 15_000,
  });
}

export function notificationPreferencesQueryOptions() {
  return queryOptions({
    queryKey: ["notification-preferences"],
    queryFn: () =>
      apiFetch<NotificationPreferences>("/api/notifications/preferences"),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/notifications/${id}/read`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-unread-count"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<{ success: boolean }>("/api/notifications/read-all", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-unread-count"] });
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) =>
      apiFetch<{ success: boolean }>("/api/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });
}
