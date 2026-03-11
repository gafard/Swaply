"use server";

import { Prisma, WalletTxnType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { actionFail, actionOk } from "@/lib/actions/result";
import { assert } from "@/lib/validations";
import { notifyUser } from "@/lib/notify";
import { getDistance } from "@/lib/location";
import {
  getFromCache,
  setInCache,
  CacheKeys,
  invalidateCachePattern,
} from "@/lib/cache";
import { addSwaps } from "@/lib/swaps";
import { presentItem } from "@/lib/item-presenter";
import { resolveLocationSelection } from "@/lib/geo.server";
import { getDistanceToZone, getNeighboringZonesInCity } from "@/lib/geo";
import { checkRateLimit } from "@/lib/rate-limit";

const FAVORITES_WISHLIST_TITLE = "__favorites__";

interface DiscoveryFeed {
  nearby: any[];
  popular: any[];
  deals: any[];
  userZone: string;
}

type DbClient = Prisma.TransactionClient | typeof prisma;
type DiscoveryBucket = "zone" | "neighbor" | "city" | "country" | "global";
type DiscoveryFeedItem = Record<string, any> & {
  id: string;
  createdAt: Date;
  distance: number | null;
  localityBucket: DiscoveryBucket;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Gets fallback location based on first active country/city/zone
 * No hardcoded values - uses database order
 */
async function getFallbackLocation() {
  const country = await prisma.country.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (!country) {
    return { countryId: null, cityId: null, zoneId: null, zoneName: null };
  }

  const city = await prisma.city.findFirst({
    where: {
      countryId: country.id,
      isActive: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!city) {
    return {
      countryId: country.id,
      cityId: null,
      zoneId: null,
      zoneName: null,
    };
  }

  const zone = await prisma.zone.findFirst({
    where: {
      cityId: city.id,
      isActive: true,
    },
    orderBy: { name: "asc" },
  });

  return {
    countryId: country.id,
    cityId: city.id,
    zoneId: zone?.id ?? null,
    zoneName: zone?.name ?? null,
  };
}

async function resolveItemLocation(
  user: Awaited<ReturnType<typeof getCurrentUser>>,
  selection: {
    countryId?: string | null;
    cityId?: string | null;
    zoneId?: string | null;
    zoneName?: string | null;
  }
) {
  if (selection.countryId && selection.cityId && selection.zoneId) {
    const resolved = await resolveLocationSelection(selection);

    return {
      countryId: resolved.country.id,
      cityId: resolved.city.id,
      zoneId: resolved.zone.id,
      zoneName: resolved.zone.name,
    };
  }

  const fallback = await getFallbackLocation();
  const cityId = user?.cityId ?? fallback.cityId;
  const zoneName = selection.zoneName ?? "";

  const zone =
    (zoneName && cityId
      ? await prisma.zone.findFirst({
          where: {
            cityId,
            OR: [{ name: zoneName }, { slug: slugify(zoneName) }],
          },
        })
      : null) ||
    (user?.zoneId
      ? await prisma.zone.findUnique({
          where: { id: user.zoneId },
        })
      : null) ||
    (fallback.zoneId
      ? await prisma.zone.findUnique({
          where: { id: fallback.zoneId },
        })
      : null);

  return {
    countryId: user?.countryId ?? fallback.countryId,
    cityId,
    zoneId: zone?.id ?? user?.zoneId ?? fallback.zoneId,
    zoneName: zone?.name ?? user?.zone?.name ?? fallback.zoneName,
  };
}

async function ensureFavoritesWishlist(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>, item: {
  countryId: string;
  cityId: string;
  zoneId: string | null;
}) {
  const existing = await prisma.wishlist.findFirst({
    where: {
      userId: user.id,
      title: FAVORITES_WISHLIST_TITLE,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.wishlist.create({
    data: {
      userId: user.id,
      countryId: user.countryId ?? item.countryId,
      cityId: user.cityId ?? item.cityId,
      zoneId: user.zoneId ?? item.zoneId,
      title: FAVORITES_WISHLIST_TITLE,
      description: "Favoris utilisateur",
      isActive: true,
    },
  });
}

async function ensureItemMetric(itemId: string, db: DbClient = prisma) {
  return db.itemMetric.upsert({
    where: { itemId },
    update: {},
    create: { itemId },
  });
}

export async function publishItem(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return actionFail("auth_required");
  }

  const title = formData.get("title")?.toString().trim() || "";
  const description = formData.get("description")?.toString().trim() || "";
  const priceSwaps = parseInt(formData.get("creditValue")?.toString() || "0", 10);
  const zoneName = formData.get("locationZone")?.toString().trim() || "";
  const countryId = formData.get("countryId")?.toString().trim() || "";
  const cityId = formData.get("cityId")?.toString().trim() || "";
  const zoneId = formData.get("zoneId")?.toString().trim() || "";
  const lat = formData.get("latitude")
    ? parseFloat(formData.get("latitude")!.toString())
    : null;
  const lng = formData.get("longitude")
    ? parseFloat(formData.get("longitude")!.toString())
    : null;

  const category = formData.get("category")?.toString() || null;
  const brand = formData.get("brand")?.toString() || null;
  const conditionLabel = formData.get("condition")?.toString() || null;
  const aiSuggestedSwaps = formData.get("suggestedValue")
    ? parseInt(formData.get("suggestedValue")!.toString(), 10)
    : null;
  const aiConfidence = formData.get("aiConfidence")
    ? parseFloat(formData.get("aiConfidence")!.toString())
    : null;
  const fraudRisk = formData.get("fraudRisk")?.toString() || null;
  const imageUrls = JSON.parse(formData.get("imageUrls")?.toString() || "[]") as string[];

  if (title.length < 2) {
    return actionFail("title_invalid");
  }

  if (description.length > 0 && description.length < 5) {
    return actionFail("description_invalid");
  }

  if (priceSwaps < 0 || Number.isNaN(priceSwaps)) {
    return actionFail("price_invalid");
  }

  if (imageUrls.length < 2) {
    return actionFail("images_required");
  }

  let location;
  try {
    location = await resolveItemLocation(user, {
      countryId,
      cityId,
      zoneId,
      zoneName,
    });
  } catch {
    return actionFail("location_unavailable");
  }

  if (!location.countryId || !location.cityId || !location.zoneId) {
    return actionFail("location_unavailable");
  }

  try {
    const item = await prisma.item.create({
      data: {
        ownerId: user.id,
        countryId: location.countryId,
        cityId: location.cityId,
        zoneId: location.zoneId,
        lat,
        lng,
        title,
        description,
        category,
        brand,
        conditionLabel,
        priceSwaps,
        aiSuggestedSwaps,
        aiConfidence,
        fraudRisk,
        images: {
          create: imageUrls.map((url, index) => ({
            url,
            orderIndex: index,
          })),
        },
        metric: {
          create: {},
        },
      },
      select: {
        id: true,
      },
    });

    const totalItems = await prisma.item.count({
      where: { ownerId: user.id },
    });

    const awardedFirstPublishBonus = totalItems === 1;

    if (awardedFirstPublishBonus) {
      await addSwaps(
        user.id,
        3,
        WalletTxnType.ADJUSTMENT,
        `Bonus premiere publication: ${title}`,
        true
      );
    }

    invalidateCachePattern("discovery:");

    if (location.zoneId) {
      const localUsers = await prisma.user.findMany({
        where: {
          zoneId: location.zoneId,
          id: { not: user.id },
        },
        select: { id: true, email: true },
      });

      for (const localUser of localUsers) {
        await notifyUser({
          userId: localUser.id,
          email: localUser.email ?? undefined,
          template: "new_local_item",
          payload: {
            itemTitle: title,
            zoneName: location.zoneName,
          },
        });
      }
    }

    revalidatePath("/");
    revalidatePath("/publish");
    revalidatePath("/profile/items");

    return actionOk("item_published", {
      itemId: item.id,
      awardedFirstPublishBonus,
    });
  } catch {
    return actionFail("unexpected_error");
  }
}

export async function reportItem(itemId: string, reason: string, details?: string) {
  const user = await getCurrentUser();
  if (!user) {
    return actionFail("auth_required");
  }

  const rateLimit = checkRateLimit(user.id, "report");
  if (!rateLimit.allowed) {
    return actionFail("rate_limited", {
      retryAfterSeconds: Math.ceil(rateLimit.resetIn / 1000),
    });
  }

  const normalizedReason = reason.trim();
  const normalizedDetails = details?.trim() || null;

  if (normalizedReason.length < 3) {
    return actionFail("report_reason_invalid");
  }

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      ownerId: true,
      title: true,
      owner: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!item) {
    return actionFail("item_not_found");
  }

  if (item.ownerId === user.id) {
    return actionFail("report_own_item");
  }

  const existingReport = await prisma.itemReport.findUnique({
    where: {
      itemId_reporterId: {
        itemId,
        reporterId: user.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingReport) {
    return actionFail("report_already_exists");
  }

  await prisma.$transaction(async (tx) => {
    await tx.itemReport.create({
      data: {
        itemId,
        reporterId: user.id,
        reason: normalizedReason,
        details: normalizedDetails,
      },
    });

    await tx.itemMetric.upsert({
      where: { itemId },
      update: {
        reportsCount: { increment: 1 },
      },
      create: {
        itemId,
        reportsCount: 1,
      },
    });
  });

  if (item.owner.email) {
    await notifyUser({
      userId: item.owner.id,
      email: item.owner.email,
      template: "item_reported_owner",
      payload: {
        itemTitle: item.title,
      },
      link: `/item/${item.id}`,
    });
  }

  return actionOk("report_submitted");
}

export async function incrementItemView(itemId: string, sessionId?: string | null) {
  const [user, item] = await Promise.all([
    getCurrentUser(),
    prisma.item.findUnique({
      where: { id: itemId },
      select: { id: true, ownerId: true },
    }),
  ]);

  assert(!!item, "Objet introuvable.");

  if (user?.id === item.ownerId) {
    return { tracked: false };
  }

  const viewerSessionId = sessionId?.trim() || null;
  if (!user && !viewerSessionId) {
    return { tracked: false };
  }

  await prisma.$transaction(async (tx) => {
    let isUniqueView = false;

    if (user?.id) {
      const existingView = await tx.itemView.findUnique({
        where: {
          itemId_viewerId: {
            itemId,
            viewerId: user.id,
          },
        },
      });

      if (existingView) {
        await tx.itemView.update({
          where: { id: existingView.id },
          data: {
            viewCount: { increment: 1 },
          },
        });
      } else {
        await tx.itemView.create({
          data: {
            itemId,
            viewerId: user.id,
          },
        });
        isUniqueView = true;
      }
    } else if (viewerSessionId) {
      const existingView = await tx.itemView.findUnique({
        where: {
          itemId_sessionId: {
            itemId,
            sessionId: viewerSessionId,
          },
        },
      });

      if (existingView) {
        await tx.itemView.update({
          where: { id: existingView.id },
          data: {
            viewCount: { increment: 1 },
          },
        });
      } else {
        await tx.itemView.create({
          data: {
            itemId,
            sessionId: viewerSessionId,
          },
        });
        isUniqueView = true;
      }
    }

    await tx.itemMetric.upsert({
      where: { itemId },
      update: {
        totalViews: { increment: 1 },
        ...(isUniqueView ? { uniqueViews: { increment: 1 } } : {}),
        lastViewedAt: new Date(),
      },
      create: {
        itemId,
        totalViews: 1,
        uniqueViews: isUniqueView ? 1 : 0,
        lastViewedAt: new Date(),
      },
    });
  });

  return { tracked: true };
}

export async function toggleSaveItem(itemId: string) {
  const user = await getCurrentUser();
  assert(!!user, "Vous devez etre connecte.");

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      countryId: true,
      cityId: true,
      zoneId: true,
    },
  });

  assert(!!item, "Objet introuvable.");

  const wishlist = await ensureFavoritesWishlist(user, item);
  const existingMatch = await prisma.wishlistMatch.findUnique({
    where: {
      wishlistId_itemId: {
        wishlistId: wishlist.id,
        itemId,
      },
    },
  });

  if (existingMatch) {
    await prisma.$transaction(async (tx) => {
      await tx.wishlistMatch.delete({
        where: { id: existingMatch.id },
      });
      await ensureItemMetric(itemId, tx);
      const metric = await tx.itemMetric.findUnique({
        where: { itemId },
        select: { favoritesCount: true },
      });
      if ((metric?.favoritesCount ?? 0) > 0) {
        await tx.itemMetric.update({
          where: { itemId },
          data: {
            favoritesCount: { decrement: 1 },
          },
        });
      }
    });
    revalidatePath("/favorites");
    return { saved: false };
  }

  await prisma.$transaction(async (tx) => {
    await tx.wishlistMatch.create({
      data: {
        wishlistId: wishlist.id,
        itemId,
      },
    });
    await tx.itemMetric.upsert({
      where: { itemId },
      update: {
        favoritesCount: { increment: 1 },
      },
      create: {
        itemId,
        favoritesCount: 1,
      },
    });
  });

  revalidatePath("/favorites");
  return { saved: true };
}

export async function getDiscoveryFeed(): Promise<DiscoveryFeed> {
  const user = await getCurrentUser();
  const fallbackLocation = await getFallbackLocation();
  const activeCountryId = user?.countryId ?? fallbackLocation.countryId;
  const activeCityId = user?.cityId ?? fallbackLocation.cityId;
  const activeZoneId = user?.zoneId ?? fallbackLocation.zoneId;
  const userZoneName =
    user?.zone?.name ??
    user?.city?.name ??
    user?.country?.name ??
    fallbackLocation.zoneName ??
    "Marche local";
  const cacheKey = CacheKeys.discoveryFeed(
    activeZoneId ?? activeCityId ?? activeCountryId ?? "global"
  );
  const cached = getFromCache<DiscoveryFeed>(cacheKey);

  if (cached) {
    return cached;
  }

  const itemInclude = {
    owner: {
      select: {
        username: true,
        trustScore: true,
      },
    },
    city: { select: { id: true, name: true, lat: true, lng: true } },
    zone: { select: { id: true, name: true, lat: true, lng: true } },
    metric: true,
    images: {
      orderBy: { orderIndex: "asc" as const },
      take: 1,
    },
  } satisfies Prisma.ItemInclude;

  const [cityZones, cityWideRaw, countryWideRaw, popularRaw, dealsRaw, globalRaw] =
    await Promise.all([
      activeCityId
        ? prisma.zone.findMany({
            where: {
              cityId: activeCityId,
              isActive: true,
            },
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
              slug: true,
              lat: true,
              lng: true,
              radiusKm: true,
            },
          })
        : Promise.resolve([]),
      activeCityId
        ? prisma.item.findMany({
            where: {
              status: "AVAILABLE",
              cityId: activeCityId,
            },
            include: itemInclude,
            orderBy: [{ createdAt: "desc" }],
            take: 36,
          })
        : Promise.resolve([]),
      activeCountryId
        ? prisma.item.findMany({
            where: {
              status: "AVAILABLE",
              countryId: activeCountryId,
            },
            include: itemInclude,
            orderBy: [{ createdAt: "desc" }],
            take: 24,
          })
        : Promise.resolve([]),
      prisma.item.findMany({
        where: {
          status: "AVAILABLE",
          ...(activeCityId
            ? { cityId: activeCityId }
            : activeCountryId
              ? { countryId: activeCountryId }
              : {}),
        },
        include: itemInclude,
        orderBy: [{ aiConfidence: "desc" }, { createdAt: "desc" }],
        take: 6,
      }),
      prisma.item.findMany({
        where: {
          status: "AVAILABLE",
          owner: {
            trustScore: { gte: 10 },
          },
          ...(activeCountryId ? { countryId: activeCountryId } : {}),
        },
        include: itemInclude,
        orderBy: [{ createdAt: "desc" }],
        take: 6,
      }),
      prisma.item.findMany({
        where: {
          status: "AVAILABLE",
        },
        include: itemInclude,
        orderBy: [{ createdAt: "desc" }],
        take: 18,
      }),
    ]);

  const userLat = user?.lat ?? user?.zone?.lat ?? user?.city?.lat ?? null;
  const userLng = user?.lng ?? user?.zone?.lng ?? user?.city?.lng ?? null;
  const currentZone = cityZones.find((zone) => zone.id === activeZoneId) ?? null;
  const neighboringZones = getNeighboringZonesInCity(currentZone, cityZones);
  const neighborZoneIds = new Set(neighboringZones.map((zone) => zone.id));
  const bucketPriority: Record<DiscoveryBucket, number> = {
    zone: 0,
    neighbor: 1,
    city: 2,
    country: 3,
    global: 4,
  };

  const normalizeNearbyItem = (
    item: (typeof cityWideRaw)[number],
    localityBucket: DiscoveryBucket
  ): DiscoveryFeedItem => {
    const normalized = presentItem(item);
    const itemLat = item.lat ?? item.zone?.lat ?? item.city?.lat ?? null;
    const itemLng = item.lng ?? item.zone?.lng ?? item.city?.lng ?? null;
    let distance: number | null = null;

    if (userLat != null && userLng != null) {
      if (itemLat != null && itemLng != null) {
        distance = getDistance(userLat, userLng, itemLat, itemLng);
      } else {
        const fallbackDistance = getDistanceToZone(userLat, userLng, item.zone);
        distance = Number.isFinite(fallbackDistance) ? fallbackDistance : null;
      }
    }

    return {
      ...normalized,
      distance,
      localityBucket,
    } as DiscoveryFeedItem;
  };

  const zoneItems = cityWideRaw
    .filter((item) => activeZoneId && item.zoneId === activeZoneId)
    .map((item) => normalizeNearbyItem(item, "zone"))
    .sort((left, right) => {
      if (left.distance == null) return 1;
      if (right.distance == null) return -1;
      return left.distance - right.distance;
    });

  const neighborItems = cityWideRaw
    .filter((item) => item.zoneId && neighborZoneIds.has(item.zoneId))
    .map((item) => normalizeNearbyItem(item, "neighbor"))
    .sort((left, right) => {
      if (left.distance == null) return 1;
      if (right.distance == null) return -1;
      return left.distance - right.distance;
    });

  const cityItems = cityWideRaw
    .filter(
      (item) =>
        !activeZoneId ||
        (item.zoneId !== activeZoneId && (!item.zoneId || !neighborZoneIds.has(item.zoneId)))
    )
    .map((item) => normalizeNearbyItem(item, "city"))
    .sort((left, right) => {
      if (left.distance == null && right.distance == null) {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }
      if (left.distance == null) return 1;
      if (right.distance == null) return -1;
      return left.distance - right.distance;
    });

  const countryItems = countryWideRaw
    .filter((item) => !activeCityId || item.cityId !== activeCityId)
    .map((item) => normalizeNearbyItem(item, "country"));

  const globalItems = globalRaw
    .filter((item) => !activeCountryId || item.countryId !== activeCountryId)
    .map((item) => normalizeNearbyItem(item, "global"));

  const nearby: DiscoveryFeedItem[] = [
    ...zoneItems,
    ...neighborItems,
    ...cityItems,
    ...countryItems,
    ...globalItems,
  ]
    .filter((item, index, collection) => collection.findIndex((candidate) => candidate.id === item.id) === index)
    .sort((left, right) => {
      const leftBucket = left.localityBucket as DiscoveryBucket;
      const rightBucket = right.localityBucket as DiscoveryBucket;
      const bucketDiff = bucketPriority[leftBucket] - bucketPriority[rightBucket];
      if (bucketDiff !== 0) {
        return bucketDiff;
      }

      if (left.distance == null && right.distance == null) {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }
      if (left.distance == null) return 1;
      if (right.distance == null) return -1;
      return left.distance - right.distance;
    })
    .slice(0, 6);

  const result = {
    nearby,
    popular: popularRaw.map(presentItem),
    deals: dealsRaw.map(presentItem),
    userZone: userZoneName,
  };

  setInCache(cacheKey, result, 5 * 60 * 1000);
  return result;
}

export async function removeItem(itemId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return actionFail("auth_required");
  }

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { id: true, ownerId: true, status: true },
  });

  if (!item) {
    return actionFail("item_not_found");
  }

  if (item.ownerId !== user.id) {
    return actionFail("unauthorized");
  }

  if (item.status === "RESERVED" || item.status === "EXCHANGED") {
    return actionFail("item_busy");
  }

  try {
    await prisma.item.update({
      where: { id: itemId },
      data: { status: "REMOVED" },
    });

    invalidateCachePattern("discovery:");
    revalidatePath("/");
    revalidatePath("/profile/items");
    revalidatePath(`/item/${itemId}`);

    return actionOk("item_removed");
  } catch {
    return actionFail("unexpected_error");
  }
}
