"use client";

import { useLocale, useTranslations } from "next-intl";
import TopNav from "@/components/TopNav";
import ItemCard from "@/components/ItemCard";
import Link from "next/link";
import { Compass, MapPin, SlidersHorizontal, Sparkles } from "lucide-react";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedContainer";
import { localizeHref } from "@/lib/i18n/pathnames";

// Types for props
interface Item {
  id: string;
  title: string;
  imageUrl?: string | null;
  creditValue: number;
  locationZone: string;
  status: string;
  views?: number;
  owner: {
    username: string;
    trustScore: number;
    completionRate: number;
    avgResponseTime: number;
    avgPhotoQuality: number;
    level: number;
    xp: number;
  };

}

interface ExplorePageProps {
  user: any;
  unreadCount: number;
  items: Item[];
}

export default function ExplorePage({ user, unreadCount, items }: ExplorePageProps) {
  const locale = useLocale();
  const t = useTranslations("explorePage");
  const cityLabel = user?.city?.name || t("localMarket");
  const discoverHref = localizeHref(locale, "/discover");

  return (
    <main className="min-h-screen bg-background pb-24 sm:pb-8">
      <TopNav unreadCount={unreadCount} user={user} />

      <div className="mx-auto w-full max-w-md px-standard pt-standard">
        {/* Hero compact */}
        <AnimatedContainer initialY={12} className="mb-8">
          <div className="rounded-[32px] bg-foreground px-6 py-6 text-white shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                  {t("label")}
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                  {t("title")}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {t("body")}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md border border-white/5">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Link
                href={discoverHref}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-slate-50 shadow-sm"
              >
                <Compass className="h-4 w-4" />
                {t("discoverMode")}
              </Link>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-white/80">
                <MapPin className="h-3.5 w-3.5 text-white/40" />
                {cityLabel}
              </div>
            </div>
          </div>
        </AnimatedContainer>

        {/* Filtres sobres */}
        <AnimatedContainer initialY={10} delay={0.05} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {t("availableNow")}
            </h2>

            <button className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 text-xs font-medium text-muted transition hover:border-slate-300 shadow-sm">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t("filters")}
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              t("chips.all"),
              t("chips.nearYou"),
              t("chips.swaps20"),
              t("chips.swaps100"),
              t("chips.swaps300"),
              t("chips.electronics"),
              t("chips.home"),
            ].map(
              (filter, i) => (
                <AnimatedItem key={filter} index={i}>
                  <button
                    className={`whitespace-nowrap rounded-2xl px-5 py-2.5 text-[13px] font-semibold transition shadow-sm ${
                      i === 0
                        ? "bg-foreground text-white"
                        : "border border-border bg-surface text-muted hover:border-slate-300"
                    }`}
                  >
                    {filter}
                  </button>
                </AnimatedItem>
              )
            )}
          </div>
        </AnimatedContainer>

        {/* Grille objets */}
        <section>
          <AnimatedContainer initialY={10} delay={0.1} className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              {t("recentItems")}
            </h3>
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider">
              {t("results", { count: items.length })}
            </p>
          </AnimatedContainer>

          <div className="grid grid-cols-2 gap-4">
            {items.map((item, i) => (
              <div
                key={item.id}
                style={{ animationDelay: `${i * 70}ms` }}
                className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
              >
                <ItemCard item={item} index={i} />
              </div>
            ))}
          </div>
        </section>

        {/* CTA bas de page */}
        <AnimatedContainer initialY={10} delay={0.15} className="mt-10">
          <Link
            href={discoverHref}
            className="flex items-center justify-between rounded-3xl border border-border bg-surface px-6 py-5 shadow-card transition hover:border-slate-300"
          >
            <div>
              <p className="text-[15px] font-semibold text-foreground">
                {t("swipeTitle")}
              </p>
              <p className="mt-1 text-xs text-muted">
                {t("swipeBody")}
              </p>
            </div>

            <div className="rounded-2xl bg-foreground px-5 py-2.5 text-xs font-semibold text-white shadow-sm">
              {t("open")}
            </div>
          </Link>
        </AnimatedContainer>
      </div>
    </main>
  );
}
