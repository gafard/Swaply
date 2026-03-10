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
        className="rounded-xl bg-indigo-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-indigo-600"
      >
        {t("seeAll")}
      </Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24 font-sans sm:pb-8">
      <TopNav unreadCount={unreadCount} user={user} />

      <div className="space-y-10 px-5 pt-4">
        <section className="group relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-8 shadow-2xl shadow-indigo-100 transition-all active:scale-[0.98]">
          <Link href={discoverHref} className="absolute inset-0 z-20" />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-all duration-700 group-hover:bg-white/20" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                {t("newBadge")}
              </span>
              <h2 className="text-2xl font-black leading-tight text-white">{t("discoverModeTitle")}</h2>
              <p className="text-xs font-bold text-white/60">{t("discoverModeBody")}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
          </div>
        </section>

        <section>
          <SectionHeader
            icon={MapPin}
            title={t("nearbyTitle")}
            zone={userZone}
            color="text-indigo-600"
          />
          <div className="grid grid-cols-2 gap-4">
            {nearby.slice(0, 4).map((item: any, index: number) => (
              <ItemCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader icon={TrendingUp} title={t("popularTitle")} color="text-rose-500" />
          <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-4 no-scrollbar">
            {popular.map((item: any, index: number) => (
              <div key={item.id} className="w-[200px] flex-shrink-0">
                <ItemCard item={item} index={index} />
              </div>
            ))}
          </div>
        </section>

        <section className="pb-8">
          <SectionHeader icon={Zap} title={t("dealsTitle")} color="text-amber-500" />
          <div className="grid grid-cols-2 gap-4">
            {deals.slice(0, 4).map((item: any, index: number) => (
              <ItemCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
