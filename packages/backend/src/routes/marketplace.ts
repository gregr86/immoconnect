import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";
import { eq, and, ilike, sql, desc, asc, count } from "drizzle-orm";
import { db } from "../db";
import {
  partnerProfile,
  partnerReview,
  quote,
  user,
  notification,
} from "../db/schema";
import {
  authMiddleware,
  requireAuth,
  requireProfessionnel,
} from "../middleware/auth";

export const marketplaceRoutes = new Elysia({ prefix: "/api/marketplace" })

  // Liste partenaires (auth optionnel)
  .use(authMiddleware)
  .get(
    "/partners",
    async ({ query }) => {
      const page = parseInt(query.page || "1");
      const limit = parseInt(query.limit || "12");
      const offset = (page - 1) * limit;

      const conditions = [];
      if (query.category) {
        conditions.push(eq(partnerProfile.category, query.category as any));
      }
      if (query.city) {
        conditions.push(ilike(partnerProfile.city, `%${query.city}%`));
      }
      if (query.search) {
        conditions.push(
          sql`(${ilike(partnerProfile.description, `%${query.search}%`)} OR EXISTS (
            SELECT 1 FROM "user" u WHERE u.id = ${partnerProfile.userId}
            AND (${ilike(user.name, `%${query.search}%`)} OR ${ilike(user.companyName, `%${query.search}%`)})
          ))`,
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      let orderBy;
      switch (query.sort) {
        case "rating":
          orderBy = desc(partnerProfile.rating);
          break;
        case "name":
          orderBy = asc(partnerProfile.city);
          break;
        default:
          orderBy = desc(partnerProfile.createdAt);
      }

      const [items, totalResult] = await Promise.all([
        db
          .select()
          .from(partnerProfile)
          .innerJoin(user, eq(partnerProfile.userId, user.id))
          .where(where)
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset),
        db
          .select({ count: count() })
          .from(partnerProfile)
          .where(where),
      ]);

      return {
        items: items.map((row) => ({
          ...row.partner_profile,
          user: {
            id: row.user.id,
            name: row.user.name,
            email: row.user.email,
            companyName: row.user.companyName,
            image: row.user.image,
          },
        })),
        total: totalResult[0].count,
        page,
        limit,
      };
    },
    {
      query: t.Object({
        category: t.Optional(t.String()),
        city: t.Optional(t.String()),
        search: t.Optional(t.String()),
        sort: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    },
  )

  // Détail partenaire + avis
  .get("/partners/:id", async ({ params, set }) => {
    const partner = await db
      .select()
      .from(partnerProfile)
      .innerJoin(user, eq(partnerProfile.userId, user.id))
      .where(eq(partnerProfile.id, params.id))
      .limit(1);

    if (partner.length === 0) {
      set.status = 404;
      return { error: "Partenaire introuvable" };
    }

    const reviews = await db
      .select({
        id: partnerReview.id,
        rating: partnerReview.rating,
        comment: partnerReview.comment,
        createdAt: partnerReview.createdAt,
        reviewerName: user.name,
        reviewerImage: user.image,
      })
      .from(partnerReview)
      .innerJoin(user, eq(partnerReview.reviewerId, user.id))
      .where(eq(partnerReview.partnerId, params.id))
      .orderBy(desc(partnerReview.createdAt));

    const row = partner[0];
    return {
      ...row.partner_profile,
      user: {
        id: row.user.id,
        name: row.user.name,
        email: row.user.email,
        companyName: row.user.companyName,
        image: row.user.image,
      },
      reviews,
    };
  })

  // Mon profil professionnel
  .group("/profile", (app) =>
    app
      .use(requireProfessionnel)
      .get("/", async ({ user: currentUser, set }) => {
        const profile = await db.query.partnerProfile.findFirst({
          where: eq(partnerProfile.userId, currentUser!.id),
        });

        if (!profile) {
          set.status = 404;
          return { error: "Profil professionnel non créé" };
        }

        return profile;
      })
      .post(
        "/",
        async ({ body, user: currentUser }) => {
          const existing = await db.query.partnerProfile.findFirst({
            where: eq(partnerProfile.userId, currentUser!.id),
          });

          if (existing) {
            const [updated] = await db
              .update(partnerProfile)
              .set({ ...body, updatedAt: new Date() })
              .where(eq(partnerProfile.id, existing.id))
              .returning();
            return updated;
          }

          const id = nanoid();
          const [created] = await db
            .insert(partnerProfile)
            .values({
              id,
              userId: currentUser!.id,
              ...body,
            })
            .returning();
          return created;
        },
        {
          body: t.Object({
            category: t.String(),
            description: t.String(),
            city: t.String(),
            postalCode: t.String(),
            coverImage: t.Optional(t.String()),
            yearsExperience: t.Optional(t.Number()),
            priceInfo: t.Optional(t.String()),
          }),
        },
      ),
  )

  // Devis
  .group("/quotes", (app) =>
    app
      .use(requireAuth)
      // Liste mes devis
      .get(
        "/",
        async ({ user: currentUser, query }) => {
          const page = parseInt(query.page || "1");
          const limit = parseInt(query.limit || "20");
          const offset = (page - 1) * limit;

          // Vérifier si l'utilisateur est un pro
          const myProfile = await db.query.partnerProfile.findFirst({
            where: eq(partnerProfile.userId, currentUser!.id),
          });

          const condition = myProfile
            ? sql`(${quote.requesterId} = ${currentUser!.id} OR ${quote.partnerId} = ${myProfile.id})`
            : eq(quote.requesterId, currentUser!.id);

          const statusFilter = query.status
            ? and(condition, eq(quote.status, query.status as any))
            : condition;

          const [items, totalResult] = await Promise.all([
            db
              .select()
              .from(quote)
              .innerJoin(partnerProfile, eq(quote.partnerId, partnerProfile.id))
              .innerJoin(user, eq(partnerProfile.userId, user.id))
              .where(statusFilter)
              .orderBy(desc(quote.createdAt))
              .limit(limit)
              .offset(offset),
            db
              .select({ count: count() })
              .from(quote)
              .where(statusFilter),
          ]);

          return {
            items: items.map((row) => ({
              ...row.quote,
              partner: {
                ...row.partner_profile,
                user: {
                  id: row.user.id,
                  name: row.user.name,
                  companyName: row.user.companyName,
                  image: row.user.image,
                },
              },
            })),
            total: totalResult[0].count,
            page,
            limit,
          };
        },
        {
          query: t.Object({
            status: t.Optional(t.String()),
            page: t.Optional(t.String()),
            limit: t.Optional(t.String()),
          }),
        },
      )
      // Détail devis
      .get("/:id", async ({ params, user: currentUser, set }) => {
        const result = await db
          .select()
          .from(quote)
          .innerJoin(partnerProfile, eq(quote.partnerId, partnerProfile.id))
          .innerJoin(user, eq(partnerProfile.userId, user.id))
          .where(eq(quote.id, params.id))
          .limit(1);

        if (result.length === 0) {
          set.status = 404;
          return { error: "Devis introuvable" };
        }

        const row = result[0];
        const myProfile = await db.query.partnerProfile.findFirst({
          where: eq(partnerProfile.userId, currentUser!.id),
        });

        const isRequester = row.quote.requesterId === currentUser!.id;
        const isPartner = myProfile?.id === row.quote.partnerId;
        const isAdmin = currentUser!.role === "admin";

        if (!isRequester && !isPartner && !isAdmin) {
          set.status = 403;
          return { error: "Non autorisé" };
        }

        return {
          ...row.quote,
          partner: {
            ...row.partner_profile,
            user: {
              id: row.user.id,
              name: row.user.name,
              companyName: row.user.companyName,
              image: row.user.image,
            },
          },
        };
      })
      // Demander un devis
      .post(
        "/",
        async ({ body, user: currentUser, set }) => {
          const partner = await db.query.partnerProfile.findFirst({
            where: eq(partnerProfile.id, body.partnerId),
          });

          if (!partner) {
            set.status = 404;
            return { error: "Partenaire introuvable" };
          }

          // Générer référence
          const [countResult] = await db
            .select({ count: count() })
            .from(quote);
          const ref = `D-${String(countResult.count + 1).padStart(3, "0")}`;

          const id = nanoid();
          const [created] = await db
            .insert(quote)
            .values({
              id,
              reference: ref,
              requesterId: currentUser!.id,
              partnerId: body.partnerId,
              propertyId: body.propertyId || null,
              category: partner.category,
              description: body.description,
            })
            .returning();

          // Notification pour le professionnel
          await db.insert(notification).values({
            id: nanoid(),
            userId: partner.userId,
            type: "system",
            title: "Nouvelle demande de devis",
            message: `Vous avez reçu une demande de devis (${ref})`,
            link: `/marketplace/quotes`,
          });

          return created;
        },
        {
          body: t.Object({
            partnerId: t.String(),
            description: t.String(),
            propertyId: t.Optional(t.String()),
          }),
        },
      )
      // MàJ devis (répondre, accepter, refuser)
      .put(
        "/:id",
        async ({ params, body, user: currentUser, set }) => {
          const existing = await db.query.quote.findFirst({
            where: eq(quote.id, params.id),
          });

          if (!existing) {
            set.status = 404;
            return { error: "Devis introuvable" };
          }

          const myProfile = await db.query.partnerProfile.findFirst({
            where: eq(partnerProfile.userId, currentUser!.id),
          });

          const isRequester = existing.requesterId === currentUser!.id;
          const isPartner = myProfile?.id === existing.partnerId;

          if (!isRequester && !isPartner && currentUser!.role !== "admin") {
            set.status = 403;
            return { error: "Non autorisé" };
          }

          const updateData: Record<string, unknown> = { updatedAt: new Date() };

          // Le pro peut répondre (envoyer devis)
          if (isPartner && body.status === "envoye") {
            updateData.status = "envoye";
            if (body.amount !== undefined) updateData.amount = body.amount;
            if (body.responseMessage) updateData.responseMessage = body.responseMessage;
            if (body.validUntil) updateData.validUntil = new Date(body.validUntil);
            if (body.pdfPath) updateData.pdfPath = body.pdfPath;
          }

          // Le demandeur peut accepter ou refuser
          if (isRequester && (body.status === "accepte" || body.status === "refuse")) {
            updateData.status = body.status;
          }

          // Admin peut tout modifier
          if (currentUser!.role === "admin" && body.status) {
            updateData.status = body.status;
            if (body.amount !== undefined) updateData.amount = body.amount;
          }

          const [updated] = await db
            .update(quote)
            .set(updateData)
            .where(eq(quote.id, params.id))
            .returning();

          // Notification changement statut
          if (body.status) {
            const notifUserId = isPartner ? existing.requesterId : myProfile?.userId;
            if (notifUserId) {
              await db.insert(notification).values({
                id: nanoid(),
                userId: notifUserId,
                type: "system",
                title: "Mise à jour de devis",
                message: `Le devis ${existing.reference} a été mis à jour`,
                link: `/marketplace/quotes`,
              });
            }
          }

          return updated;
        },
        {
          body: t.Object({
            status: t.Optional(t.String()),
            amount: t.Optional(t.Number()),
            responseMessage: t.Optional(t.String()),
            validUntil: t.Optional(t.String()),
            pdfPath: t.Optional(t.String()),
          }),
        },
      ),
  )

  // Avis
  .group("/reviews", (app) =>
    app.use(requireAuth).post(
      "/",
      async ({ body, user: currentUser, set }) => {
        // Vérifier qu'un devis accepté existe entre cet utilisateur et ce partenaire
        const acceptedQuote = await db.query.quote.findFirst({
          where: and(
            eq(quote.requesterId, currentUser!.id),
            eq(quote.partnerId, body.partnerId),
            eq(quote.status, "accepte"),
          ),
        });

        if (!acceptedQuote) {
          set.status = 400;
          return {
            error:
              "Vous devez avoir un devis accepté pour laisser un avis",
          };
        }

        // Vérifier pas de doublon
        const existingReview = await db.query.partnerReview.findFirst({
          where: and(
            eq(partnerReview.partnerId, body.partnerId),
            eq(partnerReview.reviewerId, currentUser!.id),
          ),
        });

        if (existingReview) {
          set.status = 400;
          return { error: "Vous avez déjà laissé un avis pour ce partenaire" };
        }

        const id = nanoid();
        const [created] = await db
          .insert(partnerReview)
          .values({
            id,
            partnerId: body.partnerId,
            reviewerId: currentUser!.id,
            rating: body.rating,
            comment: body.comment || null,
          })
          .returning();

        // Recalculer la moyenne et le count
        const [stats] = await db
          .select({
            avgRating: sql<string>`AVG(${partnerReview.rating})::numeric(2,1)`,
            total: count(),
          })
          .from(partnerReview)
          .where(eq(partnerReview.partnerId, body.partnerId));

        await db
          .update(partnerProfile)
          .set({
            rating: stats.avgRating,
            reviewCount: stats.total,
            updatedAt: new Date(),
          })
          .where(eq(partnerProfile.id, body.partnerId));

        return created;
      },
      {
        body: t.Object({
          partnerId: t.String(),
          rating: t.Number({ minimum: 1, maximum: 5 }),
          comment: t.Optional(t.String()),
        }),
      },
    ),
  );
