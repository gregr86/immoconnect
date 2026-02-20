import { z } from "zod";

export const searchFiltersSchema = z.object({
  types: z.array(z.string()).default([]),
  city: z.string().default(""),
  lat: z.number().nullable().default(null),
  lng: z.number().nullable().default(null),
  radius: z.number().min(1).max(50).default(10),
  surfaceMin: z.string().default(""),
  surfaceMax: z.string().default(""),
  rentMin: z.string().default(""),
  rentMax: z.string().default(""),
  accessibility: z.boolean().default(false),
  parking: z.boolean().default(false),
  airConditioning: z.boolean().default(false),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

export const defaultFilters: SearchFilters = {
  types: [],
  city: "",
  lat: null,
  lng: null,
  radius: 10,
  surfaceMin: "",
  surfaceMax: "",
  rentMin: "",
  rentMax: "",
  accessibility: false,
  parking: false,
  airConditioning: false,
};
