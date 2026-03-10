import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type CurrentUserPayload = Prisma.UserGetPayload<{
  include: {
    wallet: true;
    country: true;
    city: true;
    zone: true;
  };
}>;

export type CurrentUser = CurrentUserPayload & {
  swaps: number;
  promoSwaps: number;
  availableSwaps: number;
};

function sanitizeUsername(raw: string) {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);

  return cleaned || "swaply-user";
}

/**
 * Gets default location based on first active country/city/zone
 * No hardcoded values - uses database order
 */
async function getDefaultLocation() {
  const country = await prisma.country.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (!country) {
    return { countryId: null, cityId: null, zoneId: null };
  }

  const city = await prisma.city.findFirst({
    where: {
      countryId: country.id,
      isActive: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!city) {
    return { countryId: country.id, cityId: null, zoneId: null };
  }

  const zone = await prisma.zone.findFirst({
    where: {
      cityId: city.id,
      isActive: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return {
    countryId: country.id,
    cityId: city.id,
    zoneId: zone?.id ?? null,
  };
}

async function buildUniqueUsername(email?: string | null) {
  const localPart = email?.split("@")[0] ?? "swaply-user";
  const base = sanitizeUsername(localPart);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
    const candidate = `${base}${suffix}`;
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  return `${base}-${Date.now().toString().slice(-6)}`;
}

async function ensureCurrentUser(authUser: {
  id: string;
  email?: string | null;
}) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { authUserId: authUser.id },
        ...(authUser.email ? [{ email: authUser.email }] : []),
      ],
    },
    include: {
      wallet: true,
      country: true,
      city: true,
      zone: true,
    },
  });

  if (existing) {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        authUserId: authUser.id,
        email: authUser.email ?? existing.email,
      },
      include: {
        wallet: true,
        country: true,
        city: true,
        zone: true,
      },
    });

    if (!updated.wallet) {
      await prisma.wallet.create({
        data: { userId: updated.id },
      });
    }

    return prisma.user.findUnique({
      where: { id: updated.id },
      include: {
        wallet: true,
        country: true,
        city: true,
        zone: true,
      },
    });
  }

  const location = await getDefaultLocation();
  const username = await buildUniqueUsername(authUser.email);

  return prisma.user.create({
    data: {
      authUserId: authUser.id,
      email: authUser.email ?? null,
      username,
      countryId: location.countryId,
      cityId: location.cityId,
      zoneId: location.zoneId,
      wallet: {
        create: {},
      },
    },
    include: {
      wallet: true,
      country: true,
      city: true,
      zone: true,
    },
  });
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const user = await ensureCurrentUser({
    id: authUser.id,
    email: authUser.email,
  });

  if (!user) {
    return null;
  }

  const regularSwaps = user.wallet?.balanceSwaps ?? 0;
  const promoSwaps = user.wallet?.promoSwaps ?? 0;

  return {
    ...user,
    swaps: regularSwaps,
    promoSwaps,
    availableSwaps: regularSwaps + promoSwaps,
  };
}
