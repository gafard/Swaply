import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { resend } from "@/lib/resend";
import {
  buildNotificationContent,
  type NotificationPayloadMap,
  type NotificationTemplate,
} from "@/lib/notification-templates";

type NotifyUserTemplateParams<T extends NotificationTemplate = NotificationTemplate> = {
  userId: string;
  email?: string;
  template: T;
  payload: NotificationPayloadMap[T];
  type?: string;
  link?: string;
};

type NotifyUserTextParams = {
  userId: string;
  email?: string;
  title: string;
  body?: string | null;
  type?: string;
  link?: string;
};

export async function notifyUser(
  params: NotifyUserTemplateParams | NotifyUserTextParams
) {
  try {
    const recipient = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        preferredLanguage: true,
      },
    });

    const content =
      "template" in params
        ? buildNotificationContent(
            recipient?.preferredLanguage,
            params.template,
            params.payload
          )
        : {
            title: params.title,
            body: params.body ?? "",
          };

    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: "template" in params ? params.template : params.type,
        payload:
          "template" in params ? (params.payload as Prisma.InputJsonValue) : undefined,
        title: "template" in params ? null : params.title,
        body: "template" in params ? null : params.body ?? null,
        link: params.link,
      },
    });

    if (params.email && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "Swaply <noreply@swaply.local>",
        to: params.email,
        subject: content.title,
        text: content.body,
      });
    }
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}
