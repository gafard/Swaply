"use server";

import { Prisma, WalletTxnType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { actionFail, actionOk } from "@/lib/actions/result";
import { notifyUser } from "@/lib/notify";
import { invalidateCachePattern } from "@/lib/cache";
import { addSwaps } from "@/lib/swaps";
import { resolveLocationSelection } from "@/lib/geo.server";
import { PublishItemSchema } from "@/lib/validations";
import { addXP, checkAndAwardAchievements, XP_REWARDS } from "@/lib/gamification";

const FAVORITES_WISHLIST_TITLE = "__favorites__";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
      ? await prisma.zone.findUnique({ where: { id: user.zoneId } })
      : null) ||
    (fallback.zoneId
      ? await prisma.zone.findUnique({ where: { id: fallback.zoneId } })
      : null);

  return {
    countryId: user?.countryId ?? fallback.countryId,
    cityId,
    zoneId: zone?.id ?? user?.zoneId ?? fallback.zoneId,
    zoneName: zone?.name ?? user?.zone?.name ?? fallback.zoneName,
  };
}

export async function publishItem(formData: FormData) {
  console.log("[publishItem] Starting...");
  const user = await getCurrentUser();
  if (!user) {
    console.log("[publishItem] Auth required");
    return actionFail("auth_required");
  }

  const rawData = {
    title: formData.get("title")?.toString().trim() || "",
    description: formData.get("description")?.toString().trim() || "",
    priceSwaps: parseInt(formData.get("creditValue")?.toString() || "0", 10),
    imageUrls: JSON.parse(formData.get("imageUrls")?.toString() || "[]") as string[],
    countryId: formData.get("countryId")?.toString().trim() || "",
    cityId: formData.get("cityId")?.toString().trim() || "",
    zoneId: formData.get("zoneId")?.toString().trim() || "",
    lat: formData.get("latitude") ? parseFloat(formData.get("latitude")!.toString()) : null,
    lng: formData.get("longitude") ? parseFloat(formData.get("longitude")!.toString()) : null,
    category: formData.get("category")?.toString() || null,
    brand: formData.get("brand")?.toString() || null,
    conditionLabel: formData.get("condition")?.toString() || null,
    aiSuggestedSwaps: formData.get("suggestedValue") ? parseInt(formData.get("suggestedValue")!.toString(), 10) : null,
    aiConfidence: formData.get("aiConfidence") ? parseFloat(formData.get("aiConfidence")!.toString()) : null,
    fraudRisk: formData.get("fraudRisk")?.toString() || null,
  };

  const validation = PublishItemSchema.safeParse(rawData);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    const path = firstError.path[0];
    
    if (path === "title") return actionFail("title_invalid");
    if (path === "description") return actionFail("description_invalid");
    if (path === "priceSwaps") return actionFail("price_invalid");
    if (path === "imageUrls") return actionFail("images_required");
    if (path === "countryId" || path === "cityId" || path === "zoneId") return actionFail("location_unavailable");
    
    return actionFail("validation_failed", { errors: validation.error.flatten() });
  }

  const validated = validation.data;
  const { title, description, priceSwaps, imageUrls, countryId, cityId, zoneId, lat, lng, category, brand, conditionLabel, aiSuggestedSwaps, aiConfidence, fraudRisk } = validated;

  let location;
  try {
    location = await resolveItemLocation(user, { countryId, cityId, zoneId, zoneName: formData.get("locationZone")?.toString().trim() || "" });
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
          create: imageUrls.map((url, index) => ({ url, orderIndex: index })),
        },
        metric: { create: {} },
      },
      select: { id: true },
    });

    const totalItems = await prisma.item.count({ where: { ownerId: user.id } });
    const awardedFirstPublishBonus = totalItems === 1;

    if (awardedFirstPublishBonus) {
      await addSwaps(user.id, 3, WalletTxnType.ADJUSTMENT, `Bonus premiere publication: ${title}`, true);
    }

    await invalidateCachePattern("discovery:");
    revalidatePath("/");
    revalidatePath("/publish");
    revalidatePath("/profile/items");

    // Gamification
    await addXP(user.id, XP_REWARDS.PUBLISH_ITEM, `Publication de l'objet: ${title}`);
    await checkAndAwardAchievements(user.id);

    // SwapMatch: Matching automatic with wishlists
    const matchingWishlists = await prisma.wishlist.findMany({
      where: {
        isActive: true,
        userId: { not: user.id },
        category: category || undefined,
        OR: [
          { zoneId: location.zoneId },
          { cityId: location.cityId, zoneId: null },
          { countryId: location.countryId, cityId: null }
        ]
      },
      include: { user: { select: { id: true, email: true } } }
    });

    if (matchingWishlists.length > 0) {
      console.log(`[publishItem] Found ${matchingWishlists.length} matching wishlists`);
      for (const wishlist of matchingWishlists) {
        await prisma.wishlistMatch.create({
          data: {
            wishlistId: wishlist.id,
            itemId: item.id
          }
        });

        await notifyUser({
          userId: wishlist.userId,
          email: wishlist.user.email ?? undefined,
          template: "wishlist_match_found",
          payload: {
            itemTitle: title,
            wishlistTitle: wishlist.title
          },
          link: `/item/${item.id}`
        });
      }
    }

    if (location.zoneId) {
      const localUsers = await prisma.user.findMany({
        where: { zoneId: location.zoneId, id: { not: user.id } },
        select: { id: true, email: true },
      });

      for (const localUser of localUsers) {
        await notifyUser({
          userId: localUser.id,
          email: localUser.email ?? undefined,
          template: "new_local_item",
          payload: { itemTitle: title, zoneName: location.zoneName },
        });
      }
    }

    revalidatePath("/");
    revalidatePath("/publish");
    revalidatePath("/profile/items");

    console.log("[publishItem] Success, itemId:", item.id);
    return actionOk("item_published", { itemId: item.id, awardedFirstPublishBonus });
  } catch (error) {
    console.error("[publishItem] Unexpected error:", error);
    return actionFail("unexpected_error");
  }
}

export async function removeItem(itemId: string) {
  const user = await getCurrentUser();
  if (!user) return actionFail("auth_required");

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { id: true, ownerId: true, status: true },
  });

  if (!item) return actionFail("item_not_found");
  if (item.ownerId !== user.id) return actionFail("unauthorized");
  if (item.status === "RESERVED" || item.status === "EXCHANGED") return actionFail("item_busy");

  try {
    await prisma.item.update({
      where: { id: itemId },
      data: { status: "REMOVED" },
    });

    await invalidateCachePattern("discovery:");
    revalidatePath("/");
    revalidatePath("/profile/items");
    revalidatePath(`/item/${itemId}`);

    return actionOk("item_removed");
  } catch {
    return actionFail("unexpected_error");
  }
}
