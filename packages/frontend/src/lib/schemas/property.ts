import { z } from "zod";

export const step1Schema = z.object({
  title: z.string().min(3, "Minimum 3 caractères"),
  type: z.enum(["local_commercial", "bureau", "entrepot", "terrain", "autre"]),
  address: z.string().optional(),
  city: z.string().min(1, "Ville requise"),
  postalCode: z.string().optional(),
  surface: z.coerce.number().positive("Surface requise"),
  yearBuilt: z.coerce.number().optional(),
  rent: z.coerce.number().optional(),
  price: z.coerce.number().optional(),
  description: z.string().optional(),
  mandateType: z.enum(["simple", "exclusif", "semi_exclusif"]),
  mandateRef: z.string().min(1, "Référence mandat requise"),
  mandateDate: z.string().optional(),
  energyClass: z.enum(["A", "B", "C", "D", "E", "F", "G"]).optional(),
  floor: z.coerce.number().optional(),
  parkingSpots: z.coerce.number().optional(),
  accessibility: z.boolean().optional(),
});

export type Step1Form = z.infer<typeof step1Schema>;
