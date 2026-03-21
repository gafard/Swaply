import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight, Compass, MapPin, TrendingUp, Zap, type LucideIcon } from "lucide-react";

import { getDiscoveryFeed } from "@/app/actions/item";
import ItemCard from "@/components/ItemCard";
import TopNav from "@/components/TopNav";
import FilterBar from "@/components/FilterBar";
import { getCurrentUser } from "@/lib/auth";
import { localizeHref } from "@/lib/i18n/pathnames";
import prisma from "@/lib/prisma";
import WelcomeBonusTrigger from "@/components/wallet/WelcomeBonusTrigger";

export default async function Home() {
  const user = await getCurrentUser();
  const { nearby, popular, deals, userZone } = await getDiscoveryFeed();
  const [locale, t] = await Promise.all([getLocale(), getTranslations("home")]);

  const unreadCount = user
    ? await prisma.notification.count({ where: { userId: user.id, read: false } })
    : 0;

  const discoverHref = localizeHref(locale, "/discover");
  const publishHref = localizeHref(locale, "/publish");
  const sectionTone = {
    nearby: "border-[#dfe8ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(242,246,255,0.96)_100%)]",
    popular: "border-[#ffe0e8] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,244,247,0.96)_100%)]",
    deals: "border-[#ffe7c9] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,247,234,0.96)_100%)]",
  } as const;

  const EmptyShelf = ({ tone }: { tone: keyof typeof sectionTone }) => (
    <div className="rounded-[28px] border border-dashed border-border bg-white/75 px-5 py-8 text-center shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted/70">{t("emptyBadge")}</p>
      <h4 className="mt-3 font-display text-[1.45rem] font-bold tracking-[-0.05em] text-foreground">
        {t("emptyTitle")}
      </h4>
      <p className="mx-auto mt-2 max-w-[18rem] text-sm leading-6 text-muted">{t("emptyBody")}</p>
      <Link
        href={publishHref}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-[0_14px_34px_rgba(16,32,58,0.16)]"
      >
        {t("publishCta")}
      </Link>
    </div>
  );

  const SectionHeader = ({
    icon: Icon,
    title,
    zone,
    color,
  }: {
    icon: LucideIcon;
    title: string;
    zone?: string;
    color: string;
  }) => (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className={`flex items-center gap-2 text-[17px] font-black tracking-tight ${color}`}>
          <Icon className="h-4 w-4" />
          {title}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-2 pl-6">
          {zone ? (
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted/70">{zone}</span>
          ) : null}
        </div>
      </div>
      <Link
        href={discoverHref}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-primary shadow-sm"
      >
        {t("seeAll")}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-transparent pb-24 font-sans sm:pb-8">
      <TopNav unreadCount={unreadCount} user={user} showSearch={false} showBalance={false} />

      <div className="space-y-8 px-5 pt-6 sm:space-y-10">
        <section className="relative overflow-hidden rounded-[34px] border border-[#18345d] bg-[radial-gradient(circle_at_top_right,rgba(126,189,255,0.26),transparent_24%),linear-gradient(140deg,#091220_0%,#10203a_48%,#173768_72%,#2457ff_100%)] px-5 py-5 text-white shadow-[0_24px_70px_rgba(16,32,58,0.16)] sm:px-6 sm:py-6">
          <div className="absolute -right-12 top-0 h-36 w-36 rounded-full bg-white/8 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-28 w-32 rounded-full bg-[#ffb16a]/16 blur-3xl" />
          <div className="relative z-10 space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/72">
                  {t("heroEyebrow")}
                </span>
                {userZone ? (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/72">
                    {userZone}
                  </span>
                ) : null}
              </div>
              <h1 className="max-w-[20rem] font-display text-[1.95rem] font-bold leading-[0.94] tracking-[-0.06em] text-white sm:max-w-[24rem] sm:text-[2.25rem]">
                {t("heroTitle")}
              </h1>
              <p className="max-w-[22rem] text-[13px] font-medium leading-6 text-white/72 sm:max-w-[24rem]">
                {t("heroBody")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={discoverHref}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#10203a] shadow-[0_16px_38px_rgba(255,255,255,0.18)]"
              >
                <Compass className="h-4 w-4" />
                {t("heroPrimary")}
              </Link>
              <Link
                href={publishHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white/88"
              >
                {t("heroSecondary")}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,252,247,0.84))] p-3 shadow-[0_14px_42px_rgba(16,32,58,0.05)]">
          <FilterBar />
        </section>

        <section className={`relative overflow-hidden rounded-[34px] border p-4 shadow-[0_14px_44px_rgba(16,32,58,0.06)] sm:p-5 ${sectionTone.nearby}`}>
          <SectionHeader
            icon={MapPin}
            title={t("nearbyTitle")}
            zone={userZone ?? undefined}
            color="text-[#2457ff]"
          />
          {nearby.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {nearby.slice(0, 4).map((item: any, index: number) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <EmptyShelf tone="nearby" />
          )}
        </section>

        <section className={`relative overflow-hidden rounded-[34px] border p-4 shadow-[0_14px_44px_rgba(16,32,58,0.06)] sm:p-5 ${sectionTone.popular}`}>
          <SectionHeader icon={TrendingUp} title={t("popularTitle")} color="text-[#e24878]" />
          {popular.length > 0 ? (
            <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-4 no-scrollbar [scroll-snap-type:x_mandatory]">
              {popular.map((item: any, index: number) => (
                <div key={item.id} className="w-[214px] flex-shrink-0 snap-start">
                  <ItemCard item={item} index={index} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyShelf tone="popular" />
          )}
        </section>

        <section className={`relative overflow-hidden rounded-[34px] border p-4 pb-8 shadow-[0_14px_44px_rgba(16,32,58,0.06)] sm:p-5 ${sectionTone.deals}`}>
          <SectionHeader icon={Zap} title={t("dealsTitle")} color="text-[#d88913]" />
          {deals.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {deals.slice(0, 4).map((item: any, index: number) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <EmptyShelf tone="deals" />
          )}
        </section>
      </div>

      {user ? (
        <WelcomeBonusTrigger
          userCreatedAt={user.createdAt.toISOString()}
          promoSwaps={user.promoSwaps}
          availableSwaps={user.availableSwaps}
        />
      ) : null}
    </main>
  );
}
