import prisma from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { NotificationType } from "@prisma/client";

export async function notifyUser(params: {
  userId: string;
  email?: string;
  title: string;
  body: string;
  type: NotificationType;
}) {
  try {
    // 1. In-app Notification
    await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        body: params.body,
        type: params.type,
      },
    });

    // 2. Email Notification
    if (params.email && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "Swaply <noreply@swaply.local>", // User should replace with their verified domain
        to: params.email,
        subject: params.title,
        text: params.body,
      });
    }
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}
