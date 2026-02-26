import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";
import { eq, and, gte, lte, sql, inArray } from "drizzle-orm";
import { db } from "../db";
import { property, propertyFile, quote, partnerProfile } from "../db/schema";
import { requireAuth } from "../middleware/auth";

// --- Scoring PV (pure function, score 0-100) ---

interface PvBreakdown {
  roofSurface: number;
  parkingSurface: number;
  orientation: number;
  energyClass: number;
  location: number;
}

function computePvScore(p: {
  surface: string | null;
  roofSurface: string | null;
  parkingSurface: string | null;
  parkingSpots: number | null;
  roofOrientation: string | null;
  energyClass: string | null;
  latitude: string | null;
}): { score: number; label: string; breakdown: PvBreakdown } {
  // Surface toiture (max 30 pts)
  let roofSurf = p.roofSurface ? parseFloat(p.roofSurface) : null;
  if (roofSurf === null && p.surface) {
    roofSurf = parseFloat(p.surface) * 0.7;
  }
  const roofPts = roofSurf !== null ? Math.min(30, (roofSurf / 1000) * 30) : 0;

  // Surface parking (max 20 pts)
  let parkSurf = p.parkingSurface ? parseFloat(p.parkingSurface) : null;
  if (parkSurf === null && p.parkingSpots) {
    parkSurf = p.parkingSpots * 12.5;
  }
  const parkPts = parkSurf !== null ? Math.min(20, (parkSurf / 500) * 20) : 0;

  // Orientation (max 25 pts)
  const orientationScores: Record<string, number> = {
    sud: 25,
    sud_est: 20,
    sud_ouest: 20,
    plate: 15,
    est: 10,
    ouest: 10,
    inconnue: 10,
    nord: 5,
  };
  const orientPts = orientationScores[p.roofOrientation || "inconnue"] ?? 10;

  // Classe énergie (max 15 pts) — pire classe = plus de bénéfice PV
  const energyScores: Record<string, number> = {
    G: 15,
    F: 13,
    E: 11,
    D: 9,
    C: 7,
    B: 4,
    A: 1,
  };
  const energyPts = energyScores[p.energyClass || ""] ?? 8;

  // Localisation (max 10 pts) — latitude sud France = meilleure irradiation
  let locPts = 5; // default mid-France
  if (p.latitude) {
    const lat = parseFloat(p.latitude);
    if (!isNaN(lat)) {
      // 42° (sud) = 10pts, 51° (nord) = 2pts, interpolation linéaire
      locPts = Math.max(2, Math.min(10, 10 - ((lat - 42) / (51 - 42)) * 8));
    }
  }

  const score = Math.round(roofPts + parkPts + orientPts + energyPts + locPts);

  let label: string;
  if (score >= 80) label = "Excellent";
  else if (score >= 50) label = "Bon";
  else if (score >= 30) label = "Modéré";
  else label = "Faible";

  return {
    score,
    label,
    breakdown: {
      roofSurface: Math.round(roofPts),
      parkingSurface: Math.round(parkPts),
      orientation: Math.round(orientPts),
      energyClass: Math.round(energyPts),
      location: Math.round(locPts),
    },
  };
}

export const energyRoutes = new Elysia({ prefix: "/api/energy" })
  .use(requireAuth)
  .onBeforeHandle({ as: "local" }, ({ user, set }) => {
    if (!["partenaire_energie", "admin"].includes(user!.role)) {
      set.status = 403;
      return { error: "Accès réservé aux partenaires énergie" };
    }
  })

  // GET /api/energy/properties — Liste biens avec score PV
  .get(
    "/properties",
    async ({ query }) => {
      const {
        roofSurfaceMin,
        parkingSurfaceMin,
        orientation,
        city,
        propertyType,
        scoreMin,
        bounds,
        sortBy = "score",
        sortOrder = "desc",
        page = "1",
        limit = "20",
      } = query;

      const conditions = [eq(property.status, "publie")];

      if (city) {
        conditions.push(eq(property.city, city));
      }
      if (propertyType) {
        conditions.push(eq(property.type, propertyType as any));
      }
      if (orientation) {
        conditions.push(eq(property.roofOrientation, orientation as any));
      }
      if (roofSurfaceMin) {
        conditions.push(gte(property.roofSurface, roofSurfaceMin));
      }
      if (parkingSurfaceMin) {
        conditions.push(gte(property.parkingSurface, parkingSurfaceMin));
      }

      // Bounding box
      if (bounds) {
        const [swLat, swLng, neLat, neLng] = bounds.split(",").map(Number);
        if (!isNaN(swLat) && !isNaN(swLng) && !isNaN(neLat) && !isNaN(neLng)) {
          conditions.push(
            gte(sql`CAST(${property.latitude} AS double precision)`, swLat),
            lte(sql`CAST(${property.latitude} AS double precision)`, neLat),
            gte(sql`CAST(${property.longitude} AS double precision)`, swLng),
            lte(sql`CAST(${property.longitude} AS double precision)`, neLng),
          );
        }
      }

      const where = and(...conditions);

      const items = await db.select().from(property).where(where).limit(200);

      // Photos
      const propertyIds = items.map((p) => p.id);
      const files =
        propertyIds.length > 0
          ? await db
              .select()
              .from(propertyFile)
              .where(
                and(
                  inArray(propertyFile.propertyId, propertyIds),
                  eq(propertyFile.fileType, "photo"),
                ),
              )
              .orderBy(propertyFile.sortOrder)
          : [];

      const filesByProperty = new Map<string, (typeof files)[0][]>();
      for (const f of files) {
        const list = filesByProperty.get(f.propertyId) || [];
        list.push(f);
        filesByProperty.set(f.propertyId, list);
      }

      // Scoring PV
      const scoreMinNum = scoreMin ? parseInt(scoreMin) : 0;

      const scored = items
        .map((p) => {
          const { score, label, breakdown } = computePvScore(p);
          return {
            ...p,
            photos: filesByProperty.get(p.id) || [],
            pvScore: score,
            pvLabel: label,
            pvBreakdown: breakdown,
          };
        })
        .filter((p) => p.pvScore >= scoreMinNum);

      // Tri
      scored.sort((a, b) => {
        let cmp = 0;
        if (sortBy === "score") cmp = a.pvScore - b.pvScore;
        else if (sortBy === "surface")
          cmp = parseFloat(a.surface || "0") - parseFloat(b.surface || "0");
        else if (sortBy === "city") cmp = (a.city || "").localeCompare(b.city || "");
        return sortOrder === "desc" ? -cmp : cmp;
      });

      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;
      const paged = scored.slice(offset, offset + limitNum);

      return {
        items: paged,
        total: scored.length,
        page: pageNum,
        limit: limitNum,
      };
    },
    {
      query: t.Object({
        roofSurfaceMin: t.Optional(t.String()),
        parkingSurfaceMin: t.Optional(t.String()),
        orientation: t.Optional(t.String()),
        city: t.Optional(t.String()),
        propertyType: t.Optional(t.String()),
        scoreMin: t.Optional(t.String()),
        bounds: t.Optional(t.String()),
        sortBy: t.Optional(t.String()),
        sortOrder: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    },
  )

  // GET /api/energy/properties/:id — Détail avec breakdown PV
  .get("/properties/:id", async ({ params, set }) => {
    const item = await db.query.property.findFirst({
      where: eq(property.id, params.id),
    });

    if (!item) {
      set.status = 404;
      return { error: "Bien introuvable" };
    }

    const photos = await db
      .select()
      .from(propertyFile)
      .where(
        and(
          eq(propertyFile.propertyId, item.id),
          eq(propertyFile.fileType, "photo"),
        ),
      )
      .orderBy(propertyFile.sortOrder);

    const { score, label, breakdown } = computePvScore(item);

    return {
      ...item,
      photos,
      pvScore: score,
      pvLabel: label,
      pvBreakdown: breakdown,
    };
  })

  // GET /api/energy/stats — KPIs
  .get("/stats", async () => {
    const items = await db
      .select()
      .from(property)
      .where(eq(property.status, "publie"));

    let totalEligible = 0;
    let totalScore = 0;
    let excellentCount = 0;
    const cityCount = new Map<string, number>();

    for (const p of items) {
      const { score } = computePvScore(p);
      if (score >= 30) {
        totalEligible++;
        totalScore += score;
        if (score >= 80) excellentCount++;
        if (p.city) {
          cityCount.set(p.city, (cityCount.get(p.city) || 0) + 1);
        }
      }
    }

    const topCities = Array.from(cityCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));

    return {
      totalEligible,
      avgScore: totalEligible > 0 ? Math.round(totalScore / totalEligible) : 0,
      excellentCount,
      topCities,
    };
  })

  // POST /api/energy/proposals — Proposition PV
  .post(
    "/proposals",
    async ({ body, user: currentUser, set }) => {
      // Trouver le partnerProfile du user
      const profile = await db.query.partnerProfile.findFirst({
        where: eq(partnerProfile.userId, currentUser!.id),
      });

      if (!profile) {
        set.status = 400;
        return { error: "Profil partenaire requis pour envoyer une proposition" };
      }

      const id = nanoid();
      const reference = `PV-${Date.now().toString(36).toUpperCase()}`;
      const now = new Date();

      await db.insert(quote).values({
        id,
        reference,
        requesterId: currentUser!.id,
        partnerId: profile.id,
        propertyId: body.propertyId,
        category: "energie_durable",
        description: body.description,
        status: "demande",
        createdAt: now,
        updatedAt: now,
      });

      return { id, reference };
    },
    {
      body: t.Object({
        propertyId: t.String(),
        description: t.String(),
      }),
    },
  );
