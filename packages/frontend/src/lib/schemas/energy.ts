import { z } from "zod";

export const energyFiltersSchema = z.object({
  roofSurfaceMin: z.string().default(""),
  parkingSurfaceMin: z.string().default(""),
  orientation: z.string().default(""),
  city: z.string().default(""),
  propertyType: z.string().default(""),
  scoreMin: z.number().min(0).max(100).default(0),
});

export type EnergyFilters = z.infer<typeof energyFiltersSchema>;

export const defaultEnergyFilters: EnergyFilters = {
  roofSurfaceMin: "",
  parkingSurfaceMin: "",
  orientation: "",
  city: "",
  propertyType: "",
  scoreMin: 0,
};
