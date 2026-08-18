"use client";

import { useLocale, useTranslations } from "next-intl";
import TopNav from "@/components/TopNav";
import ItemCard from "@/components/ItemCard";
import Link from "next/link";
import { Compass, MapPin, SlidersHorizontal, Sparkles, Zap, Flame, ShieldCheck } from "lucide-react";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedContainer";
import { localizeHref } from "@/lib/i18n/pathnames";
import { useState } from "react";
import LiquidButton from "@/components/ui/LiquidButton";
import HoloBadge from "@/components/ui/HoloBadge";

interface Item {
  id: string;
  title: string;
  images?: Array<{ url: string; order?: number }> | null;
  imageUrl?: string | null;
  creditValue: number;
  locationZone: string;
  status: string;
  views?: number;
  favoritesCount?: number;
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
  const [activeCategory, setActiveCategory] = useState(0);
  const cityLabel = user?.city?.name || t("localMarket");
  const discoverHref = localizeHref(locale, "/discover");

  const categories = [
    { label: t("chips.all"), icon: Flame },
    { label: t("chips.nearYou"), icon: MapPin },
    { label: t("chips.electronics"), icon: Zap },
    { label: t("chips.home"), icon: Sparkles },
    { label: t("chips.swaps20"), icon: ShieldCheck },
  ];

  return (
    <main className="min-h-screen bg-background pb-32 sm:pb-12">
      <TopNav unreadCount={unreadCount} user={user} showSearch />

      <div className="mx-auto w-full max-w-md px-4 pt-2 sm:px-6">
        {/* Dynamic Hero Banner */}
        <AnimatedContainer initialY={12} className="mb-6">
          <div className="relative overflow-hidden rounded-[32px] border border-border bg-gradient-to-br from-surface via-surface-raised to-primary/5 p-6 shadow-lg">
            {/* Ambient Lighting Orbs */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-amber-500/15 blur-3xl" />

            <div className="relative z-10 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <HoloBadge variant="primary" size="sm">
                    {t("label")}
                  </HoloBadge>
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-muted">
                    <MapPin className="h-3 w-3 text-primary" />
                    <span>{cityLabel}</span>
                  </div>
                </div>

                <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl leading-tight">
                  {t("title")}
                </h1>
                <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                  {t("body")}
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>

            <div className="relative z-10 mt-5 flex items-center gap-3">
              <Link href={discoverHref} className="flex-1">
                <LiquidButton variant="primary" size="md" fullWidth icon={<Compass className="h-4 w-4" />}>
                  {t("discoverMode")}
                </LiquidButton>
              </Link>

              <Link href={localizeHref(locale, "/publish")}>
                <LiquidButton variant="glass" size="md">
                  + Déposer
                </LiquidButton>
              </Link>
            </div>
          </div>
        </AnimatedContainer>

        {/* Category Filter Pills */}
        <AnimatedContainer initialY={10} delay={0.05} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-bold text-foreground">
              {t("availableNow")}
            </h2>

            <span className="text-[10px] font-black uppercase tracking-wider text-muted">
              {t("results", { count: items.length })}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              const isActive = activeCategory === i;
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(i)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                    isActive
                      ? "bg-primary text-white shadow-cta scale-[1.02]"
                      : "border border-border bg-surface text-foreground-muted hover:border-border-focus hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </AnimatedContainer>

        {/* Items Grid */}
        <section>
          {items.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-border bg-surface/50 p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="font-bold text-foreground">Aucun objet pour le moment</p>
              <p className="mt-1 text-xs text-muted">Soyez le premier à publier dans votre zone !</p>
              <Link href={localizeHref(locale, "/publish")} className="mt-4 inline-block">
                <LiquidButton variant="primary" size="sm">
                  Publier une annonce
                </LiquidButton>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
                >
                  <ItemCard
                    item={{
                      ...item,
                      images: item.images || (item.imageUrl ? [{ url: item.imageUrl }] : []),
                    }}
                    index={i}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Discover Swipe Callout */}
        <AnimatedContainer initialY={10} delay={0.15} className="mt-8">
          <Link
            href={discoverHref}
            className="group flex items-center justify-between rounded-[28px] border border-border bg-gradient-to-r from-surface via-surface-raised to-primary/10 p-5 shadow-md transition-all hover:border-primary/40 hover:shadow-lg"
          >
            <div>
              <span className="block text-[9px] font-black uppercase tracking-widest text-primary">
                Mode Swiper
              </span>
              <p className="font-display text-base font-bold text-foreground mt-0.5">
                {t("swipeTitle")}
              </p>
              <p className="mt-1 text-xs text-muted line-clamp-1">
                {t("swipeBody")}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-cta transition-transform group-hover:scale-110">
              <Compass className="h-5 w-5" />
            </div>
          </Link>
        </AnimatedContainer>
      </div>
    </main>
  );
}
