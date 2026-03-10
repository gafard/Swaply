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

  const expiredExchanges = await prisma.exchange.findMany({
    where: {
      status: ExchangeStatus.PENDING,
      reservedUntil: { lt: now },
    },
    include: {
      item: true,
      owner: true,
      requester: true,
    },
  });

  const itemIds = [...new Set(expiredExchanges.map((exchange) => exchange.itemId))];

  if (itemIds.length === 0) {
    return NextResponse.json({ ok: true, expired: 0 });
  }

  for (const exchange of expiredExchanges) {
    await notifyUser({
      userId: exchange.owner.id,
      email: exchange.owner.email ?? undefined,
      template: "reservation_expired_owner",
      payload: {
        itemTitle: exchange.item.title,
      },
    });

    await notifyUser({
      userId: exchange.requester.id,
      email: exchange.requester.email ?? undefined,
      template: "reservation_expired_requester",
      payload: {
        itemTitle: exchange.item.title,
      },
    });
  }

  await prisma.$transaction([
    prisma.item.updateMany({
      where: { id: { in: itemIds } },
      data: {
        status: ItemStatus.AVAILABLE,
      },
    }),
    prisma.exchange.updateMany({
      where: { id: { in: expiredExchanges.map((exchange) => exchange.id) } },
      data: {
        status: ExchangeStatus.EXPIRED,
        reservedUntil: null,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, expired: itemIds.length });
}
