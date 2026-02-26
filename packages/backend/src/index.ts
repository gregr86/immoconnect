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
import { energyRoutes } from "./routes/energy";

const CORS_ORIGIN = "http://localhost:3001";

const app = new Elysia()
  // Webhook Stripe (raw body, sans CORS)
  .use(webhookRoute)
  .use(cors({
    origin: [CORS_ORIGIN],
    credentials: true,
  }))
  .use(propertyRoutes)
  .use(adminRoutes)
  .use(uploadRoutes)
  .use(searchRoutes)
  .use(subscriptionRoutes)
  .use(messagingRoutes)
  .use(notificationRoutes)
  .use(marketplaceRoutes)
  .use(leadRoutes)
  .use(energyRoutes)
  .get("/api/health", () => ({ status: "ok" }));

// Bun.serve intercepte les requêtes auth avant le parsing body d'Elysia
const server = Bun.serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url);

    // Better Auth : reconstruire le Request pour éviter le body stream Bun
    if (url.pathname.startsWith("/api/auth")) {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": CORS_ORIGIN,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
          },
        });
      }

      const rawBody = request.method !== "GET" ? await request.text() : undefined;
      const authRequest = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: rawBody,
      });
      const response = await auth.handler(authRequest);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          "Access-Control-Allow-Origin": CORS_ORIGIN,
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }

    // Tout le reste passe par Elysia
    return app.handle(request);
  },
});

console.log(`Backend running at http://localhost:${server.port}`);

export type App = typeof app;
