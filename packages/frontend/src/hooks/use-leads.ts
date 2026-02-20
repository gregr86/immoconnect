import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Lead, LeadsResponse, LeadStats } from "@/types";

export function leadsQueryOptions(status?: string, search?: string, page?: number) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  if (page) params.set("page", String(page));
  const qs = params.toString();

  return queryOptions({
    queryKey: ["leads", status, search, page],
    queryFn: () =>
      apiFetch<LeadsResponse>(`/api/leads${qs ? `?${qs}` : ""}`),
  });
}

export function leadStatsQueryOptions() {
  return queryOptions({
    queryKey: ["lead-stats"],
    queryFn: () => apiFetch<LeadStats>("/api/leads/stats"),
  });
}

export function leadDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["lead", id],
    queryFn: () => apiFetch<Lead>(`/api/leads/${id}`),
    enabled: !!id,
  });
}

export function useSubmitLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      propertyType?: string;
      city?: string;
      surface?: string;
      budget?: string;
      contactName: string;
      contactEmail: string;
      contactPhone?: string;
    }) =>
      apiFetch<Lead>("/api/leads", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-stats"] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      apiFetch<Lead>(`/api/leads/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead"] });
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      rejectedReason,
    }: {
      id: string;
      status: string;
      rejectedReason?: string;
    }) =>
      apiFetch<Lead>(`/api/leads/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, rejectedReason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead"] });
      queryClient.invalidateQueries({ queryKey: ["lead-stats"] });
    },
  });
}

export function useUpdateLeadCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      estimatedCommission,
      paidCommission,
    }: {
      id: string;
      estimatedCommission?: number;
      paidCommission?: number;
    }) =>
      apiFetch<Lead>(`/api/leads/${id}/commission`, {
        method: "PUT",
        body: JSON.stringify({ estimatedCommission, paidCommission }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead"] });
      queryClient.invalidateQueries({ queryKey: ["lead-stats"] });
    },
  });
}
