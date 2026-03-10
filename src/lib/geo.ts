import { getDistance } from "@/lib/location";
import { formatCurrency } from "@/lib/i18n/format";

export type GeoZone = {
  id: string;
  name: string;
  slug: string;
  lat: number | null;
  lng: number | null;
  radiusKm?: number | null;
};

export type GeoCity = {
  id: string;
  name: string;
  slug: string;
  lat: number | null;
  lng: number | null;
  zones: GeoZone[];
};

export type GeoCountry = {
  id: string;
  code: string;
  name: string;
  defaultLanguage: string;
  cities: GeoCity[];
};

export type GeoCatalog = GeoCountry[];

export type UserLocationSelection = {
  countryId: string | null;
  cityId: string | null;
  zoneId: string | null;
  countryCode: string | null;
  countryName: string | null;
  cityName: string | null;
  zoneName: string | null;
};

export function findNearestZoneInCity(
  zones: GeoZone[],
  lat: number,
  lng: number
): GeoZone | null {
  let nearestZone: GeoZone | null = null;
  let minDistance = Number.POSITIVE_INFINITY;

  for (const zone of zones) {
    if (zone.lat == null || zone.lng == null) {
      continue;
    }

    const distance = getDistance(lat, lng, zone.lat, zone.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestZone = zone;
    }
  }

  return nearestZone;
}

export function getZoneRadiusKm(zone?: { radiusKm?: number | null } | null) {
  return zone?.radiusKm && zone.radiusKm > 0 ? zone.radiusKm : 4;
}

export function getDistanceToZone(
  lat: number,
  lng: number,
  zone?: { lat: number | null; lng: number | null } | null
) {
  if (zone?.lat == null || zone?.lng == null) {
    return Number.POSITIVE_INFINITY;
  }

  return getDistance(lat, lng, zone.lat, zone.lng);
}

export function getNeighboringZonesInCity(
  anchorZone: GeoZone | null,
  zones: GeoZone[],
  options?: {
    bufferKm?: number;
    maxNeighbors?: number;
  }
) {
  if (!anchorZone || anchorZone.lat == null || anchorZone.lng == null) {
    return [];
  }

  const bufferKm = options?.bufferKm ?? 1.5;
  const maxNeighbors = options?.maxNeighbors ?? 3;
  const anchorRadius = getZoneRadiusKm(anchorZone);

  return zones
    .filter((zone) => zone.id !== anchorZone.id && zone.lat != null && zone.lng != null)
    .map((zone) => {
      const distanceKm = getDistance(anchorZone.lat!, anchorZone.lng!, zone.lat!, zone.lng!);
      const neighborThresholdKm = anchorRadius + getZoneRadiusKm(zone) + bufferKm;

      return {
        ...zone,
        distanceKm,
        isNeighbor: distanceKm <= neighborThresholdKm,
      };
    })
    .filter((zone) => zone.isNeighbor)
    .sort((left, right) => left.distanceKm - right.distanceKm)
    .slice(0, maxNeighbors);
}

export function formatMoney(
  amount: number,
  currencyCode: string,
  locale?: string | null
) {
  return formatCurrency(locale, amount, currencyCode);
}
