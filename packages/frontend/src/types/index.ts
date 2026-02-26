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

export type RoofOrientation =
  | "nord"
  | "sud"
  | "est"
  | "ouest"
  | "sud_est"
  | "sud_ouest"
  | "plate"
  | "inconnue";

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
  roofSurface?: string;
  parkingSurface?: string;
  roofOrientation?: RoofOrientation;
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

// Sprint 3 — Messagerie & Notifications

export type NotificationType =
  | "new_message"
  | "property_status_change"
  | "new_match"
  | "system";

export interface ConversationParticipant {
  userId: string;
  name: string;
  image?: string | null;
  companyName?: string | null;
  role?: string;
  lastReadAt?: string | null;
  joinedAt?: string;
}

export interface ConversationLastMessage {
  id: string;
  content: string | null;
  senderId: string;
  senderName: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  propertyId: string;
  subject?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  property?: { id: string; title: string; city?: string | null } | null;
  participants: ConversationParticipant[];
  lastMessage: ConversationLastMessage | null;
  unreadCount: number;
}

export interface ConversationsResponse {
  items: Conversation[];
}

export interface MessageAttachment {
  id: string;
  messageId?: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path?: string;
  createdAt: string;
  uploadedBy?: string;
}

export interface MessageSender {
  id: string;
  name: string;
  image?: string | null;
  companyName?: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  createdAt: string;
  sender?: MessageSender | null;
  attachments: MessageAttachment[];
}

export interface MessagesResponse {
  items: Message[];
  hasMore: boolean;
}

export interface ConversationDetail {
  id: string;
  propertyId: string;
  subject?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  property: (Property & { photos: PropertyFile[] }) | null;
  participants: ConversationParticipant[];
  sharedDocuments: MessageAttachment[];
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message?: string | null;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  items: Notification[];
  total: number;
  limit: number;
  offset: number;
}

export interface NotificationPreferences {
  emailNewMessage: boolean;
  emailPropertyStatus: boolean;
  emailNewMatch: boolean;
}

// Sprint 4 — Marketplace & Apporteurs

export type ServiceCategory =
  | "btp"
  | "notaire"
  | "avocat"
  | "geometre"
  | "architecte"
  | "courtier"
  | "diagnostiqueur"
  | "assureur"
  | "energie_durable";

export type QuoteStatus = "demande" | "envoye" | "accepte" | "refuse" | "expire";

export type LeadStatus =
  | "soumis"
  | "en_qualification"
  | "qualifie"
  | "accepte"
  | "rejete"
  | "converti";

export interface PartnerProfile {
  id: string;
  userId: string;
  category: ServiceCategory;
  description: string;
  city: string;
  postalCode: string;
  coverImage?: string | null;
  yearsExperience?: number | null;
  verified: boolean;
  priceInfo?: string | null;
  rating?: string | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    companyName?: string | null;
    image?: string | null;
  };
}

export interface PartnerReview {
  id: string;
  partnerId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  reviewerName?: string;
  reviewerImage?: string | null;
}

export interface Quote {
  id: string;
  reference: string;
  requesterId: string;
  partnerId: string;
  propertyId?: string | null;
  category: ServiceCategory;
  description: string;
  status: QuoteStatus;
  amount?: number | null;
  responseMessage?: string | null;
  pdfPath?: string | null;
  validUntil?: string | null;
  createdAt: string;
  updatedAt: string;
  partner?: PartnerProfile;
}

export interface QuotesResponse {
  items: Quote[];
  total: number;
  page: number;
  limit: number;
}

export interface Lead {
  id: string;
  reference: string;
  submittedBy: string;
  title: string;
  description: string;
  propertyType?: PropertyType | null;
  city?: string | null;
  surface?: string | null;
  budget?: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  assignedBrokerId?: string | null;
  status: LeadStatus;
  estimatedCommission?: number | null;
  paidCommission?: number | null;
  rejectedReason?: string | null;
  qualifiedAt?: string | null;
  convertedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  submitter?: { name: string; image?: string | null };
  assignedBroker?: { id: string; name: string; image?: string | null } | null;
}

export interface LeadsResponse {
  items: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface LeadStats {
  totalSoumis: number;
  enQualification: number;
  commissionTotale: number;
  objectifAnnuel: number;
}

// Sprint 5 — Énergie Durable (PV)

export interface PvBreakdown {
  roofSurface: number;
  parkingSurface: number;
  orientation: number;
  energyClass: number;
  location: number;
}

export interface EnergyProperty extends Property {
  pvScore: number;
  pvLabel: string;
  pvBreakdown: PvBreakdown;
  photos: PropertyFile[];
}

export interface EnergyPropertiesResponse {
  items: EnergyProperty[];
  total: number;
  page: number;
  limit: number;
}

export interface EnergyStats {
  totalEligible: number;
  avgScore: number;
  excellentCount: number;
  topCities: { city: string; count: number }[];
}
