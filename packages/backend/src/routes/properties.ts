import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";
import { eq, desc, and, or, sql } from "drizzle-orm";
import { db } from "../db";
import { property, propertyFile, user } from "../db/schema";
import { authMiddleware, requireAuth, requireAnnonceur } from "../middleware/auth";

export const propertyRoutes = new Elysia({ prefix: "/api/properties" })
  // Liste paginée
  .use(authMiddleware)
  .get(
    "/",
    async ({ user: currentUser, query }) => {
      const { status, type, page = "1", limit = "20" } = query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const conditions = [];

      // Admin voit tout, les autres voient les leurs + publiées
      if (currentUser?.role !== "admin") {
        if (currentUser) {
          conditions.push(
            or(
              eq(property.ownerId, currentUser.id),
              eq(property.status, "publie"),
            ),
          );
        } else {
          conditions.push(eq(property.status, "publie"));
        }
      }

      if (status) {
        conditions.push(eq(property.status, status as any));
      }
      if (type) {
        conditions.push(eq(property.type, type as any));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(property)
          .where(where)
          .orderBy(desc(property.createdAt))
          .limit(parseInt(limit))
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(property)
          .where(where),
      ]);

      return {
        items,
        total: Number(countResult[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
      };
    },
    {
      query: t.Object({
        status: t.Optional(t.String()),
        type: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    },
  )

  // Détail avec fichiers
  .get("/:id", async ({ params, user: currentUser }) => {
    const result = await db.query.property.findFirst({
      where: eq(property.id, params.id),
    });

    if (!result) {
      return new Response(JSON.stringify({ error: "Annonce introuvable" }), {
        status: 404,
      });
    }

    // Récupérer les fichiers associés
    const files = await db
      .select()
      .from(propertyFile)
      .where(eq(propertyFile.propertyId, params.id))
      .orderBy(propertyFile.sortOrder);

    // Récupérer le propriétaire
    const owner = await db.query.user.findFirst({
      where: eq(user.id, result.ownerId),
    });

    return { ...result, files, owner };
  })

  // Création
  .use(requireAuth)
  .post(
    "/",
    async ({ body, user: currentUser }) => {
      const id = nanoid();
      const now = new Date();

      await db.insert(property).values({
        id,
        title: body.title,
        description: body.description,
        type: body.type as any,
        status: "brouillon",
        surface: body.surface,
        rent: body.rent,
        price: body.price,
        address: body.address,
        city: body.city,
        postalCode: body.postalCode,
        latitude: body.latitude,
        longitude: body.longitude,
        yearBuilt: body.yearBuilt,
        mandateType: body.mandateType as any,
        mandateRef: body.mandateRef,
        mandateDate: body.mandateDate ? new Date(body.mandateDate) : null,
        energyClass: body.energyClass as any,
        floor: body.floor,
        parkingSpots: body.parkingSpots,
        accessibility: body.accessibility,
        ownerId: currentUser!.id,
        createdAt: now,
        updatedAt: now,
      });

      return { id };
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.Optional(t.String()),
        type: t.String(),
        surface: t.Optional(t.String()),
        rent: t.Optional(t.String()),
        price: t.Optional(t.String()),
        address: t.Optional(t.String()),
        city: t.Optional(t.String()),
        postalCode: t.Optional(t.String()),
        latitude: t.Optional(t.String()),
        longitude: t.Optional(t.String()),
        yearBuilt: t.Optional(t.Number()),
        mandateType: t.Optional(t.String()),
        mandateRef: t.Optional(t.String()),
        mandateDate: t.Optional(t.String()),
        energyClass: t.Optional(t.String()),
        floor: t.Optional(t.Number()),
        parkingSpots: t.Optional(t.Number()),
        accessibility: t.Optional(t.Boolean()),
      }),
    },
  )

  // Modification
  .put(
    "/:id",
    async ({ params, body, user: currentUser, set }) => {
      const existing = await db.query.property.findFirst({
        where: eq(property.id, params.id),
      });

      if (!existing) {
        set.status = 404;
        return { error: "Annonce introuvable" };
      }

      if (existing.ownerId !== currentUser!.id && currentUser!.role !== "admin") {
        set.status = 403;
        return { error: "Non autorisé" };
      }

      await db
        .update(property)
        .set({
          ...body,
          mandateDate: body.mandateDate ? new Date(body.mandateDate) : undefined,
          updatedAt: new Date(),
        } as any)
        .where(eq(property.id, params.id));

      return { success: true };
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
        type: t.Optional(t.String()),
        surface: t.Optional(t.String()),
        rent: t.Optional(t.String()),
        price: t.Optional(t.String()),
        address: t.Optional(t.String()),
        city: t.Optional(t.String()),
        postalCode: t.Optional(t.String()),
        latitude: t.Optional(t.String()),
        longitude: t.Optional(t.String()),
        yearBuilt: t.Optional(t.Number()),
        mandateType: t.Optional(t.String()),
        mandateRef: t.Optional(t.String()),
        mandateDate: t.Optional(t.String()),
        energyClass: t.Optional(t.String()),
        floor: t.Optional(t.Number()),
        parkingSpots: t.Optional(t.Number()),
        accessibility: t.Optional(t.Boolean()),
      }),
    },
  )

  // Soumission pour validation
  .post("/:id/submit", async ({ params, user: currentUser, set }) => {
    const existing = await db.query.property.findFirst({
      where: eq(property.id, params.id),
    });

    if (!existing) {
      set.status = 404;
      return { error: "Annonce introuvable" };
    }

    if (existing.ownerId !== currentUser!.id && currentUser!.role !== "admin") {
      set.status = 403;
      return { error: "Non autorisé" };
    }

    // Vérifier mandat obligatoire
    if (!existing.mandateType || !existing.mandateRef) {
      set.status = 400;
      return { error: "Le mandat est obligatoire pour soumettre une annonce" };
    }

    await db
      .update(property)
      .set({ status: "soumis", updatedAt: new Date() })
      .where(eq(property.id, params.id));

    return { success: true };
  })

  // Suppression
  .delete("/:id", async ({ params, user: currentUser, set }) => {
    const existing = await db.query.property.findFirst({
      where: eq(property.id, params.id),
    });

    if (!existing) {
      set.status = 404;
      return { error: "Annonce introuvable" };
    }

    if (existing.ownerId !== currentUser!.id && currentUser!.role !== "admin") {
      set.status = 403;
      return { error: "Non autorisé" };
    }

    await db.delete(property).where(eq(property.id, params.id));
    return { success: true };
  });
