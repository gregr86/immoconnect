import { Elysia, t } from "elysia";
import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { property, user } from "../db/schema";
import { requireAdmin } from "../middleware/auth";

export const adminRoutes = new Elysia({ prefix: "/api/admin" })
  .use(requireAdmin)

  // File d'attente modération
  .get("/moderation", async () => {
    const items = await db
      .select({
        id: property.id,
        title: property.title,
        type: property.type,
        city: property.city,
        surface: property.surface,
        rent: property.rent,
        status: property.status,
        createdAt: property.createdAt,
        ownerId: property.ownerId,
        ownerName: user.name,
        ownerEmail: user.email,
      })
      .from(property)
      .leftJoin(user, eq(property.ownerId, user.id))
      .where(eq(property.status, "soumis"))
      .orderBy(desc(property.createdAt));

    return { items };
  })

  // Valider une annonce
  .post("/:id/validate", async ({ params, user: admin, set }) => {
    const existing = await db.query.property.findFirst({
      where: eq(property.id, params.id),
    });

    if (!existing) {
      set.status = 404;
      return { error: "Annonce introuvable" };
    }

    if (existing.status !== "soumis") {
      set.status = 400;
      return { error: "Cette annonce n'est pas en attente de validation" };
    }

    await db
      .update(property)
      .set({
        status: "publie",
        validatedAt: new Date(),
        validatedBy: admin!.id,
        updatedAt: new Date(),
      })
      .where(eq(property.id, params.id));

    return { success: true };
  })

  // Rejeter une annonce
  .post(
    "/:id/reject",
    async ({ params, body, user: admin, set }) => {
      const existing = await db.query.property.findFirst({
        where: eq(property.id, params.id),
      });

      if (!existing) {
        set.status = 404;
        return { error: "Annonce introuvable" };
      }

      if (existing.status !== "soumis") {
        set.status = 400;
        return { error: "Cette annonce n'est pas en attente de validation" };
      }

      await db
        .update(property)
        .set({
          status: "rejete",
          rejectedReason: body.reason,
          updatedAt: new Date(),
        })
        .where(eq(property.id, params.id));

      return { success: true };
    },
    {
      body: t.Object({
        reason: t.String(),
      }),
    },
  );
