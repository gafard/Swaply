"use server";

import crypto from "crypto";
import {
  ExchangeStatus,
  ItemStatus,
  Prisma,
  ReviewRating,
  WalletTxnType,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { actionFail, actionOk } from "@/lib/actions/result";
import { assert } from "@/lib/validations";
import { notifyUser } from "@/lib/notify";
import { checkRateLimit } from "@/lib/rate-limit";
import { addSwaps, deductSwaps } from "@/lib/swaps";

function toReviewRating(value: number): ReviewRating | null {
  switch (value) {
    case 1:
      return ReviewRating.ONE;
    case 2:
      return ReviewRating.TWO;
    case 3:
      return ReviewRating.THREE;
    case 4:
      return ReviewRating.FOUR;
    case 5:
      return ReviewRating.FIVE;
    default:
      return null;
  }
}

export async function reserveItem(itemId: string, swapsBalance: number = 0) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return actionFail("auth_required");
  }

  const rateLimit = checkRateLimit(currentUser.id, "reserve");
  if (!rateLimit.allowed) {
    return actionFail("rate_limited", {
      retryAfterSeconds: Math.ceil(rateLimit.resetIn / 1000),
    });
  }

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      owner: true,
    },
  });

  if (!item) {
    return actionFail("item_not_found");
  }

  if (item.status !== ItemStatus.AVAILABLE) {
    return actionFail("item_unavailable");
  }

  if (item.ownerId === currentUser.id) {
    return actionFail("own_item_forbidden");
  }

  const requesterExtra = Math.max(0, swapsBalance);
  const requesterSwaps = item.priceSwaps + requesterExtra;

  if (currentUser.availableSwaps < requesterSwaps) {
    return actionFail("insufficient_swaps");
  }

  const reservedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    const exchange = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await deductSwaps(
        currentUser.id,
        requesterSwaps,
        WalletTxnType.EXCHANGE_OUT,
        `Reservation: ${item.title}`,
        tx
      );

      await tx.item.update({
        where: { id: item.id },
        data: {
          status: ItemStatus.RESERVED,
        },
      });

      return tx.exchange.create({
        data: {
          itemId: item.id,
          requesterId: currentUser.id,
          ownerId: item.ownerId,
          status: ExchangeStatus.PENDING,
          requesterSwaps,
          ownerSwaps: 0,
          feeSwaps: 0,
          reservedUntil,
        },
      });
    });

    await notifyUser({
      userId: item.owner.id,
      email: item.owner.email ?? undefined,
      template: "exchange_reserved",
      payload: {
        username: currentUser.username,
        itemTitle: item.title,
      },
      link: `/exchange/${exchange.id}`,
    });

    revalidatePath("/");
    revalidatePath(`/item/${item.id}`);
    return actionOk("exchange_reserved", { exchangeId: exchange.id });
  } catch {
    return actionFail("unexpected_error");
  }
}

export async function cancelReservation(exchangeId: string) {
  const currentUser = await getCurrentUser();
  assert(!!currentUser, "Vous devez etre connecte.");

  const exchange = await prisma.exchange.findUnique({
    where: { id: exchangeId },
    include: {
      item: true,
      requester: true,
      owner: true,
    },
  });

  assert(!!exchange, "Echange introuvable.");
  assert(exchange.status === ExchangeStatus.PENDING, "Reservation deja traitee.");
  assert(
    exchange.requesterId === currentUser.id || exchange.ownerId === currentUser.id,
    "Action non autorisee."
  );

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await addSwaps(
      exchange.requesterId,
      exchange.requesterSwaps,
      WalletTxnType.REFUND,
      `Remboursement: ${exchange.item.title}`,
      false,
      tx
    );

    await tx.item.update({
      where: { id: exchange.item.id },
      data: {
        status: ItemStatus.AVAILABLE,
      },
    });

    await tx.exchange.update({
      where: { id: exchange.id },
      data: {
        status: ExchangeStatus.CANCELLED,
        reservedUntil: null,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/profile");
}

export async function selectMeetingPoint(exchangeId: string, meetingPointId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return actionFail("auth_required");
  }

  const exchange = await prisma.exchange.findUnique({
    where: { id: exchangeId },
  });

  if (!exchange) {
    return actionFail("exchange_not_found");
  }

  if (exchange.requesterId !== currentUser.id && exchange.ownerId !== currentUser.id) {
    return actionFail("forbidden");
  }

  const point = await prisma.meetingPoint.findUnique({
    where: { id: meetingPointId },
  });

  if (!point) {
    return actionFail("meeting_point_not_found");
  }

  await prisma.$transaction([
    prisma.exchange.update({
      where: { id: exchangeId },
      data: { meetingPointId },
    }),
    prisma.message.create({
      data: {
        exchangeId,
        senderId: currentUser.id,
        body: `Lieu de rencontre selectionne: ${point.name}`,
      },
    }),
  ]);

  revalidatePath(`/exchange/${exchangeId}`);
  return actionOk("meeting_point_selected");
}

export async function generateExchangeToken(exchangeId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return actionFail("auth_required");
  }

  const exchange = await prisma.exchange.findUnique({
    where: { id: exchangeId },
  });

  if (!exchange) {
    return actionFail("exchange_not_found");
  }

  if (exchange.ownerId !== currentUser.id) {
    return actionFail("owner_only");
  }

  if (exchange.status !== ExchangeStatus.PENDING) {
    return actionFail("exchange_not_pending");
  }

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.exchange.update({
    where: { id: exchangeId },
    data: { qrToken: token },
  });

  revalidatePath(`/exchange/${exchangeId}`);
  return actionOk("exchange_token_generated", { token });
}

export async function confirmExchangeWithToken(exchangeId: string, token: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return actionFail("auth_required");
  }

  const exchange = await prisma.exchange.findUnique({
    where: { id: exchangeId },
    include: {
      item: true,
      owner: true,
      requester: true,
    },
  });

  if (!exchange) {
    return actionFail("exchange_not_found");
  }

  if (exchange.status !== ExchangeStatus.PENDING) {
    return actionFail("exchange_not_pending");
  }

  if (exchange.qrToken !== token) {
    return actionFail("invalid_token");
  }

  if (exchange.requesterId !== currentUser.id) {
    return actionFail("requester_only");
  }

  const feeSwaps =
    exchange.requesterSwaps > 0
      ? Math.min(5, Math.max(1, Math.round(exchange.requesterSwaps * 0.02)))
      : 0;
  const netToOwner = Math.max(exchange.requesterSwaps - feeSwaps, 0);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (netToOwner > 0) {
      await addSwaps(
        exchange.ownerId,
        netToOwner,
        WalletTxnType.EXCHANGE_IN,
        `Echange valide: ${exchange.item.title}`,
        false,
        tx
      );
    }

    await tx.exchange.update({
      where: { id: exchangeId },
      data: {
        status: ExchangeStatus.COMPLETED,
        feeSwaps,
        confirmedAt: new Date(),
        completedAt: new Date(),
      },
    });

    await tx.item.update({
      where: { id: exchange.itemId },
      data: {
        status: ItemStatus.EXCHANGED,
      },
    });

    await tx.user.update({
      where: { id: exchange.ownerId },
      data: {
        trustScore: { increment: 1 },
      },
    });

    await tx.user.update({
      where: { id: exchange.requesterId },
      data: {
        trustScore: { increment: 1 },
      },
    });
  });

  await notifyUser({
    userId: exchange.ownerId,
    email: exchange.owner.email ?? undefined,
    template: "exchange_confirmed",
    payload: {
      itemTitle: exchange.item.title,
    },
    link: `/exchange/${exchangeId}`,
  });

  revalidatePath(`/exchange/${exchangeId}`);
  revalidatePath("/profile");
  return actionOk("exchange_confirmed");
}

export async function submitReview(data: {
  exchangeId: string;
  rating: number;
  comment?: string;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return actionFail("auth_required");
  }

  const exchange = await prisma.exchange.findUnique({
    where: { id: data.exchangeId },
    include: {
      reviews: true,
    },
  });

  if (!exchange) {
    return actionFail("exchange_not_found");
  }

  if (exchange.status !== ExchangeStatus.COMPLETED) {
    return actionFail("exchange_not_completed");
  }

  const existingReview = exchange.reviews.find(
    (review) => review.authorId === currentUser.id
  );
  if (existingReview) {
    return actionFail("review_already_exists");
  }

  const targetUserId =
    exchange.ownerId === currentUser.id ? exchange.requesterId : exchange.ownerId;
  const rating = toReviewRating(data.rating);
  if (!rating) {
    return actionFail("rating_invalid");
  }
  const trustDelta = data.rating - 3;

  const review = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const createdReview = await tx.review.create({
      data: {
        exchangeId: data.exchangeId,
        authorId: currentUser.id,
        targetUserId,
        rating,
        comment: data.comment?.trim() || null,
      },
    });

    await tx.user.update({
      where: { id: currentUser.id },
      data: {
        trustScore: { increment: 1 },
      },
    });

    if (trustDelta !== 0) {
      await tx.user.update({
        where: { id: targetUserId },
        data: {
          trustScore: { increment: trustDelta },
        },
      });
    }

    return createdReview;
  });

  revalidatePath(`/exchange/${data.exchangeId}`);
  return actionOk("review_submitted", { reviewId: review.id });
}
