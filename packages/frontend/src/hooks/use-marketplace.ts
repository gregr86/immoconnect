import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { PartnerProfile, PartnerReview, Quote, QuotesResponse } from "@/types";

export function partnersQueryOptions(
  category?: string,
  city?: string,
  search?: string,
  sort?: string,
  page?: number,
) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (city) params.set("city", city);
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);
  if (page) params.set("page", String(page));
  const qs = params.toString();

  return queryOptions({
    queryKey: ["partners", category, city, search, sort, page],
    queryFn: () =>
      apiFetch<{ items: PartnerProfile[]; total: number; page: number; limit: number }>(
        `/api/marketplace/partners${qs ? `?${qs}` : ""}`,
      ),
  });
}

export function partnerDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["partner", id],
    queryFn: () =>
      apiFetch<PartnerProfile & { reviews: PartnerReview[] }>(
        `/api/marketplace/partners/${id}`,
      ),
    enabled: !!id,
  });
}

export function myQuotesQueryOptions(status?: string, page?: number) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page) params.set("page", String(page));
  const qs = params.toString();

  return queryOptions({
    queryKey: ["quotes", status, page],
    queryFn: () =>
      apiFetch<QuotesResponse>(
        `/api/marketplace/quotes${qs ? `?${qs}` : ""}`,
      ),
  });
}

export function quoteDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["quote", id],
    queryFn: () => apiFetch<Quote>(`/api/marketplace/quotes/${id}`),
    enabled: !!id,
  });
}

export function useRequestQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { partnerId: string; description: string; propertyId?: string }) =>
      apiFetch<Quote>("/api/marketplace/quotes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      status?: string;
      amount?: number;
      responseMessage?: string;
      validUntil?: string;
      pdfPath?: string;
    }) =>
      apiFetch<Quote>(`/api/marketplace/quotes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote"] });
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { partnerId: string; rating: number; comment?: string }) =>
      apiFetch("/api/marketplace/reviews", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
}
