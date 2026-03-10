"use server";

import { revalidatePath } from "next/cache";

import { actionFail } from "@/lib/actions/result";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assert } from "@/lib/validations";
import { notifyUser } from "@/lib/notify";

export async function sendMessage(exchangeId: string, formData: FormData) {
  const currentUser = await getCurrentUser();
  assert(!!currentUser, "Vous devez etre connecte.");

  const body = formData.get("message")?.toString().trim() || "";
  assert(body.length > 0, "Message vide.");

  const exchange = await prisma.exchange.findUnique({
    where: { id: exchangeId },
    include: {
      owner: true,
      requester: true,
      item: true,
    },
  });

  assert(!!exchange, "Echange introuvable.");
  assert(
    exchange.requesterId === currentUser.id || exchange.ownerId === currentUser.id,
    "Non autorise."
  );

  await prisma.message.create({
    data: {
      exchangeId,
      senderId: currentUser.id,
      body,
    },
  });

  const recipient =
    exchange.ownerId === currentUser.id ? exchange.requester : exchange.owner;

  await notifyUser({
    userId: recipient.id,
    email: recipient.email ?? undefined,
    template: "new_message",
    payload: {
      username: currentUser.username,
      itemTitle: exchange.item.title,
    },
    link: `/exchange/${exchangeId}`,
  });

  revalidatePath(`/exchange/${exchangeId}`);
}

export async function confirmExchange() {
  return actionFail("manual_validation_removed");
}
