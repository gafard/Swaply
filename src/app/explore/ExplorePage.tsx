"use client";

import { useMemo } from "react";
import TopNav from "@/components/TopNav";
import ItemCard from "@/components/ItemCard";
import Link from "next/link";
import { Compass, MapPin, SlidersHorizontal, Sparkles } from "lucide-react";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedContainer";

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
  };
}

interface ExplorePageProps {
  user: any;
  unreadCount: number;
  items: Item[];
}

export default function ExplorePage({ user, unreadCount, items }: ExplorePageProps) {
  return (
    <main className="min-h-screen bg-[#F7F7F5] pb-24 font-sans sm:pb-8">
      <TopNav unreadCount={unreadCount} user={user} />

      <div className="mx-auto w-full max-w-md px-4 pt-4">
        {/* Hero compact */}
        <AnimatedContainer initialY={12} className="mb-6">
          <div className="rounded-[28px] bg-slate-900 px-5 py-5 text-white shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                  Explorer
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                  Trouve un objet près de toi
                </h1>
                <p className="mt-2 text-sm leading-5 text-white/70">
                  Découvre les objets disponibles à Lomé et réserve en quelques secondes.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                <Compass className="h-4 w-4" />
                Mode découverte
              </Link>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80">
                <MapPin className="h-3.5 w-3.5" />
                Lomé
              </div>
            </div>
          </div>
        </AnimatedContainer>

        {/* Filtres sobres */}
        <AnimatedContainer initialY={10} delay={0.05} className="mb-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Disponibles maintenant
            </h2>

            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtres
            </button>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {["Tous", "Près de vous", "20 crédits", "100 crédits", "300 crédits", "Électronique", "Maison"].map(
              (filter, i) => (
                <AnimatedItem key={filter} index={i}>
                  <button
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                      i === 0
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
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
            <h3 className="text-base font-semibold tracking-tight text-slate-900">
              Objets récents
            </h3>
            <p className="text-xs font-medium text-slate-400">
              {items.length} résultats
            </p>
          </AnimatedContainer>

          <div className="grid grid-cols-2 gap-3">
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
        <AnimatedContainer initialY={10} delay={0.15} className="mt-8">
          <Link
            href="/discover"
            className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-slate-300"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Découvrir en swipe
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Parcours rapide des objets autour de toi
              </p>
            </div>

            <div className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white">
              Ouvrir
            </div>
          </Link>
        </AnimatedContainer>
      </div>
    </main>
  );
}
