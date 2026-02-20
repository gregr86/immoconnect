import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";
import { eq, and, gte, lte, inArray, sql, desc, asc } from "drizzle-orm";
import { db } from "../db";
import { property, searchCriteria, propertyFile } from "../db/schema";
import { authMiddleware, requireAuth } from "../middleware/auth";

// Haversine distance en km
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Score pour une valeur dans une fourchette (0-1)
function rangeScore(
  value: number | null,
  min: number | null,
  max: number | null,
): number {
  if (value === null) return 0.5;
  if (min === null && max === null) return 1;
  if (min !== null && max !== null) {
    if (value >= min && value <= max) return 1;
    const range = max - min;
    if (range === 0) return value === min ? 1 : 0;
    const tolerance = range * 0.2;
    if (value < min) return Math.max(0, 1 - (min - value) / tolerance);
    return Math.max(0, 1 - (value - max) / tolerance);
  }
  if (min !== null) {
    if (value >= min) return 1;
    const tolerance = min * 0.2 || 1;
    return Math.max(0, 1 - (min - value) / tolerance);
  }
  if (max !== null) {
    if (value <= max) return 1;
    const tolerance = max * 0.2 || 1;
    return Math.max(0, 1 - (value - max) / tolerance);
  }
  return 1;
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 50) return "Bon";
  return "Faible";
}

export const searchRoutes = new Elysia({ prefix: "/api/search" })
  .use(authMiddleware)
  // Recherche avec scoring
  .get(
    "/",
    async ({ query }) => {
      const {
        types,
        city,
        lat,
        lng,
        radius = "10",
        surfaceMin,
        surfaceMax,
        rentMin,
        rentMax,
        accessibility,
        parking,
        airConditioning,
        sortBy = "score",
        sortOrder = "desc",
        bounds,
        page = "1",
        limit = "20",
      } = query;

      const conditions = [eq(property.status, "publie")];

      // Filtre par type
      const typeList = types?.split(",").filter(Boolean);
      if (typeList?.length) {
        conditions.push(inArray(property.type, typeList as any));
      }

      // Filtre par ville
      if (city) {
        conditions.push(eq(property.city, city));
      }

      // Filtre surface
      if (surfaceMin) {
        conditions.push(gte(property.surface, surfaceMin));
      }
      if (surfaceMax) {
        conditions.push(lte(property.surface, surfaceMax));
      }

      // Filtre loyer
      if (rentMin) {
        conditions.push(gte(property.rent, rentMin));
      }
      if (rentMax) {
        conditions.push(lte(property.rent, rentMax));
      }

      // Filtre booleans
      if (accessibility === "true") {
        conditions.push(eq(property.accessibility, true));
      }
      if (parking === "true") {
        conditions.push(gte(property.parkingSpots, 1));
      }
      if (airConditioning === "true") {
        conditions.push(eq(property.airConditioning, true));
      }

      // Bounding box pour recherche viewport
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

      // Récupérer les propriétés filtrées (max 200 pour scoring)
      const items = await db
        .select()
        .from(property)
        .where(where)
        .limit(200);

      // Récupérer les photos pour chaque propriété
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

      // Paramètres de scoring
      const hasGeo = lat && lng;
      const searchLat = hasGeo ? parseFloat(lat!) : null;
      const searchLng = hasGeo ? parseFloat(lng!) : null;
      const searchRadius = parseFloat(radius);
      const sMin = surfaceMin ? parseFloat(surfaceMin) : null;
      const sMax = surfaceMax ? parseFloat(surfaceMax) : null;
      const rMin = rentMin ? parseFloat(rentMin) : null;
      const rMax = rentMax ? parseFloat(rentMax) : null;

      // Scoring
      const scored = items.map((p) => {
        let score = 0;

        // Proximité (30 pts)
        if (searchLat !== null && searchLng !== null && p.latitude && p.longitude) {
          const dist = haversineDistance(
            searchLat,
            searchLng,
            parseFloat(p.latitude),
            parseFloat(p.longitude),
          );
          score += Math.max(0, 30 * (1 - dist / searchRadius));
        } else {
          score += 30; // Full si pas de critère géo
        }

        // Type (25 pts)
        if (typeList?.length) {
          score += typeList.includes(p.type) ? 25 : 0;
        } else {
          score += 25;
        }

        // Surface (15 pts)
        const surfVal = p.surface ? parseFloat(p.surface) : null;
        score += 15 * rangeScore(surfVal, sMin, sMax);

        // Loyer (15 pts)
        const rentVal = p.rent ? parseFloat(p.rent) : null;
        score += 15 * rangeScore(rentVal, rMin, rMax);

        // Caractéristiques (15 pts = 5 chacun)
        let featureScore = 0;
        let featureCount = 0;
        if (accessibility === "true") {
          featureCount++;
          if (p.accessibility) featureScore += 5;
        }
        if (parking === "true") {
          featureCount++;
          if (p.parkingSpots && p.parkingSpots > 0) featureScore += 5;
        }
        if (airConditioning === "true") {
          featureCount++;
          if (p.airConditioning) featureScore += 5;
        }
        score += featureCount > 0 ? featureScore : 15;

        const finalScore = Math.round(score);

        return {
          ...p,
          photos: filesByProperty.get(p.id) || [],
          score: finalScore,
          scoreLabel: scoreLabel(finalScore),
        };
      });

      // Tri
      scored.sort((a, b) => {
        let cmp = 0;
        if (sortBy === "score") cmp = a.score - b.score;
        else if (sortBy === "rent")
          cmp = parseFloat(a.rent || "0") - parseFloat(b.rent || "0");
        else if (sortBy === "surface")
          cmp = parseFloat(a.surface || "0") - parseFloat(b.surface || "0");
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
        types: t.Optional(t.String()),
        city: t.Optional(t.String()),
        lat: t.Optional(t.String()),
        lng: t.Optional(t.String()),
        radius: t.Optional(t.String()),
        surfaceMin: t.Optional(t.String()),
        surfaceMax: t.Optional(t.String()),
        rentMin: t.Optional(t.String()),
        rentMax: t.Optional(t.String()),
        accessibility: t.Optional(t.String()),
        parking: t.Optional(t.String()),
        airConditioning: t.Optional(t.String()),
        sortBy: t.Optional(t.String()),
        sortOrder: t.Optional(t.String()),
        bounds: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    },
  )

  // Sauvegarder une recherche
  .use(requireAuth)
  .post(
    "/criteria",
    async ({ body, user: currentUser }) => {
      const id = nanoid();
      const now = new Date();

      await db.insert(searchCriteria).values({
        id,
        userId: currentUser!.id,
        name: body.name,
        propertyTypes: body.propertyTypes,
        city: body.city,
        postalCode: body.postalCode,
        latitude: body.latitude,
        longitude: body.longitude,
        radiusKm: body.radiusKm,
        surfaceMin: body.surfaceMin,
        surfaceMax: body.surfaceMax,
        rentMin: body.rentMin,
        rentMax: body.rentMax,
        accessibility: body.accessibility,
        parking: body.parking,
        airConditioning: body.airConditioning,
        createdAt: now,
        updatedAt: now,
      });

      return { id };
    },
    {
      body: t.Object({
        name: t.String(),
        propertyTypes: t.Optional(t.String()),
        city: t.Optional(t.String()),
        postalCode: t.Optional(t.String()),
        latitude: t.Optional(t.String()),
        longitude: t.Optional(t.String()),
        radiusKm: t.Optional(t.String()),
        surfaceMin: t.Optional(t.String()),
        surfaceMax: t.Optional(t.String()),
        rentMin: t.Optional(t.String()),
        rentMax: t.Optional(t.String()),
        accessibility: t.Optional(t.Boolean()),
        parking: t.Optional(t.Boolean()),
        airConditioning: t.Optional(t.Boolean()),
      }),
    },
  )

  // Lister ses recherches sauvegardées
  .get("/criteria", async ({ user: currentUser }) => {
    const items = await db
      .select()
      .from(searchCriteria)
      .where(eq(searchCriteria.userId, currentUser!.id))
      .orderBy(desc(searchCriteria.createdAt));

    return { items };
  })

  // Supprimer une recherche
  .delete("/criteria/:id", async ({ params, user: currentUser, set }) => {
    const existing = await db.query.searchCriteria.findFirst({
      where: eq(searchCriteria.id, params.id),
    });

    if (!existing) {
      set.status = 404;
      return { error: "Recherche introuvable" };
    }

    if (existing.userId !== currentUser!.id) {
      set.status = 403;
      return { error: "Non autorisé" };
    }

    await db.delete(searchCriteria).where(eq(searchCriteria.id, params.id));
    return { success: true };
  });
