import { pgTable, text, timestamp, boolean, integer, numeric, pgEnum, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Better Auth tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("annonceur"),
  phone: text("phone"),
  companyName: text("company_name"),
  siret: text("siret"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enums métier
export const propertyTypeEnum = pgEnum("property_type", [
  "local_commercial",
  "bureau",
  "entrepot",
  "terrain",
  "autre",
]);

export const propertyStatusEnum = pgEnum("property_status", [
  "brouillon",
  "soumis",
  "publie",
  "rejete",
  "matche",
  "archive",
]);

export const mandateTypeEnum = pgEnum("mandate_type", [
  "simple",
  "exclusif",
  "semi_exclusif",
]);

export const energyClassEnum = pgEnum("energy_class", [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
]);

export const fileTypeEnum = pgEnum("file_type", [
  "photo",
  "mandat",
  "plan",
  "diagnostic",
  "autre",
]);

// Table Propriétés (annonces)
export const property = pgTable("property", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: propertyTypeEnum("type").notNull(),
  status: propertyStatusEnum("status").notNull().default("brouillon"),
  surface: numeric("surface"),
  rent: numeric("rent"),
  price: numeric("price"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  yearBuilt: integer("year_built"),
  // Mandat obligatoire
  mandateType: mandateTypeEnum("mandate_type"),
  mandateRef: text("mandate_ref"),
  mandateDate: timestamp("mandate_date"),
  // Caractéristiques
  energyClass: energyClassEnum("energy_class"),
  floor: integer("floor"),
  parkingSpots: integer("parking_spots"),
  accessibility: boolean("accessibility").default(false),
  airConditioning: boolean("air_conditioning").default(false),
  // Validation admin
  validatedAt: timestamp("validated_at"),
  validatedBy: text("validated_by").references(() => user.id),
  rejectedReason: text("rejected_reason"),
  // Relations
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Table Fichiers associés aux annonces
export const propertyFile = pgTable("property_file", {
  id: text("id").primaryKey(),
  propertyId: text("property_id")
    .notNull()
    .references(() => property.id, { onDelete: "cascade" }),
  fileType: fileTypeEnum("file_type").notNull(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  sortOrder: integer("sort_order").default(0),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Sprint 2 — Enums
export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "decouverte",
  "professionnel",
  "entreprise",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "trialing",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "paid",
  "pending",
  "failed",
  "void",
]);

// Sprint 2 — Recherches sauvegardées
export const searchCriteria = pgTable("search_criteria", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  name: text("name").notNull(),
  propertyTypes: text("property_types"), // JSON string array
  city: text("city"),
  postalCode: text("postal_code"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  radiusKm: numeric("radius_km").default("10"),
  surfaceMin: numeric("surface_min"),
  surfaceMax: numeric("surface_max"),
  rentMin: numeric("rent_min"),
  rentMax: numeric("rent_max"),
  accessibility: boolean("accessibility"),
  parking: boolean("parking"),
  airConditioning: boolean("air_conditioning"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Sprint 2 — Abonnements
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  plan: subscriptionPlanEnum("plan").notNull(),
  status: subscriptionStatusEnum("status").notNull().default("incomplete"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Sprint 2 — Factures
export const invoice = pgTable("invoice", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  subscriptionId: text("subscription_id").references(() => subscription.id),
  stripeInvoiceId: text("stripe_invoice_id"),
  amountTtc: integer("amount_ttc"), // en centimes
  amountHt: integer("amount_ht"), // en centimes
  status: invoiceStatusEnum("status").notNull().default("pending"),
  description: text("description"),
  invoiceDate: timestamp("invoice_date"),
  paidAt: timestamp("paid_at"),
  invoicePdfUrl: text("invoice_pdf_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Sprint 3 — Enums
export const notificationTypeEnum = pgEnum("notification_type", [
  "new_message",
  "property_status_change",
  "new_match",
  "system",
]);

// Sprint 3 — Messagerie
export const conversation = pgTable("conversation", {
  id: text("id").primaryKey(),
  propertyId: text("property_id")
    .notNull()
    .references(() => property.id),
  subject: text("subject"),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const conversationParticipant = pgTable("conversation_participant", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversation.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  lastReadAt: timestamp("last_read_at"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const message = pgTable("message", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversation.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id),
  content: text("content"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messageAttachment = pgTable("message_attachment", {
  id: text("id").primaryKey(),
  messageId: text("message_id")
    .notNull()
    .references(() => message.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Sprint 3 — Notifications
export const notification = pgTable("notification", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  link: text("link"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notificationPreference = pgTable("notification_preference", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id)
    .unique(),
  emailNewMessage: boolean("email_new_message").notNull().default(true),
  emailPropertyStatus: boolean("email_property_status").notNull().default(true),
  emailNewMatch: boolean("email_new_match").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Sprint 3 — Relations
export const conversationRelations = relations(conversation, ({ one, many }) => ({
  property: one(property, {
    fields: [conversation.propertyId],
    references: [property.id],
  }),
  createdByUser: one(user, {
    fields: [conversation.createdBy],
    references: [user.id],
  }),
  participants: many(conversationParticipant),
  messages: many(message),
}));

export const conversationParticipantRelations = relations(conversationParticipant, ({ one }) => ({
  conversation: one(conversation, {
    fields: [conversationParticipant.conversationId],
    references: [conversation.id],
  }),
  user: one(user, {
    fields: [conversationParticipant.userId],
    references: [user.id],
  }),
}));

export const messageRelations = relations(message, ({ one, many }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
  sender: one(user, {
    fields: [message.senderId],
    references: [user.id],
  }),
  attachments: many(messageAttachment),
}));

export const messageAttachmentRelations = relations(messageAttachment, ({ one }) => ({
  message: one(message, {
    fields: [messageAttachment.messageId],
    references: [message.id],
  }),
  uploadedByUser: one(user, {
    fields: [messageAttachment.uploadedBy],
    references: [user.id],
  }),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));

export const notificationPreferenceRelations = relations(notificationPreference, ({ one }) => ({
  user: one(user, {
    fields: [notificationPreference.userId],
    references: [user.id],
  }),
}));

// Sprint 4 — Enums

export const serviceCategoryEnum = pgEnum("service_category", [
  "btp",
  "notaire",
  "avocat",
  "geometre",
  "architecte",
  "courtier",
  "diagnostiqueur",
  "assureur",
  "energie_durable",
]);

export const quoteStatusEnum = pgEnum("quote_status", [
  "demande",
  "envoye",
  "accepte",
  "refuse",
  "expire",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "soumis",
  "en_qualification",
  "qualifie",
  "accepte",
  "rejete",
  "converti",
]);

// Sprint 4 — Marketplace : Profil professionnel
export const partnerProfile = pgTable("partner_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id)
    .unique(),
  category: serviceCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  coverImage: text("cover_image"),
  yearsExperience: integer("years_experience"),
  verified: boolean("verified").notNull().default(false),
  priceInfo: text("price_info"),
  rating: numeric("rating"),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Sprint 4 — Marketplace : Avis
export const partnerReview = pgTable("partner_review", {
  id: text("id").primaryKey(),
  partnerId: text("partner_id")
    .notNull()
    .references(() => partnerProfile.id, { onDelete: "cascade" }),
  reviewerId: text("reviewer_id")
    .notNull()
    .references(() => user.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Sprint 4 — Marketplace : Devis
export const quote = pgTable("quote", {
  id: text("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  requesterId: text("requester_id")
    .notNull()
    .references(() => user.id),
  partnerId: text("partner_id")
    .notNull()
    .references(() => partnerProfile.id),
  propertyId: text("property_id").references(() => property.id),
  category: serviceCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  status: quoteStatusEnum("status").notNull().default("demande"),
  amount: integer("amount"),
  responseMessage: text("response_message"),
  pdfPath: text("pdf_path"),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Sprint 4 — Apporteurs d'affaires : Leads
export const lead = pgTable("lead", {
  id: text("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  submittedBy: text("submitted_by")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  propertyType: propertyTypeEnum("property_type"),
  city: text("city"),
  surface: text("surface"),
  budget: text("budget"),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  assignedBrokerId: text("assigned_broker_id").references(() => user.id),
  status: leadStatusEnum("status").notNull().default("soumis"),
  estimatedCommission: integer("estimated_commission"),
  paidCommission: integer("paid_commission"),
  rejectedReason: text("rejected_reason"),
  qualifiedAt: timestamp("qualified_at"),
  convertedAt: timestamp("converted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Sprint 4 — Relations

export const partnerProfileRelations = relations(partnerProfile, ({ one, many }) => ({
  user: one(user, {
    fields: [partnerProfile.userId],
    references: [user.id],
  }),
  reviews: many(partnerReview),
  quotes: many(quote),
}));

export const partnerReviewRelations = relations(partnerReview, ({ one }) => ({
  partner: one(partnerProfile, {
    fields: [partnerReview.partnerId],
    references: [partnerProfile.id],
  }),
  reviewer: one(user, {
    fields: [partnerReview.reviewerId],
    references: [user.id],
  }),
}));

export const quoteRelations = relations(quote, ({ one }) => ({
  requester: one(user, {
    fields: [quote.requesterId],
    references: [user.id],
    relationName: "quoteRequester",
  }),
  partner: one(partnerProfile, {
    fields: [quote.partnerId],
    references: [partnerProfile.id],
  }),
  property: one(property, {
    fields: [quote.propertyId],
    references: [property.id],
  }),
}));

export const leadRelations = relations(lead, ({ one }) => ({
  submitter: one(user, {
    fields: [lead.submittedBy],
    references: [user.id],
    relationName: "leadSubmitter",
  }),
  assignedBroker: one(user, {
    fields: [lead.assignedBrokerId],
    references: [user.id],
    relationName: "leadBroker",
  }),
}));
