export type UserRole =
  | "annonceur"
  | "enseigne"
  | "admin"
  | "professionnel"
  | "apporteur"
  | "partenaire_energie";

export type PropertyStatus =
  | "brouillon"
  | "soumis"
  | "publie"
  | "rejete"
  | "matche"
  | "archive";

export type PropertyType =
  | "local_commercial"
  | "bureau"
  | "entrepot"
  | "terrain"
  | "autre";

export type MandateType = "simple" | "exclusif" | "semi_exclusif";

export type EnergyClass = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export type FileType = "photo" | "mandat" | "plan" | "diagnostic" | "autre";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
  siret?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  type: PropertyType;
  status: PropertyStatus;
  surface?: string;
  rent?: string;
  price?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  yearBuilt?: number;
  mandateType?: MandateType;
  mandateRef?: string;
  mandateDate?: string;
  energyClass?: EnergyClass;
  floor?: number;
  parkingSpots?: number;
  accessibility?: boolean;
  validatedAt?: string;
  validatedBy?: string;
  rejectedReason?: string;
  ownerId: string;
  owner?: User;
  files?: PropertyFile[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFile {
  id: string;
  propertyId: string;
  fileType: FileType;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  sortOrder: number;
  uploadedBy: string;
  createdAt: string;
}
