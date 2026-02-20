import { queryOptions, useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Subscription, Invoice, SubscriptionPlanInfo } from "@/types";

export function plansQueryOptions() {
  return queryOptions({
    queryKey: ["subscription-plans"],
    queryFn: () =>
      apiFetch<{ plans: SubscriptionPlanInfo[] }>("/api/subscriptions/plans"),
  });
}

export function currentSubscriptionQueryOptions() {
  return queryOptions({
    queryKey: ["subscription-current"],
    queryFn: () =>
      apiFetch<{ subscription: Subscription | null }>(
        "/api/subscriptions/current",
      ),
  });
}

export function invoicesQueryOptions(page: number = 1) {
  return queryOptions({
    queryKey: ["invoices", page],
    queryFn: () =>
      apiFetch<{ items: Invoice[]; page: number; limit: number }>(
        `/api/subscriptions/invoices?page=${page}`,
      ),
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (data: { planId: string; interval?: string }) =>
      apiFetch<{ url: string }>("/api/subscriptions/checkout", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });
}

export function useOpenPortal() {
  return useMutation({
    mutationFn: () =>
      apiFetch<{ url: string }>("/api/subscriptions/portal", {
        method: "POST",
      }),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });
}
