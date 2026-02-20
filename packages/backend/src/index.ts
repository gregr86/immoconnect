import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./auth";
import { propertyRoutes } from "./routes/properties";
import { adminRoutes } from "./routes/admin";
import { uploadRoutes } from "./routes/uploads";
import { searchRoutes } from "./routes/search";
import { subscriptionRoutes, webhookRoute } from "./routes/subscriptions";
import { messagingRoutes } from "./routes/messaging";
import { notificationRoutes } from "./routes/notifications";
import { marketplaceRoutes } from "./routes/marketplace";
import { leadRoutes } from "./routes/leads";

const app = new Elysia()
  // Webhook Stripe (raw body, sans CORS)
  .use(webhookRoute)
  .use(cors({
    origin: ["http://localhost:3001"],
    credentials: true,
  }))
  .all("/api/auth/*", (ctx) => {
    return auth.handler(ctx.request);
  })
  .use(propertyRoutes)
  .use(adminRoutes)
  .use(uploadRoutes)
  .use(searchRoutes)
  .use(subscriptionRoutes)
  .use(messagingRoutes)
  .use(notificationRoutes)
  .use(marketplaceRoutes)
  .use(leadRoutes)
  .get("/api/health", () => ({ status: "ok" }))
  .listen(3000);

console.log(`Backend running at http://localhost:${app.server?.port}`);

export type App = typeof app;
