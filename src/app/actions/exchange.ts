"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assert } from "@/lib/validations";
import { ItemStatus, ExchangeStatus, Prisma } from "@prisma/client";
import { notifyUser } from "@/lib/notify";

export async function reserveItem(itemId: string) {
  const currentUser = await getCurrentUser();
  assert(!!currentUser, "Vous devez être connecté.");

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { owner: true },
  });

  assert(!!item, "Objet introuvable.");
  assert(item.status === ItemStatus.AVAILABLE, "Objet non disponible.");
  assert(item.ownerId !== currentUser.id, "Impossible de réserver votre propre objet.");
  assert(currentUser.credits >= item.creditValue, "Crédits insuffisants.");

  const reservedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const exchange = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.item.update({
      where: { id: item.id },
      data: {
        status: ItemStatus.RESERVED,
        reservedUntil,
      },
    });

    return await tx.exchange.create({
      data: {
        itemId: item.id,
        requesterId: currentUser.id,
        ownerId: item.ownerId,
        status: ExchangeStatus.PENDING,
      },
    });
  });

  await notifyUser({
    userId: item.owner.id,
    email: item.owner.email,
    title: "Nouvelle réservation ! 🎉",
    body: `${currentUser.username} a réservé votre objet "${item.title}". Contactez-le pour valider !`,
    type: "ITEM_RESERVED",
  });

  revalidatePath("/");
  return exchange;
}

export async function selectMeetingPoint(exchangeId: string, meetingPointId: string) {
  const currentUser = await getCurrentUser();
  assert(!!currentUser, "Vous devez être connecté.");

  const exchange = await prisma.exchange.findUnique({
    where: { id: exchangeId },
    include: { item: true }
  });

  assert(!!exchange, "Échange introuvable.");
  assert(
    exchange.requesterId === currentUser.id || exchange.ownerId === currentUser.id,
    "Action non autorisée."
  );

  const [point, updated] = await prisma.$transaction([
    prisma.meetingPoint.findUnique({ where: { id: meetingPointId } }),
    prisma.exchange.update({
      where: { id: exchangeId },
      data: { meetingPointId },
    })
  ]);

  // Add a system message to the chat
  if (point) {
    await prisma.message.create({
      data: {
        exchangeId,
        senderId: currentUser.id,
        content: `📍 Lieu de rencontre sélectionné : ${point.name}`,
      }
    });
  }

  revalidatePath(`/exchange/${exchangeId}`);
}
