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
  ShieldCheck,
  Search,
  Plus,
} from "lucide-react";

import { getDiscoveryFeed } from "@/app/actions/item";
import ItemCard from "@/components/ItemCard";
import TopNav from "@/components/TopNav";
import { getCurrentUser } from "@/lib/auth";
import { localizeHref } from "@/lib/i18n/pathnames";
import prisma from "@/lib/prisma";
import WelcomeBonusTrigger from "@/components/wallet/WelcomeBonusTrigger";
import LiquidButton from "@/components/ui/LiquidButton";
import HoloBadge from "@/components/ui/HoloBadge";
import SpotlightCard from "@/components/ui/SpotlightCard";
import NumberTicker from "@/components/ui/NumberTicker";

export default async function Home() {
  const user = await getCurrentUser();
  const { nearby, popular, deals, userZone } = await getDiscoveryFeed();
  const [locale, t] = await Promise.all([getLocale(), getTranslations("home")]);

  let unreadCount = 0;
  try {
    if (user) {
      unreadCount = await prisma.notification.count({
        where: { userId: user.id, read: false },
      });
    }
  } catch {
    unreadCount = 0;
  }

  const discoverHref = localizeHref(locale, "/discover");
  const publishHref = localizeHref(locale, "/publish");
  const locationLabel = userZone || "Marché Local";

  return (
    <main className="min-h-screen bg-background pb-36 font-sans relative overflow-hidden">
      {/* Top Ambient Glow Orb */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-primary/25 via-indigo-500/15 to-transparent blur-[120px] -z-10" />

      {/* Floating Top Navigation */}
      <TopNav unreadCount={unreadCount} user={user} showSearch showBalance />

      <div className="mx-auto max-w-md px-4 pt-3 space-y-7 sm:px-6">
        {/* 🌟 ACETERNITY-STYLE HERO PULSE */}
        <section className="relative overflow-hidden rounded-[36px] border border-border bg-surface/85 p-6 shadow-xl backdrop-blur-2xl">
          {/* Subtle Corner Light Refraction */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-amber-500/15 blur-3xl" />

          {/* Live Swappers Radar Pill */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Marché Actif
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-bold text-muted">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="truncate max-w-[120px]">{locationLabel}</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="relative z-10 mt-5 space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight leading-[1.05] text-foreground">
              Le Troc <span className="text-gradient-primary">Sans Argent.</span>
            </h1>
            <p className="text-xs font-medium text-foreground-muted leading-relaxed max-w-xs">
              Échangez vos objets du quotidien en toute sécurité grâce au séquestre de Swaps et au QR Code sécurisé.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="relative z-10 mt-6 flex items-center gap-3">
            <Link href={discoverHref} className="flex-1">
              <LiquidButton
                variant="primary"
                size="md"
                fullWidth
                icon={<Compass className="h-4 w-4" />}
              >
                {t("heroPrimary") || "Découvrir (Swipe)"}
              </LiquidButton>
            </Link>

            <Link href={publishHref}>
              <LiquidButton
                variant="glass"
                size="md"
                icon={<Plus className="h-4 w-4" />}
              >
                {t("heroSecondary") || "Déposer"}
              </LiquidButton>
            </Link>
          </div>
        </section>

        {/* 🚀 QUICK STATS PULSE BAR */}
        <section className="grid grid-cols-3 gap-2.5">
          <div className="rounded-[24px] border border-border bg-surface/70 p-3.5 text-center backdrop-blur-md shadow-sm">
            <span className="block text-[8px] font-black uppercase tracking-widest text-muted mb-0.5">
              Objets
            </span>
            <span className="font-display text-lg font-bold text-foreground">
              <NumberTicker value={nearby.length + popular.length + deals.length || 10} />
            </span>
          </div>

          <div className="rounded-[24px] border border-amber-500/25 bg-amber-500/10 p-3.5 text-center backdrop-blur-md shadow-sm">
            <span className="block text-[8px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-0.5">
              Bonus Déposé
            </span>
            <span className="font-display text-lg font-bold text-amber-600 dark:text-amber-400">
              +60 SC
            </span>
          </div>

          <div className="rounded-[24px] border border-success/25 bg-success/10 p-3.5 text-center backdrop-blur-md shadow-sm">
            <span className="block text-[8px] font-black uppercase tracking-widest text-success mb-0.5">
              Escrow QR
            </span>
            <span className="font-display text-lg font-bold text-success">
              100% Sûr
            </span>
          </div>
        </section>

        {/* 📍 SECTION 1 : DROPS PROCHES (NEARBY) */}
        <section className="space-y-4">
          <div className="flex items-end justify-between px-1">
            <div>
              <div className="flex items-center gap-1.5 text-primary mb-1">
                <Flame className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {t("nearbyTitle") || "Autour de vous"}
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Nouveaux Drops
              </h2>
            </div>

            <Link
              href={discoverHref}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline underline-offset-4"
            >
              <span>{t("seeAll") || "Explorer"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {nearby.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
              {nearby.slice(0, 4).map((item: any, index: number) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-border bg-surface/40 p-8 text-center">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-2 opacity-50" />
              <p className="font-bold text-foreground text-sm">Soyez le premier !</p>
              <p className="text-xs text-muted mt-1">Déposez un objet pour gagner 60 Swaps bonus.</p>
              <Link href={publishHref} className="mt-4 inline-block">
                <LiquidButton variant="primary" size="sm">
                  Publier une annonce
                </LiquidButton>
              </Link>
            </div>
          )}
        </section>

        {/* 💎 SECTION 2 : TENDANCES POPULAIRES (POPULAR) */}
        {popular.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between px-1">
              <div>
                <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {t("popularTitle") || "Les plus désirés"}
                  </span>
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Tendances & Raretés
                </h2>
              </div>
            </div>

            <div className="-mx-4 flex gap-3.5 overflow-x-auto px-4 pb-2 no-scrollbar [scroll-snap-type:x_mandatory]">
              {popular.map((item: any, index: number) => (
                <div key={item.id} className="w-[200px] flex-shrink-0 snap-start">
                  <ItemCard item={item} index={index} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ⚡ SECTION 3 : MEILLEURES OPPORTUNITÉS (DEALS) */}
        {deals.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between px-1">
              <div>
                <div className="flex items-center gap-1.5 text-success mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {t("dealsTitle") || "Échanges Recommandés"}
                  </span>
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Vendeurs de Confiance
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
              {deals.slice(0, 4).map((item: any, index: number) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* 🃏 SWIPE DISCOVERY CALLOUT */}
        <section className="pt-2">
          <Link
            href={discoverHref}
            className="group relative flex items-center justify-between overflow-hidden rounded-[32px] border border-border bg-gradient-to-r from-surface via-surface-raised to-primary/10 p-5 shadow-lg transition-all hover:border-primary/40 hover:shadow-xl"
          >
            {/* Corner ambient orb */}
            <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-primary/20 blur-2xl" />

            <div className="relative z-10">
              <HoloBadge variant="primary" size="sm">
                Mode Swiper
              </HoloBadge>
              <h3 className="font-display text-lg font-bold text-foreground mt-2">
                Glissez pour trouver votre Swap
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Cartes plein écran, prévisualisation multi-photos au tap.
              </p>
            </div>

            <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-cta transition-transform group-hover:scale-110">
              <Compass className="h-6 w-6" />
            </div>
          </Link>
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
