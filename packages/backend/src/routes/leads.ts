import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";
import { eq, and, ilike, sql, desc, count, sum } from "drizzle-orm";
import { db } from "../db";
import { lead, user, notification } from "../db/schema";
import { requireAuth, requireApporteur, requireAdmin } from "../middleware/auth";

export const leadRoutes = new Elysia({ prefix: "/api/leads" })

  // Liste leads
  .use(requireAuth)
  .get(
    "/",
    async ({ user: currentUser, query }) => {
      const page = parseInt(query.page || "1");
      const limit = parseInt(query.limit || "20");
      const offset = (page - 1) * limit;

      const conditions = [];

      // Apporteur voit uniquement ses leads, admin voit tout
      if (currentUser!.role !== "admin") {
        conditions.push(eq(lead.submittedBy, currentUser!.id));
      }

      if (query.status) {
        conditions.push(eq(lead.status, query.status as any));
      }
      if (query.search) {
        conditions.push(
          sql`(${ilike(lead.title, `%${query.search}%`)} OR ${ilike(lead.reference, `%${query.search}%`)})`,
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalResult] = await Promise.all([
        db
          .select({
            lead: lead,
            submitterName: user.name,
            submitterImage: user.image,
          })
          .from(lead)
          .innerJoin(user, eq(lead.submittedBy, user.id))
          .where(where)
          .orderBy(desc(lead.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: count() })
          .from(lead)
          .where(where),
      ]);

      // Charger noms des brokers assignés
      const brokerIds = items
        .map((i) => i.lead.assignedBrokerId)
        .filter(Boolean) as string[];
      const brokers =
        brokerIds.length > 0
          ? await db
              .select({ id: user.id, name: user.name, image: user.image })
              .from(user)
              .where(sql`${user.id} IN ${brokerIds}`)
          : [];

      const brokerMap = new Map(brokers.map((b) => [b.id, b]));

      return {
        items: items.map((row) => ({
          ...row.lead,
          submitter: { name: row.submitterName, image: row.submitterImage },
          assignedBroker: row.lead.assignedBrokerId
            ? brokerMap.get(row.lead.assignedBrokerId) || null
            : null,
        })),
        total: totalResult[0].count,
        page,
        limit,
      };
    },
    {
      query: t.Object({
        status: t.Optional(t.String()),
        search: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    },
  )

  // Stats KPI
  .get("/stats", async ({ user: currentUser }) => {
    const isAdmin = currentUser!.role === "admin";
    const baseCondition = isAdmin
      ? undefined
      : eq(lead.submittedBy, currentUser!.id);

    const [totalSoumis] = await db
      .select({ count: count() })
      .from(lead)
      .where(baseCondition);

    const [enQualification] = await db
      .select({ count: count() })
      .from(lead)
      .where(
        baseCondition
          ? and(baseCondition, eq(lead.status, "en_qualification"))
          : eq(lead.status, "en_qualification"),
      );

    const [commissions] = await db
      .select({ total: sum(lead.paidCommission) })
      .from(lead)
      .where(
        baseCondition
          ? and(baseCondition, sql`${lead.paidCommission} IS NOT NULL`)
          : sql`${lead.paidCommission} IS NOT NULL`,
      );

    return {
      totalSoumis: totalSoumis.count,
      enQualification: enQualification.count,
      commissionTotale: parseInt(commissions.total || "0"),
      objectifAnnuel: 500000, // 5000€ objectif par défaut
    };
  })

  // Détail lead
  .get("/:id", async ({ params, user: currentUser, set }) => {
    const result = await db
      .select({
        lead: lead,
        submitterName: user.name,
        submitterImage: user.image,
      })
      .from(lead)
      .innerJoin(user, eq(lead.submittedBy, user.id))
      .where(eq(lead.id, params.id))
      .limit(1);

    if (result.length === 0) {
      set.status = 404;
      return { error: "Lead introuvable" };
    }

    const row = result[0];

    if (
      row.lead.submittedBy !== currentUser!.id &&
      currentUser!.role !== "admin"
    ) {
      set.status = 403;
      return { error: "Non autorisé" };
    }

    let assignedBroker = null;
    if (row.lead.assignedBrokerId) {
      const [broker] = await db
        .select({ id: user.id, name: user.name, image: user.image })
        .from(user)
        .where(eq(user.id, row.lead.assignedBrokerId));
      assignedBroker = broker || null;
    }

    return {
      ...row.lead,
      submitter: { name: row.submitterName, image: row.submitterImage },
      assignedBroker,
    };
  })

  // Soumettre un lead (apporteur uniquement)
  .post(
    "/",
    async (ctx) => {
      // Vérification manuelle du rôle (requireApporteur ne peut pas être .use dans un group déjà .use(requireAuth))
      const currentUser = ctx.user!;
      if (!["apporteur", "admin"].includes(currentUser.role)) {
        ctx.set.status = 403;
        return { error: "Accès réservé aux apporteurs d'affaires" };
      }

      const { body } = ctx;

      // Générer référence
      const [countResult] = await db.select({ count: count() }).from(lead);
      const ref = `L-${String(countResult.count + 1).padStart(3, "0")}`;

      const id = nanoid();
      const [created] = await db
        .insert(lead)
        .values({
          id,
          reference: ref,
          submittedBy: currentUser.id,
          title: body.title,
          description: body.description,
          propertyType: body.propertyType as any || null,
          city: body.city || null,
          surface: body.surface || null,
          budget: body.budget || null,
          contactName: body.contactName,
          contactEmail: body.contactEmail,
          contactPhone: body.contactPhone || null,
        })
        .returning();

      return created;
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.String(),
        propertyType: t.Optional(t.String()),
        city: t.Optional(t.String()),
        surface: t.Optional(t.String()),
        budget: t.Optional(t.String()),
        contactName: t.String(),
        contactEmail: t.String(),
        contactPhone: t.Optional(t.String()),
      }),
    },
  )

  // Modifier lead
  .put(
    "/:id",
    async ({ params, body, user: currentUser, set }) => {
      const existing = await db.query.lead.findFirst({
        where: eq(lead.id, params.id),
      });

      if (!existing) {
        set.status = 404;
        return { error: "Lead introuvable" };
      }

      // Apporteur ne peut modifier que ses leads en statut "soumis"
      if (currentUser!.role !== "admin") {
        if (existing.submittedBy !== currentUser!.id) {
          set.status = 403;
          return { error: "Non autorisé" };
        }
        if (existing.status !== "soumis") {
          set.status = 400;
          return { error: "Ce lead ne peut plus être modifié" };
        }
      }

      const updateData: Record<string, unknown> = { updatedAt: new Date() };

      if (body.title) updateData.title = body.title;
      if (body.description) updateData.description = body.description;
      if (body.propertyType !== undefined) updateData.propertyType = body.propertyType || null;
      if (body.city !== undefined) updateData.city = body.city || null;
      if (body.surface !== undefined) updateData.surface = body.surface || null;
      if (body.budget !== undefined) updateData.budget = body.budget || null;
      if (body.contactName) updateData.contactName = body.contactName;
      if (body.contactEmail) updateData.contactEmail = body.contactEmail;
      if (body.contactPhone !== undefined) updateData.contactPhone = body.contactPhone || null;

      // Admin peut assigner un broker
      if (currentUser!.role === "admin" && body.assignedBrokerId !== undefined) {
        updateData.assignedBrokerId = body.assignedBrokerId || null;
      }

      const [updated] = await db
        .update(lead)
        .set(updateData)
        .where(eq(lead.id, params.id))
        .returning();

      return updated;
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
        propertyType: t.Optional(t.String()),
        city: t.Optional(t.String()),
        surface: t.Optional(t.String()),
        budget: t.Optional(t.String()),
        contactName: t.Optional(t.String()),
        contactEmail: t.Optional(t.String()),
        contactPhone: t.Optional(t.String()),
        assignedBrokerId: t.Optional(t.String()),
      }),
    },
  )

  // Changer statut (admin)
  .put(
    "/:id/status",
    async (ctx) => {
      const currentUser = ctx.user!;
      if (currentUser.role !== "admin") {
        ctx.set.status = 403;
        return { error: "Accès réservé aux administrateurs" };
      }

      const { params, body } = ctx;
      const existing = await db.query.lead.findFirst({
        where: eq(lead.id, params.id),
      });

      if (!existing) {
        ctx.set.status = 404;
        return { error: "Lead introuvable" };
      }

      const updateData: Record<string, unknown> = {
        status: body.status,
        updatedAt: new Date(),
      };

      if (body.status === "qualifie") {
        updateData.qualifiedAt = new Date();
      }
      if (body.status === "converti") {
        updateData.convertedAt = new Date();
      }
      if (body.status === "rejete" && body.rejectedReason) {
        updateData.rejectedReason = body.rejectedReason;
      }

      const [updated] = await db
        .update(lead)
        .set(updateData)
        .where(eq(lead.id, params.id))
        .returning();

      // Notification pour l'apporteur
      await db.insert(notification).values({
        id: nanoid(),
        userId: existing.submittedBy,
        type: "system",
        title: "Mise à jour de votre lead",
        message: `Le lead ${existing.reference} est passé en "${body.status}"`,
        link: `/leads`,
      });

      return updated;
    },
    {
      body: t.Object({
        status: t.String(),
        rejectedReason: t.Optional(t.String()),
      }),
    },
  )

  // Valider commission (admin)
  .put(
    "/:id/commission",
    async (ctx) => {
      const currentUser = ctx.user!;
      if (currentUser.role !== "admin") {
        ctx.set.status = 403;
        return { error: "Accès réservé aux administrateurs" };
      }

      const { params, body } = ctx;
      const existing = await db.query.lead.findFirst({
        where: eq(lead.id, params.id),
      });

      if (!existing) {
        ctx.set.status = 404;
        return { error: "Lead introuvable" };
      }

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (body.estimatedCommission !== undefined)
        updateData.estimatedCommission = body.estimatedCommission;
      if (body.paidCommission !== undefined)
        updateData.paidCommission = body.paidCommission;

      const [updated] = await db
        .update(lead)
        .set(updateData)
        .where(eq(lead.id, params.id))
        .returning();

      // Notification
      await db.insert(notification).values({
        id: nanoid(),
        userId: existing.submittedBy,
        type: "system",
        title: "Commission mise à jour",
        message: `La commission du lead ${existing.reference} a été mise à jour`,
        link: `/leads`,
      });

      return updated;
    },
    {
      body: t.Object({
        estimatedCommission: t.Optional(t.Number()),
        paidCommission: t.Optional(t.Number()),
      }),
    },
  );
