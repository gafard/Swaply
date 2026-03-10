import { ItemReportStatus, ItemStatus, UserRole } from "@prisma/client";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  BarChart3,
  Eye,
  Flag,
  ShieldCheck,
  Siren,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import ReportDecisionButtons from "@/components/moderation/ReportDecisionButtons";
import { getCurrentUser } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/i18n/format";
import { localizeHref } from "@/lib/i18n/pathnames";
import prisma from "@/lib/prisma";

const MODERATOR_ROLES = new Set<UserRole>([UserRole.ADMIN, UserRole.MODERATOR]);

const reportStatusStyles: Record<ItemReportStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  REVIEWED: "bg-blue-50 text-blue-700 border-blue-100",
  REJECTED: "bg-slate-100 text-slate-700 border-slate-200",
  ACTIONED: "bg-rose-50 text-rose-700 border-rose-100",
};

const itemStatusStyles: Record<ItemStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-100",
  RESERVED: "bg-amber-50 text-amber-700 border-amber-100",
  EXCHANGED: "bg-indigo-50 text-indigo-700 border-indigo-100",
  REMOVED: "bg-rose-50 text-rose-700 border-rose-100",
};

function getReportStatusLabel(
  t: Awaited<ReturnType<typeof getTranslations>>,
  status: ItemReportStatus
) {
  return t(`statuses.report.${status.toLowerCase()}` as any);
}

function getItemStatusLabel(
  t: Awaited<ReturnType<typeof getTranslations>>,
  status: ItemStatus
) {
  return t(`statuses.item.${status.toLowerCase()}` as any);
}

function getReasonLabel(
  t: Awaited<ReturnType<typeof getTranslations>>,
  reason: string
) {
  if (["misleading_listing", "forbidden_item", "suspected_scam", "offensive_content", "other"].includes(reason)) {
    return t(`reasonLabels.${reason}` as any);
  }

  return reason;
}

export default async function ModerationPage() {
  const [user, locale, t] = await Promise.all([
    getCurrentUser(),
    getLocale(),
    getTranslations("moderation"),
  ]);

  if (!user) {
    redirect(localizeHref(locale, "/login"));
  }

  if (!MODERATOR_ROLES.has(user.role)) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-6 pb-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">{t("restrictedTitle")}</h1>
        <p className="mb-8 max-w-sm text-sm text-slate-500">{t("restrictedBody")}</p>
        <Link
          href={localizeHref(locale, "/profile")}
          className="rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200"
        >
          {t("backToProfile")}
        </Link>
      </main>
    );
  }

  const [
    pendingReports,
    recentReports,
    pendingReportsCount,
    actionedReportsCount,
    topReportedItems,
    topViewedItems,
  ] = await Promise.all([
    prisma.itemReport.findMany({
      where: {
        status: ItemReportStatus.PENDING,
      },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
          },
        },
        item: {
          select: {
            id: true,
            title: true,
            status: true,
            owner: {
              select: {
                id: true,
                username: true,
              },
            },
            city: {
              select: {
                name: true,
              },
            },
            zone: {
              select: {
                name: true,
              },
            },
            metric: true,
            images: {
              orderBy: { orderIndex: "asc" },
              take: 1,
            },
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 18,
    }),
    prisma.itemReport.findMany({
      where: {
        status: {
          not: ItemReportStatus.PENDING,
        },
      },
      include: {
        reporter: {
          select: {
            username: true,
          },
        },
        item: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 10,
    }),
    prisma.itemReport.count({
      where: {
        status: ItemReportStatus.PENDING,
      },
    }),
    prisma.itemReport.count({
      where: {
        status: ItemReportStatus.ACTIONED,
      },
    }),
    prisma.itemMetric.findMany({
      where: {
        reportsCount: { gt: 0 },
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            status: true,
            owner: {
              select: {
                username: true,
              },
            },
            zone: {
              select: {
                name: true,
              },
            },
            city: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ reportsCount: "desc" }, { updatedAt: "desc" }],
      take: 5,
    }),
    prisma.itemMetric.findMany({
      where: {
        totalViews: { gt: 0 },
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            status: true,
            owner: {
              select: {
                username: true,
              },
            },
            zone: {
              select: {
                name: true,
              },
            },
            city: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ uniqueViews: "desc" }, { totalViews: "desc" }],
      take: 5,
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24 font-sans sm:pb-8">
      <div className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 px-5 pb-4 pt-12 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href={localizeHref(locale, "/profile")}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-700 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{t("title")}</h1>
            <p className="text-xs font-medium text-slate-500">{t("subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-5 py-6">
        <section className="grid grid-cols-2 gap-4">
          <div className="rounded-[1.75rem] border border-amber-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Siren className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              {t("stats.pending")}
            </p>
            <p className="mt-1 text-3xl font-black text-slate-900">{pendingReportsCount}</p>
          </div>
          <div className="rounded-[1.75rem] border border-rose-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Flag className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              {t("stats.removals")}
            </p>
            <p className="mt-1 text-3xl font-black text-slate-900">{actionedReportsCount}</p>
          </div>
          <div className="rounded-[1.75rem] border border-indigo-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              {t("stats.reportedItems")}
            </p>
            <p className="mt-1 text-3xl font-black text-slate-900">{topReportedItems.length}</p>
          </div>
          <div className="rounded-[1.75rem] border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Eye className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              {t("stats.watchedItems")}
            </p>
            <p className="mt-1 text-3xl font-black text-slate-900">{topViewedItems.length}</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t("queue.title")}</h2>
              <p className="text-xs font-medium text-slate-500">{t("queue.subtitle")}</p>
            </div>
          </div>

          {pendingReports.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white p-8 text-center">
              <p className="text-base font-bold text-slate-900">{t("queue.emptyTitle")}</p>
              <p className="mt-2 text-sm text-slate-500">{t("queue.emptyBody")}</p>
            </div>
          ) : (
            pendingReports.map((report) => (
              <article
                key={report.id}
                className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[1.5rem] bg-slate-100">
                      {report.item.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={report.item.images[0].url}
                          alt={report.item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <Flag className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={localizeHref(locale, `/item/${report.item.id}`)}
                          className="text-base font-bold text-slate-900 hover:text-indigo-600"
                        >
                          {report.item.title}
                        </Link>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${itemStatusStyles[report.item.status]}`}
                        >
                          {getItemStatusLabel(t, report.item.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {t("queue.reportedBy", {
                          reporter: report.reporter.username,
                          owner: report.item.owner.username,
                          time: formatRelativeTime(locale, report.createdAt),
                        })}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        {getReasonLabel(t, report.reason)}
                      </p>
                      {report.details ? (
                        <p className="mt-2 text-sm leading-relaxed text-slate-500">
                          {report.details}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {report.item.zone?.name ?? report.item.city?.name ?? t("unknownZone")}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {t("queue.reportsCount", { count: report.item.metric?.reportsCount ?? 0 })}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {t("queue.uniqueViews", { count: report.item.metric?.uniqueViews ?? 0 })}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {t("queue.favoritesCount", { count: report.item.metric?.favoritesCount ?? 0 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <ReportDecisionButtons reportId={report.id} />
              </article>
            ))
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{t("topReported.title")}</h2>
                <p className="text-xs font-medium text-slate-500">{t("topReported.subtitle")}</p>
              </div>
            </div>

            <div className="space-y-3">
              {topReportedItems.length === 0 ? (
                <p className="text-sm text-slate-500">{t("topReported.empty")}</p>
              ) : (
                topReportedItems.map((metric) => (
                  <Link
                    key={metric.itemId}
                    href={localizeHref(locale, `/item/${metric.item.id}`)}
                    className="flex items-center justify-between rounded-[1.4rem] bg-slate-50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{metric.item.title}</p>
                      <p className="text-[11px] font-medium text-slate-500">
                        {metric.item.owner.username} • {metric.item.zone?.name ?? metric.item.city?.name ?? t("withoutZone")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-rose-600">{metric.reportsCount}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t("topReported.metric")}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{t("topViewed.title")}</h2>
                <p className="text-xs font-medium text-slate-500">{t("topViewed.subtitle")}</p>
              </div>
            </div>

            <div className="space-y-3">
              {topViewedItems.length === 0 ? (
                <p className="text-sm text-slate-500">{t("topViewed.empty")}</p>
              ) : (
                topViewedItems.map((metric) => (
                  <Link
                    key={metric.itemId}
                    href={localizeHref(locale, `/item/${metric.item.id}`)}
                    className="flex items-center justify-between rounded-[1.4rem] bg-slate-50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{metric.item.title}</p>
                      <p className="text-[11px] font-medium text-slate-500">
                        {metric.item.owner.username} • {metric.item.zone?.name ?? metric.item.city?.name ?? t("withoutZone")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600">{metric.uniqueViews}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t("topViewed.metric")}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">{t("recent.title")}</h2>
          <div className="mt-4 space-y-3">
            {recentReports.length === 0 ? (
              <p className="text-sm text-slate-500">{t("recent.empty")}</p>
            ) : (
              recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] bg-slate-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{report.item.title}</p>
                    <p className="text-[11px] font-medium text-slate-500">
                      {t("recent.byReporter", {
                        reporter: report.reporter.username,
                        time: formatRelativeTime(locale, report.updatedAt),
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${itemStatusStyles[report.item.status]}`}
                    >
                      {getItemStatusLabel(t, report.item.status)}
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${reportStatusStyles[report.status]}`}
                    >
                      {getReportStatusLabel(t, report.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
