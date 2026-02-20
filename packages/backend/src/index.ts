import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./auth";
import { propertyRoutes } from "./routes/properties";
import { adminRoutes } from "./routes/admin";
import { uploadRoutes } from "./routes/uploads";

const app = new Elysia()
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
  .get("/api/health", () => ({ status: "ok" }))
  .listen(3000);

console.log(`Backend running at http://localhost:${app.server?.port}`);

export type App = typeof app;
