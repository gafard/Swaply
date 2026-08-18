"use server";

import { revalidatePath } from "next/cache";
import { actionFail, actionOk } from "@/lib/actions/result";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";
import { checkRateLimit } from "@/lib/rate-limit";

export async function sendMessage(exchangeId: string, formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return actionFail("auth_required");
  }

  const body = formData.get("message")?.toString().trim() || "";
  if (!body) {
    return actionFail("message_empty");
  }

  if (body.length > 2000) {
    return actionFail("message_too_long");
  }

  const rateLimit = await checkRateLimit(currentUser.id, "message");
  if (!rateLimit.allowed) {
    return actionFail("rate_limited", {
      retryAfterSeconds: Math.ceil(rateLimit.resetIn / 1000),
    });
  }

  const exchange = await prisma.exchange.findUnique({
    where: { id: exchangeId },
    include: {
      owner: true,
      requester: true,
      item: true,
    },
  });

  if (!exchange) {
    return actionFail("exchange_not_found");
  }

  if (exchange.requesterId !== currentUser.id && exchange.ownerId !== currentUser.id) {
    return actionFail("forbidden");
  }

  try {
    const message = await prisma.message.create({
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
    return actionOk("message_sent", { messageId: message.id });
  } catch (error) {
    console.error("[sendMessage] Error:", error);
    return actionFail("unexpected_error");
  }
}

export async function confirmExchange() {
  return actionFail("manual_validation_removed");
}

