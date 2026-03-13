"use server";

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getDistance } from "@/lib/location";
import {
  getFromCache,
  setInCache,
  CacheKeys,
} from "@/lib/cache";
import { presentItem } from "@/lib/item-presenter";
import { getDistanceToZone, getNeighboringZonesInCity } from "@/lib/geo";

interface DiscoveryFeed {
  nearby: any[];
  popular: any[];
  deals: any[];
  userZone: string;
}

type DiscoveryBucket = "zone" | "neighbor" | "city" | "country" | "global";
type DiscoveryFeedItem = Record<string, any> & {
  id: string;
  createdAt: Date;
  distance: number | null;
  localityBucket: DiscoveryBucket;
};

async function getFallbackLocation() {
  const country = await prisma.country.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (!country) {
    return { countryId: null, cityId: null, zoneId: null, zoneName: null };
  }

  const city = await prisma.city.findFirst({
    where: { countryId: country.id, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (!city) {
    return { countryId: country.id, cityId: null, zoneId: null, zoneName: null };
  }

  const zone = await prisma.zone.findFirst({
    where: { cityId: city.id, isActive: true },
    orderBy: { name: "asc" },
  });

  return {
    countryId: country.id,
    cityId: city.id,
    zoneId: zone?.id ?? null,
    zoneName: zone?.name ?? null,
  };
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
  const cached = await getFromCache<DiscoveryFeed>(cacheKey);

  if (cached) {
    return cached;
  }

  const itemInclude = {
    owner: {
      select: {
        username: true,
        trustScore: true,
        completionRate: true,
        avgResponseTime: true,
        avgPhotoQuality: true,
        level: true,
        xp: true,
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
            where: { cityId: activeCityId, isActive: true },
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
            where: { status: "AVAILABLE", cityId: activeCityId },
            include: itemInclude,
            orderBy: [{ createdAt: "desc" }],
            take: 36,
          })
        : Promise.resolve([]),
      activeCountryId
        ? prisma.item.findMany({
            where: { status: "AVAILABLE", countryId: activeCountryId },
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
          owner: { trustScore: { gte: 10 } },
          ...(activeCountryId ? { countryId: activeCountryId } : {}),
        },
        include: itemInclude,
        orderBy: [{ createdAt: "desc" }],
        take: 6,
      }),
      prisma.item.findMany({
        where: { status: "AVAILABLE" },
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
      if (bucketDiff !== 0) return bucketDiff;

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

  await setInCache(cacheKey, result, 5 * 60 * 1000);
  return result;
}
