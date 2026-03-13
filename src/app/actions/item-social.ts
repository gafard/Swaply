"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { actionFail, actionOk } from "@/lib/actions/result";
import { assert, ReportItemSchema } from "@/lib/validations";
import { notifyUser } from "@/lib/notify";
import { checkRateLimit } from "@/lib/rate-limit";

const FAVORITES_WISHLIST_TITLE = "__favorites__";

async function ensureFavoritesWishlist(
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>,
  item: { countryId: string; cityId: string; zoneId: string | null }
) {
  const existing = await prisma.wishlist.findFirst({
    where: { userId: user.id, title: FAVORITES_WISHLIST_TITLE },
  });

  if (existing) return existing;

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

async function ensureItemMetric(itemId: string, db: any = prisma) {
  return db.itemMetric.upsert({
    where: { itemId },
    update: {},
    create: { itemId },
  });
}

export async function reportItem(itemId: string, reason: string, details?: string) {
  const user = await getCurrentUser();
  if (!user) return actionFail("auth_required");

  const validation = ReportItemSchema.safeParse({ itemId, reason, details });
  if (!validation.success) {
    return actionFail("report_reason_invalid");
  }

  const { itemId: validatedItemId, reason: normalizedReason, details: normalizedDetails } = validation.data;

  const rateLimit = await checkRateLimit(user.id, "report");
  if (!rateLimit.allowed) {
    return actionFail("rate_limited", { retryAfterSeconds: Math.ceil(rateLimit.resetIn / 1000) });
  }

  const item = await prisma.item.findUnique({
    where: { id: validatedItemId },
    select: {
      id: true,
      ownerId: true,
      title: true,
      owner: { select: { id: true, email: true } },
    },
  });

  if (!item) return actionFail("item_not_found");
  if (item.ownerId === user.id) return actionFail("report_own_item");

  const existingReport = await prisma.itemReport.findUnique({
    where: { itemId_reporterId: { itemId: validatedItemId, reporterId: user.id } },
    select: { id: true },
  });

  if (existingReport) return actionFail("report_already_exists");

  await prisma.$transaction(async (tx) => {
    await tx.itemReport.create({
      data: { itemId: validatedItemId, reporterId: user.id, reason: normalizedReason, details: normalizedDetails },
    });

    await tx.itemMetric.upsert({
      where: { itemId: validatedItemId },
      update: { reportsCount: { increment: 1 } },
      create: { itemId: validatedItemId, reportsCount: 1 },
    });
  });

  if (item.owner.email) {
    await notifyUser({
      userId: item.owner.id,
      email: item.owner.email,
      template: "item_reported_owner",
      payload: { itemTitle: item.title },
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

  if (user?.id === item.ownerId) return { tracked: false };

  const viewerSessionId = sessionId?.trim() || null;
  if (!user && !viewerSessionId) return { tracked: false };

  await prisma.$transaction(async (tx) => {
    let isUniqueView = false;

    if (user?.id) {
      const existingView = await tx.itemView.findUnique({
        where: { itemId_viewerId: { itemId, viewerId: user.id } },
      });

      if (existingView) {
        await tx.itemView.update({
          where: { id: existingView.id },
          data: { viewCount: { increment: 1 } },
        });
      } else {
        await tx.itemView.create({ data: { itemId, viewerId: user.id } });
        isUniqueView = true;
      }
    } else if (viewerSessionId) {
      const existingView = await tx.itemView.findUnique({
        where: { itemId_sessionId: { itemId, sessionId: viewerSessionId } },
      });

      if (existingView) {
        await tx.itemView.update({
          where: { id: existingView.id },
          data: { viewCount: { increment: 1 } },
        });
      } else {
        await tx.itemView.create({ data: { itemId, sessionId: viewerSessionId } });
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
    select: { id: true, countryId: true, cityId: true, zoneId: true },
  });

  assert(!!item, "Objet introuvable.");

  const wishlist = await ensureFavoritesWishlist(user, item);
  const existingMatch = await prisma.wishlistMatch.findUnique({
    where: { wishlistId_itemId: { wishlistId: wishlist.id, itemId } },
  });

  if (existingMatch) {
    await prisma.$transaction(async (tx) => {
      await tx.wishlistMatch.delete({ where: { id: existingMatch.id } });
      await ensureItemMetric(itemId, tx);
      const metric = await tx.itemMetric.findUnique({
        where: { itemId },
        select: { favoritesCount: true },
      });
      if ((metric?.favoritesCount ?? 0) > 0) {
        await tx.itemMetric.update({
          where: { itemId },
          data: { favoritesCount: { decrement: 1 } },
        });
      }
    });
    revalidatePath("/favorites");
    return { saved: false };
  }

  await prisma.$transaction(async (tx) => {
    await tx.wishlistMatch.create({ data: { wishlistId: wishlist.id, itemId } });
    await tx.itemMetric.upsert({
      where: { itemId },
      update: { favoritesCount: { increment: 1 } },
      create: { itemId, favoritesCount: 1 },
    });
  });

  revalidatePath("/favorites");
  return { saved: true };
}
