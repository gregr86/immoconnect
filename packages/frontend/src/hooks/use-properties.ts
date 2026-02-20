import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Property } from "@/types";

interface PropertiesResponse {
  items: Property[];
  total: number;
  page: number;
  limit: number;
}

export function propertiesQueryOptions(params?: {
  status?: string;
  type?: string;
  page?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.type) searchParams.set("type", params.type);
  if (params?.page) searchParams.set("page", params.page);
  const qs = searchParams.toString();

  return queryOptions({
    queryKey: ["properties", params],
    queryFn: () =>
      apiFetch<PropertiesResponse>(`/api/properties${qs ? `?${qs}` : ""}`),
  });
}

export function propertyQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["property", id],
    queryFn: () => apiFetch<Property>(`/api/properties/${id}`),
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Property>) =>
      apiFetch<{ id: string }>("/api/properties", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Property> & { id: string }) =>
      apiFetch<{ success: boolean }>(`/api/properties/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", variables.id] });
    },
  });
}

export function useSubmitProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/properties/${id}/submit`, {
        method: "POST",
      }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", id] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/properties/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      propertyId,
      file,
      fileType,
      sortOrder,
    }: {
      propertyId: string;
      file: File;
      fileType: string;
      sortOrder?: number;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", fileType);
      if (sortOrder !== undefined)
        formData.append("sortOrder", String(sortOrder));

      const res = await fetch(`/api/properties/${propertyId}/files`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error || res.statusText);
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["property", variables.propertyId],
      });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/files/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
