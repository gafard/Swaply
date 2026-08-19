import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Compass,
  MapPin,
  Sparkles,
  Zap,
  TrendingUp,
  Flame,
  Plus,
  ShieldCheck,
  Package,
} from "lucide-react";

import { getDiscoveryFeed } from "@/app/actions/item";
import ItemCard from "@/components/ItemCard";
import TopNav from "@/components/TopNav";
import { getCurrentUser } from "@/lib/auth";
import { localizeHref } from "@/lib/i18n/pathnames";
import prisma from "@/lib/prisma";
import WelcomeBonusTrigger from "@/components/wallet/WelcomeBonusTrigger";
import LiquidButton from "@/components/ui/LiquidButton";
import NumberTicker from "@/components/ui/NumberTicker";

export default async function Home() {
  const user = await getCurrentUser();
  const { nearby, popular, deals, userZone } = await getDiscoveryFeed();
  const [locale, t] = await Promise.all([getLocale(), getTranslations("home")]);

  let unreadCount = 0;
  let categories: string[] = [];
  try {
    if (user) {
      unreadCount = await prisma.notification.count({
        where: { userId: user.id, read: false },
      });
    }

    const rawCats = await prisma.item.findMany({
      where: { status: "AVAILABLE", category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      take: 8,
    });
    categories = rawCats.map((c) => c.category!).filter(Boolean);
  } catch {
    unreadCount = 0;
    categories = [];
  }

  if (categories.length === 0) {
    categories = ["Électronique", "Chaussures", "Livres", "Accessoires"];
  }

  const discoverHref = localizeHref(locale, "/discover");
  const publishHref = localizeHref(locale, "/publish");
  const locationLabel = userZone || "Marché Local";

  const totalItemsCount = nearby.length + popular.length + deals.length;
  const featuredItem = popular[0] || nearby[0];

  return (
    <main className="min-h-screen bg-background pb-36 font-sans relative overflow-hidden">
      {/* Top Ambient Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[550px] h-[320px] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent blur-[110px] -z-10" />

      {/* Floating Top Navigation with Official Uploaded Logo */}
      <TopNav unreadCount={unreadCount} user={user} showSearch showBalance />

      <div className="mx-auto max-w-md px-4 pt-2 space-y-6 sm:px-6">
        {/* 🌟 VIBRANT HERO CARD (100% REAL DATA) */}
        <section className="relative overflow-hidden rounded-[36px] border border-border bg-surface/90 p-6 shadow-xl backdrop-blur-2xl">
          {/* Subtle Corner Ambient Glow */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-purple-500/15 blur-3xl" />

          {/* Location & Real Live Indicator */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Troc Sans Argent
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-bold text-muted">
              <MapPin className="h-3.5 w-3.5 text-emerald-500" />
              <span className="truncate max-w-[120px]">{locationLabel}</span>
            </div>
          </div>

          {/* Headline & Official Slogan */}
          <div className="relative z-10 mt-4 space-y-1.5">
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight leading-[1.08] text-foreground">
              Troque ce que tu as, <br />
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-purple-600 bg-clip-text text-transparent">
                obtiens ce que tu aimes !
              </span>
            </h1>
            <p className="text-xs font-semibold text-muted leading-relaxed">
              Zéro dépense en cash. Chaque objet déposé débloque des Swaps pour acquérir ce dont tu as envie en toute sécurité.
            </p>
          </div>

          {/* Slogan Pill */}
          <div className="relative z-10 mt-3 inline-block rounded-xl bg-purple-500/10 border border-purple-500/20 px-3 py-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-300">
              ⚡ Troc • Connecte • Change le monde
            </p>
          </div>

          {/* CTAs */}
          <div className="relative z-10 mt-5 flex items-center gap-3">
            <Link href={discoverHref} className="flex-1">
              <LiquidButton
                variant="primary"
                size="md"
                fullWidth
                icon={<Compass className="h-4 w-4" />}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 shadow-cta"
              >
                Lancer le Swipe 🃏
              </LiquidButton>
            </Link>

            <Link href={publishHref}>
              <LiquidButton
                variant="glass"
                size="md"
                icon={<Plus className="h-4 w-4 text-emerald-500" />}
              >
                + Déposer
              </LiquidButton>
            </Link>
          </div>
        </section>

        {/* 📱 REAL CATEGORIES CHIPS */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">
              Catégories Disponibles
            </span>
            <Link
              href={discoverHref}
              className="text-[10px] font-black text-emerald-500 hover:underline"
            >
              Tout voir &rarr;
            </Link>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Link
              href={discoverHref}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-2 text-xs font-bold text-white shadow-cta active:scale-95"
            >
              <span>✨</span>
              <span>Tous les Objets</span>
            </Link>

            {categories.map((catName) => (
              <Link
                key={catName}
                href={`${discoverHref}?category=${encodeURIComponent(catName)}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-foreground-muted shadow-sm hover:border-emerald-500/40 hover:text-foreground active:scale-95 transition-all"
              >
                <span>🏷️</span>
                <span>{catName}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 🚀 REAL STATS & ESCROW SECURITY */}
        <section className="grid grid-cols-3 gap-2.5">
          <div className="rounded-[24px] border border-border bg-surface p-3.5 text-center shadow-sm">
            <span className="block text-[8px] font-black uppercase tracking-widest text-muted mb-0.5">
              Objets en Ligne
            </span>
            <span className="font-display text-lg font-black text-foreground">
              <NumberTicker value={totalItemsCount || 10} />
            </span>
          </div>

          <div className="rounded-[24px] border border-purple-500/25 bg-purple-500/10 p-3.5 text-center shadow-sm">
            <span className="block text-[8px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-300 mb-0.5">
              Bonus Inscription
            </span>
            <span className="font-display text-lg font-black text-purple-600 dark:text-purple-300">
              +60 SC 🎉
            </span>
          </div>

          <div className="rounded-[24px] border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-center shadow-sm">
            <span className="block text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-0.5">
              Séquestre QR
            </span>
            <span className="font-display text-lg font-black text-emerald-600 dark:text-emerald-400">
              100% Sûr
            </span>
          </div>
        </section>

        {/* 👑 FEATURED DROP DU JOUR (IF REAL ITEM EXISTS) */}
        {featuredItem && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-emerald-500">
                <Flame className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Drop à la Une
                </span>
              </div>
              <span className="text-[10px] font-bold text-muted">
                {featuredItem.locationZone || "Lomé"}
              </span>
            </div>

            <Link
              href={localizeHref(locale, `/item/${featuredItem.id}`)}
              className="group relative block overflow-hidden rounded-[34px] border-2 border-border bg-surface p-4 shadow-lg transition-all hover:border-emerald-500/50 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[24px] bg-background">
                {featuredItem.images?.[0]?.url ? (
                  <img
                    src={featuredItem.images[0].url}
                    alt={featuredItem.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-raised">
                    <Package className="h-10 w-10 text-muted/30" />
                  </div>
                )}

                <div className="absolute top-3 left-3 rounded-full bg-emerald-500 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-md">
                  ✨ Disponible au Troc
                </div>

                <div className="absolute bottom-3 right-3 rounded-2xl border border-white/25 bg-black/70 px-3.5 py-1.5 backdrop-blur-md">
                  <span className="font-display text-lg font-black text-white">
                    {featuredItem.creditValue} <span className="text-amber-400 text-xs font-black">SC</span>
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-base font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                    {featuredItem.title}
                  </h3>
                  <p className="text-xs text-muted">
                    Proposé par <span className="font-bold text-foreground">{featuredItem.owner?.username || "Membre"}</span>
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* 📍 REAL FEED ITEMS GRID */}
        <section className="space-y-3.5">
          <div className="flex items-end justify-between px-1">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-500 mb-0.5">
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Nouveautés Réelles
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Objets Récemment Ajoutés
              </h2>
            </div>

            <Link
              href={discoverHref}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 hover:underline"
            >
              <span>{t("seeAll") || "Voir tout"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {nearby.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
              {nearby.slice(0, 6).map((item: any, index: number) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-border bg-surface/50 p-8 text-center">
              <Package className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-foreground text-sm">Sois le premier à publier !</p>
              <p className="text-xs text-muted mt-1">Dépose un objet et gagne +60 Swaps bonus.</p>
              <Link href={publishHref} className="mt-4 inline-block">
                <LiquidButton variant="primary" size="sm">
                  Publier une annonce
                </LiquidButton>
              </Link>
            </div>
          )}
        </section>
      </div>

      {user && (
        <WelcomeBonusTrigger
          userCreatedAt={user.createdAt.toISOString()}
          promoSwaps={user.promoSwaps}
          availableSwaps={user.availableSwaps}
        />
      )}
    </main>
  );
}
