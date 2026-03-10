"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assert } from "@/lib/validations";
import { ExchangeStatus, ItemStatus, Prisma } from "@prisma/client";
import { notifyUser } from "@/lib/notify";

export async function sendMessage(exchangeId: string, formData: FormData) {
  const currentUser = await getCurrentUser();
  assert(!!currentUser, "Vous devez être connecté.");
  const content = formData.get("message")?.toString() || "";

  const exchange = await prisma.exchange.findUnique({
    where: { id: exchangeId },
    include: {
      owner: true,
      requester: true,
      item: true
    }
  });

  assert(!!exchange, "Échange introuvable.");
  assert(
    exchange.requesterId === currentUser.id || exchange.ownerId === currentUser.id,
    "Non autorisé."
  );
  assert(content.trim().length > 0, "Message vide.");

  await prisma.message.create({
    data: {
      exchangeId,
      senderId: currentUser.id,
      content: content.trim(),
    },
  });

  // Determine the recipient (the person who is NOT the sender)
  const isSenderOwner = exchange.ownerId === currentUser.id;
  const recipient = isSenderOwner ? exchange.requester : exchange.owner;

  await notifyUser({
    userId: recipient.id,
    email: recipient.email,
    title: "Nouveau message 💬",
    body: `${currentUser.username} vous a envoyé un message : "${content.trim().substring(0, 30)}..."`,
    type: "NEW_MESSAGE",
  });

  revalidatePath(`/exchange/${exchangeId}`);
}

export async function confirmExchange(exchangeId: string) {
  const currentUser = await getCurrentUser();
  assert(!!currentUser, "Vous devez être connecté.");

  const exchange = await prisma.exchange.findUnique({
    where: { id: exchangeId },
    include: {
      item: true,
      requester: true,
      owner: true,
    },
  });

  assert(!!exchange, "Échange introuvable.");
  assert(
    exchange.requesterId === currentUser.id || exchange.ownerId === currentUser.id,
    "Non autorisé."
  );
  assert(exchange.status !== ExchangeStatus.COMPLETED, "Échange déjà terminé.");
  assert(exchange.item.status === ItemStatus.RESERVED, "Objet non réservé.");

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Lock the requester for safe concurrent deduction (Prisma optimistic / transaction boundary)
    const requester = await tx.user.findUniqueOrThrow({
      where: { id: exchange.requesterId },
    });

    assert(requester.credits >= exchange.item.creditValue, "Crédits insuffisants au moment de la confirmation.");

    await tx.user.update({
      where: { id: exchange.requesterId },
      data: {
        credits: { decrement: exchange.item.creditValue },
        trustScore: { increment: 1 },
        totalExchanges: { increment: 1 },
      },
    });

    await tx.user.update({
      where: { id: exchange.ownerId },
      data: {
        credits: { increment: exchange.item.creditValue },
        trustScore: { increment: 1 },
        totalExchanges: { increment: 1 },
      },
    });

    await tx.item.update({
      where: { id: exchange.itemId },
      data: {
        status: ItemStatus.EXCHANGED,
        reservedUntil: null,
      },
    });

    await tx.exchange.update({
      where: { id: exchange.id },
      data: {
        status: ExchangeStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  });

  // Determine the recipient of the notification (the other party)
  const isSenderOwner = exchange.ownerId === currentUser.id;
  const recipient = isSenderOwner ? exchange.requester : exchange.owner;

  await notifyUser({
    userId: recipient.id,
    email: recipient.email,
    title: "Échange confirmé ! ✅",
    body: `${currentUser.username} a confirmé l'échange pour "${exchange.item.title}". Les crédits ont été transférés.`,
    type: "EXCHANGE_CONFIRMED",
  });

  revalidatePath("/");
  revalidatePath(`/exchange/${exchangeId}`);
}
