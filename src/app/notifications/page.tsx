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
      return <MessageCircle className="h-5 w-5 text-primary" />;
    case "exchange_reserved":
    case "new_local_item":
      return <PackageOpen className="h-5 w-5 text-primary" />;
    case "exchange_confirmed":
      return <CheckCircle2 className="h-5 w-5 text-success" />;
    case "reservation_expired_owner":
    case "reservation_expired_requester":
      return <Clock className="h-5 w-5 text-danger" />;
    case "item_reported_owner":
    case "item_removed_after_review":
    case "report_reviewed_without_action":
      return <ShieldAlert className="h-5 w-5 text-warning" />;
    default:
      return <BellRing className="h-5 w-5 text-primary" />;
  }
}

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  const [locale, t] = await Promise.all([getLocale(), getTranslations("notifications")]);

  if (!user) {
    return (
      <main className="flex h-screen items-center justify-center p-6 bg-background">
        <p className="text-muted">{t("loginPrompt")}</p>
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
    <main className="min-h-screen bg-background pb-32 font-sans">
      <AnimatedContainer
        initialY={-20}
        className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-surface/85 px-5 pb-4 pt-10 shadow-sm backdrop-blur-2xl"
      >
        <Link href={localizeHref(locale, "/")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface text-foreground shadow-sm transition-all hover:border-primary/40 active:scale-95">
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </div>
        </Link>
        <h1 className="font-display text-xl font-bold text-foreground">
          {t("title")}
        </h1>
      </AnimatedContainer>

      <div className="space-y-3 px-4 pt-6 max-w-md mx-auto">
        {notifications.length === 0 ? (
          <AnimatedContainer delay={0.1} className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-raised text-muted border border-border">
              <BellRing className="h-8 w-8 opacity-40" />
            </div>
            <p className="font-semibold text-muted text-sm">{t("empty")}</p>
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
                className={`relative overflow-hidden rounded-[24px] border p-4 shadow-sm transition-all duration-300 ${
                  !notification.read
                    ? "border-primary/30 bg-surface shadow-md ring-1 ring-primary/20"
                    : "border-border bg-surface hover:border-primary/30"
                }`}
              >
                {!notification.read && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-primary" />
                )}

                <div className="flex gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm ${
                      !notification.read
                        ? "border-primary/20 bg-primary/10"
                        : "border-border bg-surface-raised"
                    }`}
                  >
                    {getIcon(notification.type, title)}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <span
                        className={`text-sm font-bold leading-snug ${
                          !notification.read ? "text-foreground" : "text-foreground-muted"
                        }`}
                      >
                        {title}
                      </span>
                      <span className="mt-0.5 whitespace-nowrap text-[9px] font-semibold uppercase tracking-wider text-muted">
                        {formatRelativeTime(locale, notification.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`text-xs leading-relaxed ${
                        !notification.read ? "font-medium text-foreground-muted" : "text-muted"
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
