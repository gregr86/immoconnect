import { Elysia } from "elysia";
import { auth } from "../auth";

export const authMiddleware = new Elysia({ name: "auth-middleware" }).derive(
  { as: "scoped" },
  async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return {
      user: session?.user ?? null,
      session: session?.session ?? null,
    };
  }
);

export const requireAuth = new Elysia({ name: "require-auth" })
  .use(authMiddleware)
  .onBeforeHandle({ as: "scoped" }, ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Non authentifié" };
    }
  });

export const requireAdmin = new Elysia({ name: "require-admin" })
  .use(requireAuth)
  .onBeforeHandle({ as: "scoped" }, ({ user, set }) => {
    if (user!.role !== "admin") {
      set.status = 403;
      return { error: "Accès réservé aux administrateurs" };
    }
  });

export const requireAnnonceur = new Elysia({ name: "require-annonceur" })
  .use(requireAuth)
  .onBeforeHandle({ as: "scoped" }, ({ user, set }) => {
    const allowedRoles = ["annonceur", "admin"];
    if (!allowedRoles.includes(user!.role)) {
      set.status = 403;
      return { error: "Accès réservé aux annonceurs" };
    }
  });

export const requireProfessionnel = new Elysia({ name: "require-professionnel" })
  .use(requireAuth)
  .onBeforeHandle({ as: "scoped" }, ({ user, set }) => {
    if (!["professionnel", "admin"].includes(user!.role)) {
      set.status = 403;
      return { error: "Accès réservé aux professionnels" };
    }
  });

export const requireApporteur = new Elysia({ name: "require-apporteur" })
  .use(requireAuth)
  .onBeforeHandle({ as: "scoped" }, ({ user, set }) => {
    if (!["apporteur", "admin"].includes(user!.role)) {
      set.status = 403;
      return { error: "Accès réservé aux apporteurs d'affaires" };
    }
  });
