import Link from "next/link";
import { ExchangeStatus } from "@prisma/client";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ChevronRight, MessageCircle } from "lucide-react";

import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedContainer";
import { getCurrentUser } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/i18n/format";
import { localizeHref } from "@/lib/i18n/pathnames";
import prisma from "@/lib/prisma";

const statusStyles: Record<ExchangeStatus, string> = {
  PENDING: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  CONFIRMED: "border-primary/20 bg-primary/10 text-primary",
  COMPLETED: "border-success/20 bg-success/10 text-success",
  CANCELLED: "border-danger/20 bg-danger/10 text-danger",
  EXPIRED: "border-border bg-surface text-muted",
  DISPUTED: "border-danger/20 bg-danger/10 text-danger",
};

export default async function MessagesPage() {
  const user = await getCurrentUser();
  const [locale, t] = await Promise.all([getLocale(), getTranslations("messages")]);

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 pb-24">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MessageCircle className="h-10 w-10" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">{t("lockedTitle")}</h1>
        <p className="mb-8 text-center text-sm text-muted">{t("lockedBody")}</p>
        <Link
          href={localizeHref(locale, "/login")}
          className="w-full rounded-2xl bg-primary py-4 text-center font-bold text-white shadow-cta hover:bg-primary/90 transition-all"
        >
          {t("login")}
        </Link>
      </main>
    );
  }

  const exchanges = await prisma.exchange.findMany({
    where: {
      OR: [{ ownerId: user.id }, { requesterId: user.id }],
    },
    include: {
      item: true,
      owner: true,
      requester: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const conversations = exchanges
    .map((exchange) => {
      const otherUser = exchange.ownerId === user.id ? exchange.requester : exchange.owner;
      const lastMessage = exchange.messages[0];
      const lastActivity = lastMessage?.createdAt ?? exchange.createdAt;

      return {
        exchange,
        otherUser,
        lastMessage,
        lastActivity,
      };
    })
    .sort((left, right) => right.lastActivity.getTime() - left.lastActivity.getTime());

  return (
    <main className="min-h-screen bg-background pb-24 font-sans sm:pb-8">
      <AnimatedContainer
        initialY={-20}
        className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-surface/85 px-5 pb-4 pt-12 backdrop-blur-xl"
      >
        <Link
          href={localizeHref(locale, "/")}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface text-foreground shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-xs font-medium text-muted">{t("subtitle")}</p>
        </div>
      </AnimatedContainer>

      <div className="space-y-4 px-5 pt-6">
        {conversations.length === 0 ? (
          <AnimatedContainer className="rounded-[1.75rem] border border-dashed border-border bg-surface p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background">
              <MessageCircle className="h-6 w-6 text-muted" />
            </div>
            <p className="mb-1 font-bold text-foreground">{t("emptyTitle")}</p>
            <p className="mb-6 text-sm text-muted">{t("emptyBody")}</p>
            <Link
              href={localizeHref(locale, "/")}
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-cta hover:bg-primary/90 transition-all"
            >
              {t("explore")}
            </Link>
          </AnimatedContainer>
        ) : (
          conversations.map(({ exchange, otherUser, lastMessage, lastActivity }, index) => (
            <AnimatedItem key={exchange.id} index={index}>
              <Link
                href={localizeHref(locale, `/exchange/${exchange.id}`)}
                className="block rounded-[1.75rem] border border-border bg-surface p-4 shadow-sm transition-colors hover:border-primary/40"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-500 font-bold text-white shadow-sm">
                    {otherUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-foreground">{otherUser.username}</p>
                        <p className="line-clamp-1 text-xs font-medium text-muted">
                          {exchange.item.title}
                        </p>
                      </div>
                      <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-muted">
                        {formatRelativeTime(locale, lastActivity)}
                      </span>
                    </div>

                    <p className="mb-3 line-clamp-2 text-sm font-medium text-foreground/80">
                      {lastMessage?.body ?? t("noMessage")}
                    </p>

                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusStyles[exchange.status]}`}
                      >
                        {t(`statuses.${exchange.status.toLowerCase()}`)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                        {t("open")}
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedItem>
          ))
        )}
      </div>
    </main>
  );
}

