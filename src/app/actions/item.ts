"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assert, isValidCreditValue } from "@/lib/validations";
import { notifyUser } from "@/lib/notify";
import { getDistance, getZoneFallbackCoords } from "@/lib/location";

export async function publishItem(formData: FormData) {
  const user = await getCurrentUser();
  assert(!!user, "Vous devez être connecté.");

  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";
  const creditValue = parseInt(formData.get("creditValue")?.toString() || "0", 10);
  const locationZone = formData.get("locationZone")?.toString() || "";
  
  const latitude = formData.get("latitude") ? parseFloat(formData.get("latitude")!.toString()) : null;
  const longitude = formData.get("longitude") ? parseFloat(formData.get("longitude")!.toString()) : null;

  const category = formData.get("category")?.toString() || null;
  const subcategory = formData.get("subcategory")?.toString() || null;
  const brand = formData.get("brand")?.toString() || null;
  const condition = formData.get("condition")?.toString() || null;
  const rarity = formData.get("rarity")?.toString() || "common";
  
  const suggestedValue = formData.get("suggestedValue") ? parseInt(formData.get("suggestedValue")!.toString(), 10) : null;
  const minSuggestedValue = formData.get("minSuggestedValue") ? parseInt(formData.get("minSuggestedValue")!.toString(), 10) : null;
  const maxSuggestedValue = formData.get("maxSuggestedValue") ? parseInt(formData.get("maxSuggestedValue")!.toString(), 10) : null;
  const aiExplanation = formData.get("aiExplanation")?.toString() || null;

  const fraudRisk = formData.get("fraudRisk")?.toString() || "low";
  const aiConfidence = formData.get("aiConfidence") ? parseFloat(formData.get("aiConfidence")!.toString()) : null;

  // Technical Details (new)
  const techAge = formData.get("techAge")?.toString() || null;
  const techAccessories = formData.get("techAccessories")?.toString() || null;
  const techFunctionality = formData.get("techFunctionality")?.toString() || null;

  // Functional Integrity
  const functionalStatus = formData.get("functionalStatus")?.toString() || "PERFECT";
  const isNotifiedDefective = formData.get("isNotifiedDefective") === "true";

  // Multiple Images Handling
  const imageUrlsJson = formData.get("imageUrls")?.toString() || "[]";
  const imageUrls: string[] = JSON.parse(imageUrlsJson);
  const primaryImageUrl = imageUrls[0] || undefined;

  assert(title.trim().length >= 2, "Titre invalide.");
  assert(description.trim().length >= 5, "Description invalide.");
  assert(locationZone.trim().length >= 2, "Zone invalide.");
  assert(isValidCreditValue(creditValue), "Valeur crédit invalide.");
  
  // Business Rule: Minimum 2 photos for all items to ensure transparency
  if (imageUrls.length < 2) {
    assert(false, "Veuillez ajouter au moins 2 photos (différents angles) pour publier votre objet.");
  }
  
  assert(imageUrls.length > 0, "Au moins une photo est requise.");

  const item = await (prisma.item as any).create({
    data: {
      title: title.trim(),
      description: description.trim(),
      imageUrl: primaryImageUrl,
      creditValue: creditValue,
      locationZone: locationZone.trim(),
      ownerId: user.id,
      latitude,
      longitude,
      category,
      subcategory,
      brand,
      condition,
      rarity,
      suggestedValue,
      minSuggestedValue,
      maxSuggestedValue,
      aiExplanation,
      listedValue: creditValue,
      fraudRisk,
      aiConfidence,
      techAge,
      techAccessories,
      techFunctionality,
      functionalStatus,
      isNotifiedDefective,
      images: {
        create: imageUrls.map((url, index) => ({
          url,
          order: index
        }))
      }
    },
  });

  // Notify users in the same zone
  const localUsers = await prisma.user.findMany({
    where: {
      defaultZone: locationZone.trim(),
      id: { not: user.id }
    },
    select: { id: true, email: true }
  });

  for (const localUser of localUsers) {
    await notifyUser({
      userId: localUser.id,
      email: localUser.email,
      title: "Nouvel objet près de chez vous ! 📍",
      body: `Un nouvel objet "${title}" vient d'être publié à ${locationZone}. Allez voir !`,
      type: "ITEM_RESERVED", // Using an existing type or we'd need to update Prisma enum
    });
  }

  revalidatePath("/");
  revalidatePath("/publish");
  revalidatePath("/profile/items");
}

export async function reportItem(itemId: string, reason: string, description: string) {
  const user = await getCurrentUser();
  assert(!!user, "Vous devez être connecté.");

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { ownerId: true }
  });

  if (!item) assert(false, "Objet introuvable.");

  await (prisma as any).$transaction([
    (prisma as any).report.create({
      data: {
        reason,
        description,
        itemId,
        reporterId: user.id
      }
    }),
    prisma.user.update({
      where: { id: item.ownerId },
      data: {
        trustScore: { decrement: 5 }
      }
    })
  ]);

  revalidatePath("/");
}

export async function incrementItemView(itemId: string) {
  try {
    await prisma.item.update({
      where: { id: itemId },
      data: {
        views: { increment: 1 }
      }
    });
  } catch (error) {
    console.error("Failed to increment views:", error);
  }
}

export async function toggleSaveItem(itemId: string) {
  const user = await getCurrentUser();
  assert(!!user, "Vous devez être connecté.");

  const existingSave = await prisma.user.findFirst({
    where: {
      id: user.id,
      savedItems: { some: { id: itemId } }
    }
  });

  if (existingSave) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        savedItems: { disconnect: { id: itemId } }
      }
    });
    return { saved: false };
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        savedItems: { connect: { id: itemId } }
      }
    });
    return { saved: true };
  }
}

export async function getDiscoveryFeed() {
  const user = await getCurrentUser();
  const userZone = user?.defaultZone || "Université de Lomé";

  // 1. Nearby Items (Proximity + Freshness)
  const nearbyItems = await prisma.item.findMany({
    where: {
      status: "AVAILABLE",
      locationZone: userZone,
    },
    include: {
      owner: { select: { username: true, trustScore: true } },
    },
    take: 6,
  });

  const userLat = user?.latitude || getZoneFallbackCoords(userZone).lat;
  const userLon = user?.longitude || getZoneFallbackCoords(userZone).lng;

  const nearbyItemsWithDistance = nearbyItems.map((item: any) => {
    const itemLat = item.latitude || getZoneFallbackCoords(item.locationZone).lat;
    const itemLon = item.longitude || getZoneFallbackCoords(item.locationZone).lng;
    const distance = getDistance(userLat, userLon, itemLat, itemLon);
    return { ...item, distance };
  }).sort((a: any, b: any) => a.distance - b.distance);

  // 2. Popular Items (Views + Saves)
  const popularItems = await prisma.item.findMany({
    where: {
      status: "AVAILABLE",
    },
    include: {
      owner: { select: { username: true, trustScore: true } },
    },
    orderBy: [
      { views: "desc" },
    ],
    take: 6,
  }) as any;

  // 3. Good Deals (High Trust Sellers)
  const goodDeals = await prisma.item.findMany({
    where: {
      status: "AVAILABLE",
      owner: {
        trustScore: { gte: 10 }
      }
    },
    include: {
      owner: { select: { username: true, trustScore: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  }) as any;

  return {
    nearby: nearbyItemsWithDistance,
    popular: popularItems,
    deals: goodDeals,
    userZone
  };
}
