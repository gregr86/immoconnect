import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "../db";
import { notification, notificationPreference } from "../db/schema";
import { requireAuth } from "../middleware/auth";

export const notificationRoutes = new Elysia({ prefix: "/api/notifications" })
  .use(requireAuth)

  // Liste notifications paginée
  .get(
    "/",
    async ({ user: currentUser, query }) => {
      const limit = Math.min(parseInt(query.limit || "20"), 50);
      const offset = parseInt(query.offset || "0");

      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(notification)
          .where(eq(notification.userId, currentUser!.id))
          .orderBy(desc(notification.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(notification)
          .where(eq(notification.userId, currentUser!.id)),
      ]);

      return {
        items,
        total: Number(countResult[0].count),
        limit,
        offset,
      };
    },
    {
      query: t.Object({
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
      }),
    },
  )

  // Marquer une notification lue
  .post("/:id/read", async ({ params, user: currentUser, set }) => {
    const notif = await db.query.notification.findFirst({
      where: and(
        eq(notification.id, params.id),
        eq(notification.userId, currentUser!.id),
      ),
    });

    if (!notif) {
      set.status = 404;
      return { error: "Notification introuvable" };
    }

    await db
      .update(notification)
      .set({ read: true })
      .where(eq(notification.id, params.id));

    return { success: true };
  })

  // Tout marquer lu
  .post("/read-all", async ({ user: currentUser }) => {
    await db
      .update(notification)
      .set({ read: true })
      .where(
        and(
          eq(notification.userId, currentUser!.id),
          eq(notification.read, false),
        ),
      );

    return { success: true };
  })

  // Compteur non-lues
  .get("/unread-count", async ({ user: currentUser }) => {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notification)
      .where(
        and(
          eq(notification.userId, currentUser!.id),
          eq(notification.read, false),
        ),
      );

    return { count: Number(result.count) };
  })

  // Préférences
  .get("/preferences", async ({ user: currentUser }) => {
    let prefs = await db.query.notificationPreference.findFirst({
      where: eq(notificationPreference.userId, currentUser!.id),
    });

    if (!prefs) {
      // Retourner les valeurs par défaut
      return {
        emailNewMessage: true,
        emailPropertyStatus: true,
        emailNewMatch: true,
      };
    }

    return {
      emailNewMessage: prefs.emailNewMessage,
      emailPropertyStatus: prefs.emailPropertyStatus,
      emailNewMatch: prefs.emailNewMatch,
    };
  })

  // Mettre à jour préférences
  .put(
    "/preferences",
    async ({ body, user: currentUser }) => {
      const existing = await db.query.notificationPreference.findFirst({
        where: eq(notificationPreference.userId, currentUser!.id),
      });

      if (existing) {
        await db
          .update(notificationPreference)
          .set({
            ...body,
            updatedAt: new Date(),
          })
          .where(eq(notificationPreference.id, existing.id));
      } else {
        await db.insert(notificationPreference).values({
          id: nanoid(),
          userId: currentUser!.id,
          ...body,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return { success: true };
    },
    {
      body: t.Object({
        emailNewMessage: t.Optional(t.Boolean()),
        emailPropertyStatus: t.Optional(t.Boolean()),
        emailNewMatch: t.Optional(t.Boolean()),
      }),
    },
  );
