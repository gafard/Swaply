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
  const heroCards = [
    {
      title: t("heroCardOneTitle"),
      body: t("heroCardOneBody"),
      accent: "from-[#ffffff] to-[#eef4ff]",
    },
    {
      title: t("heroCardTwoTitle"),
      body: t("heroCardTwoBody"),
      accent: "from-[#fff7eb] to-[#fffdf8]",
    },
  ];
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
    count,
    zone,
    color,
  }: {
    icon: LucideIcon;
    title: string;
    count: number;
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
          <span className="rounded-full border border-white/80 bg-white/75 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
            {String(count).padStart(2, "0")}
          </span>
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
        <section className="relative overflow-hidden rounded-[40px] border border-[#18345d] bg-[radial-gradient(circle_at_top_right,rgba(126,189,255,0.34),transparent_25%),linear-gradient(140deg,#091220_0%,#10203a_42%,#173768_68%,#2457ff_100%)] px-5 py-6 text-white shadow-[0_28px_90px_rgba(16,32,58,0.18)] sm:px-6 sm:py-7">
          <div className="absolute -right-12 top-2 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-8 bottom-0 h-36 w-44 rounded-full bg-[#ffb16a]/20 blur-3xl" />
          <div className="relative z-10 grid gap-6">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_190px] md:items-end">
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
                {user?.promoSwaps ? (
                  <span className="rounded-full border border-[#ffdb8d] bg-[#fff4cf] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#8a5b00]">
                    {t("welcomeBonusChip", { amount: user.promoSwaps })}
                  </span>
                ) : null}
              </div>
              <h1 className="max-w-[22rem] font-display text-[2.25rem] font-bold leading-[0.92] tracking-[-0.06em] text-white sm:text-[2.6rem]">
                {t("heroTitle")}
              </h1>
              <p className="max-w-[24rem] text-[14px] font-medium leading-6 text-white/74">
                {t("heroBody")}
              </p>
              </div>

              <div className="relative flex min-h-[178px] items-end justify-end">
                <div className="absolute right-0 top-0 w-[9.5rem] rounded-[28px] border border-white/15 bg-white/10 p-4 backdrop-blur-xl shadow-[0_20px_45px_rgba(5,10,20,0.2)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/56">{t("heroPanelBadge")}</p>
                  <p className="mt-3 font-display text-[1.55rem] font-bold leading-[0.94] tracking-[-0.05em] text-white">
                    {userZone ?? t("localMarket")}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-white/64">{t("heroPanelBody")}</p>
                </div>
                <div className="absolute left-0 bottom-0 w-[8.75rem] rounded-[26px] border border-[#ffe2a9]/20 bg-[linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,177,106,0.18))] p-4 backdrop-blur-xl shadow-[0_18px_40px_rgba(5,10,20,0.18)]">
                  <Compass className="h-5 w-5 text-[#ffe2a9]" />
                  <p className="mt-3 text-[11px] font-black uppercase tracking-[0.18em] text-white/72">{t("heroPrimary")}</p>
                  <p className="mt-1 text-xs leading-5 text-white/60">{t("heroCardTagline")}</p>
                </div>
              </div>
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

            <div className="grid gap-3 sm:grid-cols-2">
              {heroCards.map((card) => (
                <div
                  key={card.title}
                  className={`rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.08))] p-4 shadow-[0_18px_40px_rgba(5,10,20,0.12)] backdrop-blur-xl`}
                >
                  <div className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-900 ${card.accent}`}>
                    {card.title}
                  </div>
                  <p className="mt-3 max-w-[15rem] text-sm leading-6 text-white/74">{card.body}</p>
                </div>
              ))}
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
            count={nearby.length}
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
          <SectionHeader icon={TrendingUp} title={t("popularTitle")} count={popular.length} color="text-[#e24878]" />
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
          <SectionHeader icon={Zap} title={t("dealsTitle")} count={deals.length} color="text-[#d88913]" />
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
