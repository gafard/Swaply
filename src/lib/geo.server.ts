import "server-only";

import prisma from "@/lib/prisma";
import { assert } from "@/lib/validations";

export async function getGeoCatalog() {
  return prisma.country.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      defaultLanguage: true,
      cities: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          lat: true,
          lng: true,
          zones: {
            where: { isActive: true },
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
              slug: true,
              lat: true,
              lng: true,
              radiusKm: true,
            },
          },
        },
      },
    },
  });
}

export async function resolveLocationSelection(input: {
  countryId?: string | null;
  cityId?: string | null;
  zoneId?: string | null;
}) {
  const countryId = input.countryId?.trim() || "";
  const cityId = input.cityId?.trim() || "";
  const zoneId = input.zoneId?.trim() || "";

  assert(!!countryId, "Pays requis.");
  assert(!!cityId, "Ville requise.");
  assert(!!zoneId, "Zone requise.");

  const country = await prisma.country.findFirst({
    where: {
      id: countryId,
      isActive: true,
    },
    select: {
      id: true,
      code: true,
      name: true,
      defaultLanguage: true,
    },
  });
  assert(!!country, "Pays invalide.");

  const city = await prisma.city.findFirst({
    where: {
      id: cityId,
      countryId: country.id,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      lat: true,
      lng: true,
    },
  });
  assert(!!city, "Ville invalide.");

  const zone = await prisma.zone.findFirst({
    where: {
      id: zoneId,
      cityId: city.id,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      lat: true,
      lng: true,
    },
  });
  assert(!!zone, "Zone invalide.");

  return { country, city, zone };
}

export async function getTopupPackagesByCountry(countryId: string | null | undefined) {
  if (!countryId) {
    return [];
  }

  return prisma.topupPackage.findMany({
    where: {
      countryId,
      isActive: true,
      paymentProvider: {
        isActive: true,
      },
    },
    include: {
      country: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      paymentProvider: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
    orderBy: [{ localAmount: "asc" }],
  });
}
