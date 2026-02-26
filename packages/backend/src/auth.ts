import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "./db/schema";

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-me",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin()],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "annonceur",
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      companyName: {
        type: "string",
        required: false,
        input: true,
      },
      siret: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  trustedOrigins: [
    "http://localhost:3001",
    process.env.FRONTEND_URL || "",
  ].filter(Boolean),
});
