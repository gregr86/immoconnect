import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { SearchResponse, SearchCriteria } from "@/types";
import type { SearchFilters } from "@/lib/schemas/search";

export function searchQueryOptions(
  criteria: SearchFilters,
  sortBy: string = "score",
  sortOrder: string = "desc",
  bounds?: string,
  page: number = 1,
) {
  const params = new URLSearchParams();

  if (criteria.types.length > 0) params.set("types", criteria.types.join(","));
  if (criteria.city) params.set("city", criteria.city);
  if (criteria.lat !== null) params.set("lat", String(criteria.lat));
  if (criteria.lng !== null) params.set("lng", String(criteria.lng));
  if (criteria.radius !== 10) params.set("radius", String(criteria.radius));
  if (criteria.surfaceMin) params.set("surfaceMin", criteria.surfaceMin);
  if (criteria.surfaceMax) params.set("surfaceMax", criteria.surfaceMax);
  if (criteria.rentMin) params.set("rentMin", criteria.rentMin);
  if (criteria.rentMax) params.set("rentMax", criteria.rentMax);
  if (criteria.accessibility) params.set("accessibility", "true");
  if (criteria.parking) params.set("parking", "true");
  if (criteria.airConditioning) params.set("airConditioning", "true");
  params.set("sortBy", sortBy);
  params.set("sortOrder", sortOrder);
  if (bounds) params.set("bounds", bounds);
  params.set("page", String(page));

  const qs = params.toString();

  return queryOptions({
    queryKey: ["search", criteria, sortBy, sortOrder, bounds, page],
    queryFn: () => apiFetch<SearchResponse>(`/api/search?${qs}`),
  });
}

export function savedCriteriaQueryOptions() {
  return queryOptions({
    queryKey: ["search-criteria"],
    queryFn: () =>
      apiFetch<{ items: SearchCriteria[] }>("/api/search/criteria"),
  });
}

export function useSaveSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<SearchCriteria, "id" | "userId" | "createdAt" | "updatedAt">,
    ) =>
      apiFetch<{ id: string }>("/api/search/criteria", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search-criteria"] });
    },
  });
}

export function useDeleteSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/search/criteria/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search-criteria"] });
    },
  });
}
