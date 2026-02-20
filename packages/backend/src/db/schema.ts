import { pgTable, text, timestamp, boolean, integer, numeric, pgEnum } from "drizzle-orm/pg-core";

// Better Auth tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  role: text("role").notNull().default("annonceur"),
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
  "publie",
  "matche",
  "archive",
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
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
