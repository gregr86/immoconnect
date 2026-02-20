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

export type SubscriptionPlan = "decouverte" | "professionnel" | "entreprise";

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "trialing";

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
  airConditioning?: boolean;
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

export interface SearchCriteria {
  id: string;
  userId: string;
  name: string;
  propertyTypes?: string;
  city?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  radiusKm?: string;
  surfaceMin?: string;
  surfaceMax?: string;
  rentMin?: string;
  rentMax?: string;
  accessibility?: boolean;
  parking?: boolean;
  airConditioning?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResultProperty extends Property {
  score: number;
  scoreLabel: string;
  photos: PropertyFile[];
}

export interface SearchResponse {
  items: SearchResultProperty[];
  total: number;
  page: number;
  limit: number;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  planName?: string;
  planFeatures?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId?: string;
  stripeInvoiceId?: string;
  amountTtc?: number;
  amountHt?: number;
  status: "paid" | "pending" | "failed" | "void";
  description?: string;
  invoiceDate?: string;
  paidAt?: string;
  invoicePdfUrl?: string;
  createdAt: string;
}

export interface SubscriptionPlanInfo {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  recommended: boolean;
}
