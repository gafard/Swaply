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
  Heart,
  Gift,
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

  const categories = [
    { label: "Tout voir", icon: "✨", filter: "all" },
    { label: "Tech & Geek", icon: "📱", filter: "tech" },
    { label: "Sneakers & Mode", icon: "👟", filter: "fashion" },
    { label: "Gaming", icon: "🎮", filter: "gaming" },
    { label: "Maison & Déco", icon: "🌿", filter: "home" },
  ];

  return (
    <main className="min-h-screen bg-background pb-36 font-sans relative overflow-hidden">
      {/* Dynamic Colored Mesh Glow */}
      <div className="pointer-events-none absolute -top-20 left-1/4 w-[400px] h-[300px] bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-transparent blur-[100px] -z-10" />
      <div className="pointer-events-none absolute top-40 right-0 w-[350px] h-[300px] bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-transparent blur-[100px] -z-10" />

      {/* Top Floating Header */}
      <TopNav unreadCount={unreadCount} user={user} showSearch showBalance />

      <div className="mx-auto max-w-md px-4 pt-2 space-y-6 sm:px-6">
        {/* 🎉 VIBRANT HERO CARD */}
        <section className="relative overflow-hidden rounded-[36px] border border-border bg-gradient-to-br from-surface via-surface to-emerald-500/5 p-6 shadow-xl backdrop-blur-2xl">
          {/* Confetti & Decorative Glow Dots */}
          <div className="pointer-events-none absolute right-4 top-4 flex gap-1">
            <span className="h-2 w-2 rounded-full bg-pink-500 opacity-60 animate-ping" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-80" />
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 opacity-70" />
          </div>

          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              TROC SANS ARGENT
            </div>

            <div className="flex items-center gap-1 text-[10px] font-bold text-muted">
              <MapPin className="h-3.5 w-3.5 text-emerald-500" />
              <span className="truncate max-w-[110px]">{locationLabel}</span>
            </div>
          </div>

          {/* Headline & Slogan */}
          <div className="relative z-10 mt-4 space-y-1.5">
            <h1 className="font-display text-3xl font-black tracking-tight leading-[1.08] text-foreground">
              Troque ce que tu as, <br />
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-purple-600 bg-clip-text text-transparent">
                obtiens ce que tu aimes !
              </span>
            </h1>
            <p className="text-xs font-semibold text-muted leading-relaxed">
              Zéro dépense en cash. Chaque objet débloque des Swaps pour acquérir ce dont tu as envie.
            </p>
          </div>

          {/* Slogan Pill */}
          <div className="relative z-10 mt-3.5 inline-block rounded-xl bg-purple-500/10 border border-purple-500/20 px-3 py-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-300">
              ⚡ Troc. Connecte. Change le monde.
            </p>
          </div>

          {/* Big Action Buttons */}
          <div className="relative z-10 mt-5 flex items-center gap-3">
            <Link href={discoverHref} className="flex-1">
              <LiquidButton
                variant="primary"
                size="md"
                fullWidth
                icon={<Compass className="h-4 w-4" />}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 shadow-cta"
              >
                Lancer le Swipe 🚀
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

        {/* 🎮 CATEGORY PILLS */}
        <section className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat, i) => (
            <Link
              key={cat.label}
              href={`${discoverHref}?cat=${cat.filter}`}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all shadow-sm active:scale-95 ${
                i === 0
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-cta"
                  : "border border-border bg-surface text-foreground-muted hover:border-emerald-500/40 hover:text-foreground"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </Link>
          ))}
        </section>

        {/* 🚀 QUICK STATS & WELCOME BONUS */}
        <section className="grid grid-cols-3 gap-2.5">
          <div className="rounded-[24px] border border-border bg-surface p-3.5 text-center shadow-sm">
            <span className="block text-[8px] font-black uppercase tracking-widest text-muted mb-0.5">
              Objets en Ligne
            </span>
            <span className="font-display text-lg font-black text-foreground">
              <NumberTicker value={nearby.length + popular.length + deals.length || 10} />
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
              Échange Sécurisé
            </span>
            <span className="font-display text-lg font-black text-emerald-600 dark:text-emerald-400">
              QR Handshake
            </span>
          </div>
        </section>

        {/* 📍 SECTION 1 : NOUVEAUX DROPS */}
        <section className="space-y-3.5">
          <div className="flex items-end justify-between px-1">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-500 mb-0.5">
                <Flame className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {t("nearbyTitle") || "Près de chez toi"}
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Nouveautés en Direct
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
              {nearby.slice(0, 4).map((item: any, index: number) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-border bg-surface/50 p-8 text-center">
              <Sparkles className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-foreground text-sm">Soyez le premier !</p>
              <p className="text-xs text-muted mt-1">Dépose un objet pour gagner 60 Swaps bonus.</p>
              <Link href={publishHref} className="mt-4 inline-block">
                <LiquidButton variant="primary" size="sm">
                  Publier une annonce
                </LiquidButton>
              </Link>
            </div>
          )}
        </section>

        {/* 💎 SECTION 2 : TENDANCES & POPULAIRES */}
        {popular.length > 0 && (
          <section className="space-y-3.5">
            <div className="flex items-end justify-between px-1">
              <div>
                <div className="flex items-center gap-1.5 text-purple-500 mb-0.5">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {t("popularTitle") || "Les plus recherchés"}
                  </span>
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Coups de Cœur 🔥
                </h2>
              </div>
            </div>

            <div className="-mx-4 flex gap-3.5 overflow-x-auto px-4 pb-2 no-scrollbar [scroll-snap-type:x_mandatory]">
              {popular.map((item: any, index: number) => (
                <div key={item.id} className="w-[195px] flex-shrink-0 snap-start">
                  <ItemCard item={item} index={index} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ⚡ SECTION 3 : ÉCHANGES RECOMMANDÉS */}
        {deals.length > 0 && (
          <section className="space-y-3.5">
            <div className="flex items-end justify-between px-1">
              <div>
                <div className="flex items-center gap-1.5 text-amber-500 mb-0.5">
                  <Zap className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {t("dealsTitle") || "Bonnes affaires"}
                  </span>
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Swaps Recommandés ✨
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
            className="group relative flex items-center justify-between overflow-hidden rounded-[32px] border border-border bg-gradient-to-r from-surface via-surface-raised to-emerald-500/10 p-5 shadow-lg transition-all hover:border-emerald-500/40 hover:shadow-xl"
          >
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Mode Swiper 2.0
              </span>
              <h3 className="font-display text-lg font-bold text-foreground mt-1">
                Glisse pour matcher tes Swaps ! 🃏
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Tape à gauche/droite pour voir toutes les photos.
              </p>
            </div>

            <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-cta transition-transform group-hover:scale-110">
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
