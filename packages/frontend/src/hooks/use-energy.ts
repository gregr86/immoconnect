import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { EnergyPropertiesResponse, EnergyProperty, EnergyStats } from "@/types";
import type { EnergyFilters } from "@/lib/schemas/energy";

export function energyPropertiesQueryOptions(
  filters: EnergyFilters,
  sortBy: string = "score",
  sortOrder: string = "desc",
  bounds?: string,
  page: number = 1,
) {
  const params = new URLSearchParams();

  if (filters.roofSurfaceMin) params.set("roofSurfaceMin", filters.roofSurfaceMin);
  if (filters.parkingSurfaceMin) params.set("parkingSurfaceMin", filters.parkingSurfaceMin);
  if (filters.orientation) params.set("orientation", filters.orientation);
  if (filters.city) params.set("city", filters.city);
  if (filters.propertyType) params.set("propertyType", filters.propertyType);
  if (filters.scoreMin > 0) params.set("scoreMin", String(filters.scoreMin));
  params.set("sortBy", sortBy);
  params.set("sortOrder", sortOrder);
  if (bounds) params.set("bounds", bounds);
  params.set("page", String(page));

  const qs = params.toString();

  return queryOptions({
    queryKey: ["energy-properties", filters, sortBy, sortOrder, bounds, page],
    queryFn: () => apiFetch<EnergyPropertiesResponse>(`/api/energy/properties?${qs}`),
  });
}

export function energyPropertyDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["energy-property", id],
    queryFn: () => apiFetch<EnergyProperty>(`/api/energy/properties/${id}`),
    enabled: !!id,
  });
}

export function energyStatsQueryOptions() {
  return queryOptions({
    queryKey: ["energy-stats"],
    queryFn: () => apiFetch<EnergyStats>("/api/energy/stats"),
  });
}

export function useCreatePvProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { propertyId: string; description: string }) =>
      apiFetch<{ id: string; reference: string }>("/api/energy/proposals", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["energy-properties"] });
    },
  });
}
