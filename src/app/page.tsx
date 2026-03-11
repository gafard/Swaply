import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { MapPin, Sparkles, TrendingUp, Zap } from "lucide-react";

import { getDiscoveryFeed } from "@/app/actions/item";
import ItemCard from "@/components/ItemCard";
import TopNav from "@/components/TopNav";
import { getCurrentUser } from "@/lib/auth";
import { localizeHref } from "@/lib/i18n/pathnames";
import prisma from "@/lib/prisma";

export default async function Home() {
  const user = await getCurrentUser();
  const { nearby, popular, deals, userZone } = await getDiscoveryFeed();
  const [locale, t] = await Promise.all([getLocale(), getTranslations("home")]);

  const unreadCount = user
    ? await prisma.notification.count({ where: { userId: user.id, read: false } })
    : 0;

  const discoverHref = localizeHref(locale, "/discover");
  const publishHref = localizeHref(locale, "/publish");

  const EmptyShelf = ({ tone }: { tone: "indigo" | "rose" | "amber" }) => {
    const tones = {
      indigo:
        "border-indigo-100 bg-[linear-gradient(135deg,rgba(36,87,255,0.08),rgba(255,255,255,0.9))]",
      rose:
        "border-rose-100 bg-[linear-gradient(135deg,rgba(255,96,120,0.08),rgba(255,255,255,0.9))]",
      amber:
        "border-amber-100 bg-[linear-gradient(135deg,rgba(245,158,11,0.08),rgba(255,255,255,0.92))]",
    } as const;

    return (
      <div className={`relative overflow-hidden rounded-[28px] border p-5 ${tones[tone]}`}>
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

  const SectionHeader = ({
    icon: Icon,
    title,
    zone,
    color = "text-gray-900",
  }: {
    icon: any;
    title: string;
    zone?: string;
    color?: string;
  }) => (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex flex-col">
        <h3 className={`flex items-center gap-2 text-[17px] font-black tracking-tight ${color}`}>
          <Icon className="h-4 w-4" />
          {title}
        </h3>
        {zone ? (
          <span className="ml-6 mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {zone}
          </span>
    ) : null}
      </div>
      <Link
        href={discoverHref}
        className="capsule-outline px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#2457ff]"
      >
        {t("seeAll")}
      </Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-transparent pb-24 font-sans sm:pb-8">
      <TopNav unreadCount={unreadCount} user={user} />

      <div className="space-y-9 px-5 pt-5">
        <section className="group relative overflow-hidden rounded-[36px] border border-white/70 bg-[#10203a] p-7 shadow-[0_24px_80px_rgba(16,32,58,0.22)] transition-all active:scale-[0.985]">
          <Link href={discoverHref} className="absolute inset-0 z-20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(36,87,255,0.9),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(255,130,90,0.22),_transparent_30%)]" />
          <div className="absolute -right-12 top-8 h-36 w-36 rounded-full border border-white/10 bg-white/8 blur-2xl transition-all duration-700 group-hover:scale-110" />
          <div className="absolute -left-10 bottom-0 h-24 w-40 rounded-full bg-[#ff8e63]/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-7 top-7 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          <div className="relative z-10 flex items-start justify-between gap-5">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white/65">
                {t("newBadge")}
              </span>
              <div className="space-y-2">
                <h2 className="font-display text-[2.2rem] font-bold leading-[0.94] tracking-[-0.05em] text-white">
                  {t("discoverModeTitle")}
                </h2>
                <p className="max-w-[220px] text-sm font-semibold leading-6 text-white/68">
                  {t("discoverModeBody")}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/75">
                <span className="h-2 w-2 rounded-full bg-[#ffb16a]" />
                {userZone ?? t("localMarket")}
              </div>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/15 bg-white/8 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <Sparkles className="h-9 w-9 text-white" />
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-white/70 bg-white/45 p-4 shadow-[0_12px_38px_rgba(16,32,58,0.05)]">
          <SectionHeader
            icon={MapPin}
            title={t("nearbyTitle")}
            zone={userZone}
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

        <section className="rounded-[34px] border border-white/70 bg-white/45 p-4 shadow-[0_12px_38px_rgba(16,32,58,0.05)]">
          <SectionHeader icon={TrendingUp} title={t("popularTitle")} color="text-rose-500" />
          {popular.length > 0 ? (
            <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-4 no-scrollbar">
              {popular.map((item: any, index: number) => (
                <div key={item.id} className="w-[200px] flex-shrink-0">
                  <ItemCard item={item} index={index} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyShelf tone="rose" />
          )}
        </section>

        <section className="rounded-[34px] border border-white/70 bg-white/45 p-4 pb-8 shadow-[0_12px_38px_rgba(16,32,58,0.05)]">
          <SectionHeader icon={Zap} title={t("dealsTitle")} color="text-amber-500" />
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
    </main>
  );
}
