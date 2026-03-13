import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight, LayoutGrid, MapPin, Sparkles, TrendingUp, Zap, type LucideIcon } from "lucide-react";

import { getDiscoveryFeed } from "@/app/actions/item";
import ItemCard from "@/components/ItemCard";
import TopNav from "@/components/TopNav";
import FilterBar from "@/components/FilterBar";
import { getCurrentUser } from "@/lib/auth";
import { localizeHref } from "@/lib/i18n/pathnames";
import prisma from "@/lib/prisma";
import WelcomeBonusTrigger from "@/components/wallet/WelcomeBonusTrigger";
import { getActiveStories } from "@/app/actions/story";
import StoryCarousel from "@/components/stories/StoryCarousel";



export default async function Home() {
  const user = await getCurrentUser();
  const { nearby, popular, deals, userZone } = await getDiscoveryFeed();
  const [locale, t] = await Promise.all([getLocale(), getTranslations("home")]);

  const unreadCount = user
    ? await prisma.notification.count({ where: { userId: user.id, read: false } })
    : 0;

  const activeStories = await getActiveStories();


  const discoverHref = localizeHref(locale, "/discover");
  const publishHref = localizeHref(locale, "/publish");
  const marketPulse = [
    {
      icon: MapPin,
      label: t("nearbyTitle"),
      value: nearby.length,
      tone:
        "border-[#dbe7ff] bg-[linear-gradient(135deg,rgba(36,87,255,0.1),rgba(255,255,255,0.92))] text-[#183a9a]",
    },
    {
      icon: TrendingUp,
      label: t("popularTitle"),
      value: popular.length,
      tone:
        "border-[#ffd9e4] bg-[linear-gradient(135deg,rgba(255,73,120,0.08),rgba(255,255,255,0.92))] text-[#cc2d61]",
    },
    {
      icon: Zap,
      label: t("dealsTitle"),
      value: deals.length,
      tone:
        "border-[#ffe6bf] bg-[linear-gradient(135deg,rgba(245,158,11,0.1),rgba(255,255,255,0.94))] text-[#b86a00]",
    },
  ] as const;

  const EmptyShelf = ({ tone }: { tone: "indigo" | "rose" | "amber" }) => {
    const tones = {
      indigo:
        "border-indigo-100 bg-[linear-gradient(135deg,rgba(36,87,255,0.1),rgba(255,255,255,0.92))]",
      rose:
        "border-rose-100 bg-[linear-gradient(135deg,rgba(255,96,120,0.1),rgba(255,255,255,0.92))]",
      amber:
        "border-amber-100 bg-[linear-gradient(135deg,rgba(245,158,11,0.1),rgba(255,255,255,0.94))]",
    } as const;

    return (
      <div className={`relative overflow-hidden rounded-[32px] border p-6 shadow-[0_16px_42px_rgba(16,32,58,0.06)] ${tones[tone]}`}>
        <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/70 blur-2xl" />
        <div className="relative space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Sparkles className="h-3.5 w-3.5" />
            {t("emptyBadge")}
          </span>
          <div className="space-y-2">
            <h4 className="font-display text-[1.5rem] font-bold leading-none tracking-[-0.05em] text-slate-950">
              {t("emptyTitle")}
            </h4>
            <p className="max-w-[250px] text-sm font-medium leading-6 text-slate-500">
              {t("emptyBody")}
            </p>
          </div>
          <Link
            href={publishHref}
            className="inline-flex items-center gap-2 rounded-full bg-[#10203a] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-[0_14px_35px_rgba(16,32,58,0.16)]"
          >
            {t("publishCta")}
          </Link>
        </div>
      </div>
    );
  };

  const sectionTones = {
    indigo: {
      shell:
        "border-[#dfe8ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(239,244,255,0.96)_100%)]",
      glow: "bg-[#d8e5ff]/55",
      count: "border-[#d6e3ff] bg-white/80 text-[#2457ff]",
    },
    rose: {
      shell:
        "border-[#ffe0e8] bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,243,246,0.96)_100%)]",
      glow: "bg-[#ffd8e1]/55",
      count: "border-[#ffdbe6] bg-white/80 text-[#e64675]",
    },
    amber: {
      shell:
        "border-[#ffe8c8] bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,247,230,0.96)_100%)]",
      glow: "bg-[#ffe2b2]/60",
      count: "border-[#ffe2b7] bg-white/80 text-[#d88913]",
    },
  } as const;

  const SectionHeader = ({
    icon: Icon,
    title,
    zone,
    count,
    color = "text-gray-900",
  }: {
    icon: LucideIcon;
    title: string;
    zone?: string;
    count: number;
    color?: string;
  }) => (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col">
        <h3 className={`flex items-center gap-2 text-[17px] font-black tracking-tight ${color}`}>
          <Icon className="h-4 w-4" />
          {title}
        </h3>
        <div className="ml-6 mt-1 flex flex-wrap items-center gap-2">
          {zone ? (
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {zone}
            </span>
          ) : null}
          <span className="rounded-full border border-white/80 bg-white/70 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
            {String(count).padStart(2, "0")}
          </span>
        </div>
      </div>
      <Link
        href={discoverHref}
        className="capsule-outline inline-flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#2457ff]"
      >
        {t("seeAll")}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-transparent pb-24 font-sans sm:pb-8">
      <TopNav 
        unreadCount={unreadCount} 
        user={user ? { username: user.username } : null} 
        showBalance={false}
      />

      <div className="space-y-8 px-5 pt-6 sm:space-y-10">
        <section className="mb-2 shrink-0">
          <FilterBar />
        </section>

        {activeStories.length > 0 && (
          <section className="mb-2">
            <StoryCarousel stories={activeStories.map((s: any) => ({
              ...s,
              createdAt: s.createdAt.toISOString()
            })) as any} />

          </section>
        )}

        <section className="group relative mb-24 overflow-hidden rounded-[36px] border border-white/70 bg-[#10203a] p-4 shadow-[0_28px_90px_rgba(16,32,58,0.22)] transition-all active:scale-[0.99] sm:mb-0 sm:rounded-[40px] sm:p-7">
          <Link href={discoverHref} className="absolute inset-0 z-20" aria-label={t("discoverModeTitle")} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(36,87,255,0.9),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(255,130,90,0.22),_transparent_30%)]" />
          <div className="absolute -right-12 top-6 h-36 w-36 rounded-full border border-white/10 bg-white/8 blur-2xl transition-all duration-700 group-hover:scale-110" />
          <div className="absolute -left-10 bottom-0 h-28 w-44 rounded-full bg-[#ff8e63]/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-7 top-7 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          <div className="relative z-10 grid gap-4 sm:gap-5">
            <div className="flex items-start justify-between gap-4 sm:gap-5">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white/65">
                    {t("newBadge")}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/65">
                    <span className="h-2 w-2 rounded-full bg-[#ffb16a]" />
                    {userZone ?? t("localMarket")}
                  </span>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <h2 className="font-display text-[2rem] font-bold leading-[0.92] tracking-[-0.06em] text-white sm:text-[2.6rem]">
                    {t("discoverModeTitle")}
                  </h2>
                  <p className="max-w-[22rem] text-[13px] font-semibold leading-5 text-white/68 sm:max-w-[24rem] sm:text-sm sm:leading-6">
                    {t("discoverModeBody")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#10203a] shadow-[0_18px_40px_rgba(255,255,255,0.12)] sm:px-5 sm:py-3 sm:text-[11px]">
                    {t("seeAll")}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/78 sm:px-4 sm:py-3 sm:text-[11px]">
                    {t("publishCta")}
                  </span>
                </div>
              </div>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/15 bg-white/8 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] sm:h-20 sm:w-20 sm:rounded-[28px]">
                <LayoutGrid className="h-7 w-7 text-white sm:h-9 sm:w-9" />
              </div>
            </div>

            <div className="hidden grid-cols-3 gap-3 sm:grid">
              {marketPulse.map((card) => {
                const PulseIcon = card.icon;
                return (
                  <div
                    key={card.label}
                    className={`rounded-[26px] border p-4 backdrop-blur-xl shadow-[0_16px_36px_rgba(16,32,58,0.16)] ${card.tone}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/75 text-current">
                        <PulseIcon className="h-4.5 w-4.5" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/55">
                        {t("newBadge")}
                      </span>
                    </div>
                    <p className="mt-4 line-clamp-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/68">
                      {card.label}
                    </p>
                    <p className="mt-1 font-display text-[2rem] font-bold leading-none tracking-[-0.05em] text-white">
                      {String(card.value).padStart(2, "0")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className={`relative overflow-hidden rounded-[36px] border p-4 shadow-[0_14px_44px_rgba(16,32,58,0.06)] sm:p-5 ${sectionTones.indigo.shell}`}>
          <div className={`pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full blur-3xl ${sectionTones.indigo.glow}`} />
          <SectionHeader
            icon={MapPin}
            title={t("nearbyTitle")}
            zone={userZone}
            count={nearby.length}
            color="text-indigo-600"
          />
          {nearby.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {nearby.slice(0, 4).map((item: any, index: number) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <EmptyShelf tone="indigo" />
          )}
        </section>

        <section className={`relative overflow-hidden rounded-[36px] border p-4 shadow-[0_14px_44px_rgba(16,32,58,0.06)] sm:p-5 ${sectionTones.rose.shell}`}>
          <div className={`pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full blur-3xl ${sectionTones.rose.glow}`} />
          <SectionHeader icon={TrendingUp} title={t("popularTitle")} count={popular.length} color="text-rose-500" />
          {popular.length > 0 ? (
            <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-4 no-scrollbar [scroll-snap-type:x_mandatory]">
              {popular.map((item: any, index: number) => (
                <div key={item.id} className="w-[214px] flex-shrink-0 snap-start">
                  <ItemCard item={item} index={index} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyShelf tone="rose" />
          )}
        </section>

        <section className={`relative overflow-hidden rounded-[36px] border p-4 pb-8 shadow-[0_14px_44px_rgba(16,32,58,0.06)] sm:p-5 ${sectionTones.amber.shell}`}>
          <div className={`pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full blur-3xl ${sectionTones.amber.glow}`} />
          <SectionHeader icon={Zap} title={t("dealsTitle")} count={deals.length} color="text-amber-500" />
          {deals.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {deals.slice(0, 4).map((item: any, index: number) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <EmptyShelf tone="amber" />
          )}
        </section>
      </div>

      {user && (
        <WelcomeBonusTrigger 
          userCreatedAt={user.createdAt.toISOString()} 
          hasWallet={!!user.wallet}
        />
      )}
    </main>

  );
}
