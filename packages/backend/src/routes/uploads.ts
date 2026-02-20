import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { property, propertyFile } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { join, extname } from "path";
import { mkdir, unlink } from "fs/promises";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

export const uploadRoutes = new Elysia({ prefix: "/api" })
  .use(requireAuth)

  // Upload fichier
  .post(
    "/properties/:id/files",
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

      const file = body.file;
      if (file.size > MAX_FILE_SIZE) {
        set.status = 400;
        return { error: "Fichier trop volumineux (max 10 Mo)" };
      }

      const ext = extname(file.name);
      const fileName = `${nanoid()}${ext}`;
      const dirPath = join(UPLOAD_DIR, params.id, body.fileType);
      const filePath = join(dirPath, fileName);

      await mkdir(dirPath, { recursive: true });

      const buffer = await file.arrayBuffer();
      await Bun.write(filePath, buffer);

      const fileId = nanoid();
      await db.insert(propertyFile).values({
        id: fileId,
        propertyId: params.id,
        fileType: body.fileType as any,
        fileName,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: filePath,
        sortOrder: body.sortOrder ? parseInt(body.sortOrder) : 0,
        uploadedBy: currentUser!.id,
        createdAt: new Date(),
      });

      return { id: fileId, fileName, path: `/api/uploads/${params.id}/${body.fileType}/${fileName}` };
    },
    {
      body: t.Object({
        file: t.File(),
        fileType: t.String(),
        sortOrder: t.Optional(t.String()),
      }),
    },
  )

  // Supprimer fichier
  .delete("/files/:id", async ({ params, user: currentUser, set }) => {
    const file = await db.query.propertyFile.findFirst({
      where: eq(propertyFile.id, params.id),
    });

    if (!file) {
      set.status = 404;
      return { error: "Fichier introuvable" };
    }

    // Vérifier que l'utilisateur est propriétaire de l'annonce ou admin
    const prop = await db.query.property.findFirst({
      where: eq(property.id, file.propertyId),
    });

    if (prop?.ownerId !== currentUser!.id && currentUser!.role !== "admin") {
      set.status = 403;
      return { error: "Non autorisé" };
    }

    // Supprimer fichier physique
    try {
      await unlink(file.path);
    } catch {
      // Le fichier peut ne plus exister
    }

    await db.delete(propertyFile).where(eq(propertyFile.id, params.id));
    return { success: true };
  })

  // Servir fichiers statiques
  .get("/uploads/*", async ({ params, set }) => {
    const filePath = join(UPLOAD_DIR, (params as any)["*"]);
    const file = Bun.file(filePath);

    if (!(await file.exists())) {
      set.status = 404;
      return { error: "Fichier introuvable" };
    }

    return new Response(file);
  });
