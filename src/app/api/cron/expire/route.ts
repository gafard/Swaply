import prisma from "@/lib/prisma";
import { ExchangeStatus, ItemStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { notifyUser } from "@/lib/notify";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;
  const querySecret = request.nextUrl.searchParams.get("secret");

  if (bearerToken !== cronSecret && querySecret !== cronSecret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const expiredItems = await prisma.item.findMany({
    where: {
      status: ItemStatus.RESERVED,
      reservedUntil: { lt: now },
    },
    include: {
      owner: true,
      exchanges: {
        where: { status: ExchangeStatus.PENDING },
        include: { requester: true }
      }
    },
  });

  const itemIds = expiredItems.map((item) => item.id);

  if (itemIds.length === 0) {
    return NextResponse.json({ ok: true, expired: 0 });
  }

  for (const item of expiredItems) {
    await notifyUser({
      userId: item.owner.id,
      email: item.owner.email,
      title: "Réservation expirée ⏱️",
      body: `La réservation pour "${item.title}" a expiré. L'objet est à nouveau disponible.`,
      type: "RESERVATION_EXPIRED"
    });

    for (const exchange of item.exchanges) {
      await notifyUser({
        userId: exchange.requester.id,
        email: exchange.requester.email,
        title: "Réservation expirée ⏱️",
        body: `Votre réservation pour "${item.title}" a expiré.`,
        type: "RESERVATION_EXPIRED"
      });
    }
  }

  await prisma.$transaction([
    prisma.item.updateMany({
      where: { id: { in: itemIds } },
      data: {
        status: ItemStatus.AVAILABLE,
        reservedUntil: null,
      },
    }),
    prisma.exchange.updateMany({
      where: {
        itemId: { in: itemIds },
        status: ExchangeStatus.PENDING,
      },
      data: {
        status: ExchangeStatus.EXPIRED,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, expired: itemIds.length });
}
