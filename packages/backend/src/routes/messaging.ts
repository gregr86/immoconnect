import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";
import { eq, desc, and, lt, sql, inArray } from "drizzle-orm";
import { db } from "../db";
import {
  conversation,
  conversationParticipant,
  message,
  messageAttachment,
  notification,
  property,
  propertyFile,
  user,
} from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { join, extname } from "path";
import { mkdir } from "fs/promises";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

export const messagingRoutes = new Elysia({ prefix: "/api/messaging" })
  .use(requireAuth)

  // Liste conversations
  .get(
    "/conversations",
    async ({ user: currentUser, query }) => {
      const { search } = query;

      // Récupérer les conversations auxquelles l'utilisateur participe
      const participations = await db
        .select({ conversationId: conversationParticipant.conversationId })
        .from(conversationParticipant)
        .where(eq(conversationParticipant.userId, currentUser!.id));

      if (participations.length === 0) {
        return { items: [] };
      }

      const convIds = participations.map((p) => p.conversationId);

      const conversations = await db
        .select()
        .from(conversation)
        .where(inArray(conversation.id, convIds))
        .orderBy(desc(conversation.updatedAt));

      const items = await Promise.all(
        conversations.map(async (conv) => {
          // Dernier message
          const [lastMsg] = await db
            .select()
            .from(message)
            .where(eq(message.conversationId, conv.id))
            .orderBy(desc(message.createdAt))
            .limit(1);

          // Sender du dernier message
          let lastMessageSender = null;
          if (lastMsg) {
            lastMessageSender = await db.query.user.findFirst({
              where: eq(user.id, lastMsg.senderId),
              columns: { id: true, name: true, image: true },
            });
          }

          // Participants
          const parts = await db
            .select({
              userId: conversationParticipant.userId,
              name: user.name,
              image: user.image,
              companyName: user.companyName,
            })
            .from(conversationParticipant)
            .innerJoin(user, eq(user.id, conversationParticipant.userId))
            .where(eq(conversationParticipant.conversationId, conv.id));

          // Unread count
          const myParticipation = await db.query.conversationParticipant.findFirst({
            where: and(
              eq(conversationParticipant.conversationId, conv.id),
              eq(conversationParticipant.userId, currentUser!.id),
            ),
          });

          let unreadCount = 0;
          if (myParticipation) {
            const condition = myParticipation.lastReadAt
              ? and(
                  eq(message.conversationId, conv.id),
                  lt(myParticipation.lastReadAt, message.createdAt),
                )
              : eq(message.conversationId, conv.id);

            const [result] = await db
              .select({ count: sql<number>`count(*)` })
              .from(message)
              .where(condition);
            unreadCount = Number(result.count);
          }

          // Property info
          const prop = await db.query.property.findFirst({
            where: eq(property.id, conv.propertyId),
            columns: { id: true, title: true, city: true },
          });

          return {
            ...conv,
            property: prop,
            participants: parts,
            lastMessage: lastMsg
              ? {
                  id: lastMsg.id,
                  content: lastMsg.content,
                  senderId: lastMsg.senderId,
                  senderName: lastMessageSender?.name ?? null,
                  createdAt: lastMsg.createdAt,
                }
              : null,
            unreadCount,
          };
        }),
      );

      // Filtrage par recherche
      const filtered = search
        ? items.filter(
            (item) =>
              item.property?.title?.toLowerCase().includes(search.toLowerCase()) ||
              item.participants.some((p) =>
                p.name.toLowerCase().includes(search.toLowerCase()),
              ),
          )
        : items;

      return { items: filtered };
    },
    {
      query: t.Object({
        search: t.Optional(t.String()),
      }),
    },
  )

  // Détail conversation
  .get("/conversations/:id", async ({ params, user: currentUser, set }) => {
    // Vérifier participation
    const participation = await db.query.conversationParticipant.findFirst({
      where: and(
        eq(conversationParticipant.conversationId, params.id),
        eq(conversationParticipant.userId, currentUser!.id),
      ),
    });

    if (!participation) {
      set.status = 403;
      return { error: "Vous ne participez pas à cette conversation" };
    }

    const conv = await db.query.conversation.findFirst({
      where: eq(conversation.id, params.id),
    });

    if (!conv) {
      set.status = 404;
      return { error: "Conversation introuvable" };
    }

    // Property avec fichiers photos
    const prop = await db.query.property.findFirst({
      where: eq(property.id, conv.propertyId),
    });

    let propertyPhotos: any[] = [];
    if (prop) {
      propertyPhotos = await db
        .select()
        .from(propertyFile)
        .where(
          and(
            eq(propertyFile.propertyId, prop.id),
            eq(propertyFile.fileType, "photo"),
          ),
        )
        .orderBy(propertyFile.sortOrder)
        .limit(1);
    }

    // Participants
    const parts = await db
      .select({
        userId: conversationParticipant.userId,
        name: user.name,
        image: user.image,
        companyName: user.companyName,
        role: user.role,
        lastReadAt: conversationParticipant.lastReadAt,
        joinedAt: conversationParticipant.joinedAt,
      })
      .from(conversationParticipant)
      .innerJoin(user, eq(user.id, conversationParticipant.userId))
      .where(eq(conversationParticipant.conversationId, params.id));

    // Documents partagés (pièces jointes de la conversation)
    const sharedDocs = await db
      .select({
        id: messageAttachment.id,
        fileName: messageAttachment.fileName,
        originalName: messageAttachment.originalName,
        mimeType: messageAttachment.mimeType,
        size: messageAttachment.size,
        createdAt: messageAttachment.createdAt,
        uploadedBy: messageAttachment.uploadedBy,
      })
      .from(messageAttachment)
      .innerJoin(message, eq(message.id, messageAttachment.messageId))
      .where(eq(message.conversationId, params.id))
      .orderBy(desc(messageAttachment.createdAt));

    return {
      ...conv,
      property: prop ? { ...prop, photos: propertyPhotos } : null,
      participants: parts,
      sharedDocuments: sharedDocs,
    };
  })

  // Créer conversation
  .post(
    "/conversations",
    async ({ body, user: currentUser, set }) => {
      // Vérifier que la property existe
      const prop = await db.query.property.findFirst({
        where: eq(property.id, body.propertyId),
      });

      if (!prop) {
        set.status = 404;
        return { error: "Annonce introuvable" };
      }

      const convId = nanoid();
      const now = new Date();

      await db.insert(conversation).values({
        id: convId,
        propertyId: body.propertyId,
        subject: body.subject,
        createdBy: currentUser!.id,
        createdAt: now,
        updatedAt: now,
      });

      // Ajouter le créateur comme participant
      const allParticipants = [
        currentUser!.id,
        ...body.participantIds.filter((id: string) => id !== currentUser!.id),
      ];

      for (const userId of allParticipants) {
        await db.insert(conversationParticipant).values({
          id: nanoid(),
          conversationId: convId,
          userId,
          lastReadAt: userId === currentUser!.id ? now : null,
          joinedAt: now,
        });
      }

      return { id: convId };
    },
    {
      body: t.Object({
        propertyId: t.String(),
        participantIds: t.Array(t.String()),
        subject: t.Optional(t.String()),
      }),
    },
  )

  // Messages paginés
  .get(
    "/conversations/:id/messages",
    async ({ params, query, user: currentUser, set }) => {
      // Vérifier participation
      const participation = await db.query.conversationParticipant.findFirst({
        where: and(
          eq(conversationParticipant.conversationId, params.id),
          eq(conversationParticipant.userId, currentUser!.id),
        ),
      });

      if (!participation) {
        set.status = 403;
        return { error: "Vous ne participez pas à cette conversation" };
      }

      const limit = Math.min(parseInt(query.limit || "30"), 50);
      const conditions = [eq(message.conversationId, params.id)];

      if (query.before) {
        conditions.push(lt(message.createdAt, new Date(query.before)));
      }

      const messages = await db
        .select()
        .from(message)
        .where(and(...conditions))
        .orderBy(desc(message.createdAt))
        .limit(limit);

      // Charger senders et attachments
      const enriched = await Promise.all(
        messages.map(async (msg) => {
          const sender = await db.query.user.findFirst({
            where: eq(user.id, msg.senderId),
            columns: { id: true, name: true, image: true, companyName: true },
          });

          const attachments = await db
            .select()
            .from(messageAttachment)
            .where(eq(messageAttachment.messageId, msg.id));

          return { ...msg, sender, attachments };
        }),
      );

      return {
        items: enriched,
        hasMore: messages.length === limit,
      };
    },
    {
      query: t.Object({
        before: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    },
  )

  // Envoyer message
  .post(
    "/conversations/:id/messages",
    async ({ params, body, user: currentUser, set }) => {
      // Vérifier participation
      const participation = await db.query.conversationParticipant.findFirst({
        where: and(
          eq(conversationParticipant.conversationId, params.id),
          eq(conversationParticipant.userId, currentUser!.id),
        ),
      });

      if (!participation) {
        set.status = 403;
        return { error: "Vous ne participez pas à cette conversation" };
      }

      const msgId = nanoid();
      const now = new Date();

      // Insérer message
      await db.insert(message).values({
        id: msgId,
        conversationId: params.id,
        senderId: currentUser!.id,
        content: body.content || null,
        createdAt: now,
      });

      // Upload fichier si présent
      let attachment = null;
      if (body.file) {
        const file = body.file;
        if (file.size > MAX_FILE_SIZE) {
          set.status = 400;
          return { error: "Fichier trop volumineux (max 10 Mo)" };
        }

        const ext = extname(file.name);
        const fileName = `${nanoid()}${ext}`;
        const dirPath = join(UPLOAD_DIR, "messages", params.id);
        const filePath = join(dirPath, fileName);

        await mkdir(dirPath, { recursive: true });
        const buffer = await file.arrayBuffer();
        await Bun.write(filePath, buffer);

        const attachId = nanoid();
        await db.insert(messageAttachment).values({
          id: attachId,
          messageId: msgId,
          fileName,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          path: filePath,
          uploadedBy: currentUser!.id,
          createdAt: now,
        });

        attachment = {
          id: attachId,
          fileName,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
        };
      }

      // Bump conversation updatedAt
      await db
        .update(conversation)
        .set({ updatedAt: now })
        .where(eq(conversation.id, params.id));

      // Marquer lu pour l'envoyeur
      await db
        .update(conversationParticipant)
        .set({ lastReadAt: now })
        .where(
          and(
            eq(conversationParticipant.conversationId, params.id),
            eq(conversationParticipant.userId, currentUser!.id),
          ),
        );

      // Créer notifications pour les autres participants
      const otherParticipants = await db
        .select({ userId: conversationParticipant.userId })
        .from(conversationParticipant)
        .where(
          and(
            eq(conversationParticipant.conversationId, params.id),
          ),
        );

      const conv = await db.query.conversation.findFirst({
        where: eq(conversation.id, params.id),
      });

      for (const p of otherParticipants) {
        if (p.userId === currentUser!.id) continue;
        await db.insert(notification).values({
          id: nanoid(),
          userId: p.userId,
          type: "new_message",
          title: `Nouveau message de ${currentUser!.name}`,
          message: body.content
            ? body.content.substring(0, 100)
            : "Pièce jointe",
          link: `/messaging?conversation=${params.id}`,
          read: false,
          createdAt: now,
        });
      }

      return {
        id: msgId,
        conversationId: params.id,
        senderId: currentUser!.id,
        content: body.content || null,
        createdAt: now,
        attachment,
      };
    },
    {
      body: t.Object({
        content: t.Optional(t.String()),
        file: t.Optional(t.File()),
      }),
    },
  )

  // Marquer lu
  .post("/conversations/:id/read", async ({ params, user: currentUser, set }) => {
    const participation = await db.query.conversationParticipant.findFirst({
      where: and(
        eq(conversationParticipant.conversationId, params.id),
        eq(conversationParticipant.userId, currentUser!.id),
      ),
    });

    if (!participation) {
      set.status = 403;
      return { error: "Vous ne participez pas à cette conversation" };
    }

    await db
      .update(conversationParticipant)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(conversationParticipant.conversationId, params.id),
          eq(conversationParticipant.userId, currentUser!.id),
        ),
      );

    return { success: true };
  })

  // Total non-lus
  .get("/unread-count", async ({ user: currentUser }) => {
    const participations = await db
      .select({
        conversationId: conversationParticipant.conversationId,
        lastReadAt: conversationParticipant.lastReadAt,
      })
      .from(conversationParticipant)
      .where(eq(conversationParticipant.userId, currentUser!.id));

    let total = 0;
    for (const p of participations) {
      const condition = p.lastReadAt
        ? and(
            eq(message.conversationId, p.conversationId),
            lt(p.lastReadAt, message.createdAt),
          )
        : eq(message.conversationId, p.conversationId);

      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(message)
        .where(condition);
      total += Number(result.count);
    }

    return { count: total };
  })

  // Servir pièces jointes
  .get("/attachments/*", async ({ params, set }) => {
    const filePath = join(UPLOAD_DIR, "messages", (params as any)["*"]);
    const file = Bun.file(filePath);

    if (!(await file.exists())) {
      set.status = 404;
      return { error: "Fichier introuvable" };
    }

    return new Response(file);
  });
