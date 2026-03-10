import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  BellRing,
  CheckCircle2,
  Clock,
  MessageCircle,
  PackageOpen,
  ShieldAlert,
} from "lucide-react";

import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedContainer";
import { getCurrentUser } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/i18n/format";
import { localizeHref } from "@/lib/i18n/pathnames";
import {
  buildNotificationContent,
  isNotificationTemplate,
  parseNotificationPayload,
} from "@/lib/notification-templates";
import prisma from "@/lib/prisma";

function getIcon(type: string | null | undefined, fallbackTitle?: string | null) {
  switch (type) {
    case "new_message":
      return <MessageCircle className="h-5 w-5 text-blue-500" />;
    case "exchange_reserved":
    case "new_local_item":
      return <PackageOpen className="h-5 w-5 text-indigo-500" />;
    case "exchange_confirmed":
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case "reservation_expired_owner":
    case "reservation_expired_requester":
      return <Clock className="h-5 w-5 text-rose-500" />;
    case "item_reported_owner":
    case "item_removed_after_review":
    case "report_reviewed_without_action":
      return <ShieldAlert className="h-5 w-5 text-amber-500" />;
    default: {
      const normalized = fallbackTitle?.toLowerCase() ?? "";

      if (normalized.includes("message")) {
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      }
      if (normalized.includes("reserve")) {
        return <PackageOpen className="h-5 w-5 text-indigo-500" />;
      }
      if (normalized.includes("valide") || normalized.includes("confirmed")) {
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      }
      if (normalized.includes("expire")) {
        return <Clock className="h-5 w-5 text-rose-500" />;
      }

      return <BellRing className="h-5 w-5 text-indigo-500" />;
    }
  }
}

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  const [locale, t] = await Promise.all([getLocale(), getTranslations("notifications")]);

  if (!user) {
    return (
      <main className="flex h-screen items-center justify-center p-6">
        <p className="text-gray-500">{t("loginPrompt")}</p>
      </main>
    );
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (notifications.some((notification) => !notification.read)) {
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24 font-sans sm:pb-8">
      <AnimatedContainer
        initialY={-20}
        className="sticky top-0 z-40 flex items-center gap-3 border-b border-gray-100/50 bg-white/80 px-5 pb-4 pt-12 shadow-[0_4px_30px_-15px_rgba(0,0,0,0.05)] backdrop-blur-xl"
      >
        <Link href={localizeHref(locale, "/")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-700 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] transition-all hover:bg-gray-50 active:scale-95">
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </div>
        </Link>
        <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-xl font-bold text-transparent">
          {t("title")}
        </h1>
      </AnimatedContainer>

      <div className="space-y-4 px-5 pt-6">
        {notifications.length === 0 ? (
          <AnimatedContainer delay={0.1} className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
              <BellRing className="h-8 w-8 text-gray-300" />
            </div>
            <p className="font-medium text-gray-500">{t("empty")}</p>
          </AnimatedContainer>
        ) : (
          notifications.map((notification, index) => {
            const payload = isNotificationTemplate(notification.type)
              ? parseNotificationPayload(notification.payload)
              : null;
            const localized =
              isNotificationTemplate(notification.type) && payload
                ? buildNotificationContent(locale, notification.type, payload)
                : null;
            const title = localized?.title ?? notification.title ?? t("fallbackTitle");
            const body = localized?.body ?? notification.body ?? "";
            const card = (
              <AnimatedItem
                key={notification.id}
                index={index}
                className={`relative overflow-hidden rounded-[1.5rem] border p-4 shadow-sm transition-all duration-300 ${
                  !notification.read
                    ? "border-indigo-100 bg-white shadow-[0_4px_20px_-5px_rgba(79,70,229,0.15)] ring-1 ring-indigo-50"
                    : "border-gray-100/60 bg-white/60 shadow-[0_2px_10px_-5px_rgba(0,0,0,0.05)] hover:bg-white"
                }`}
              >
                {!notification.read && (
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500" />
                )}

                <div className="flex gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] border shadow-inner ${
                      !notification.read
                        ? "border-indigo-100/50 bg-indigo-50"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    {getIcon(notification.type, title)}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="mb-1 flex items-start justify-between gap-4">
                      <span
                        className={`text-[14px] font-bold leading-snug ${
                          !notification.read ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {title}
                      </span>
                      <span className="mt-0.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        {formatRelativeTime(locale, notification.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`text-[13px] leading-relaxed ${
                        !notification.read ? "font-medium text-gray-600" : "text-gray-500"
                      }`}
                    >
                      {body}
                    </p>
                  </div>
                </div>
              </AnimatedItem>
            );

            if (!notification.link) {
              return card;
            }

            return (
              <Link key={notification.id} href={localizeHref(locale, notification.link)}>
                {card}
              </Link>
            );
          })
        )}
      </div>
    </main>
  );
}
