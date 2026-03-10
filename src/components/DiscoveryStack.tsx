"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DiscoveryCard from "@/components/DiscoveryCard";
import { reserveItem } from "@/app/actions/exchange";
import { toggleSaveItem } from "@/app/actions/item";
import {
  CheckCircle2,
  Heart,
  MessageSquare,
  RefreshCw,
  X,
  MapPin,
  Star,
} from "lucide-react";
import Link from "next/link";

interface Item {
  id: string;
  title: string;
  imageUrl?: string | null;
  creditValue: number;
  locationZone: string;
  owner: {
    username: string;
    trustScore: number;
  };
}

export default function DiscoveryStack({
  items: initialItems,
}: {
  items: Item[];
}) {
  const [items] = useState(initialItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toast, setToast] = useState<{
    show: boolean;
    text: string;
    type: "RESERVE" | "SAVE";
    exchangeId?: string;
  }>({
    show: false,
    text: "",
    type: "SAVE",
  });

  const currentItem = items[currentIndex];

  const handleSwipeRight = async () => {
    if (!currentItem) return;

    try {
      const result = await reserveItem(currentItem.id);
      setToast({
        show: true,
        text: "Objet réservé",
        type: "RESERVE",
        exchangeId: result.id,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors de la réservation");
    }
  };

  const handleSave = async () => {
    if (!currentItem) return;

    try {
      const { saved } = await toggleSaveItem(currentItem.id);
      setToast({
        show: true,
        text: saved ? "Ajouté aux favoris" : "Retiré des favoris",
        type: "SAVE",
      });

      setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 1800);
    } catch {
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleSwipeLeft = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  if (currentIndex >= items.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center px-8 text-center"
      >
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <RefreshCw className="h-7 w-7 text-slate-500" />
        </div>

        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Plus d’objets pour le moment
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Reviens plus tard pour découvrir de nouveaux objets disponibles près de toi.
        </p>

        <Link
          href="/"
          className="mt-8 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Retour à l’accueil
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col px-standard pb-12 pt-6 bg-background">
      <header className="flex items-center justify-between mb-10 px-1">
        <div className="space-y-0.5">
          <h1 className="text-xl font-semibold text-foreground tracking-tight leading-tight">
            Découverte
          </h1>
          <div className="flex items-center gap-1.5 opacity-60">
             <MapPin className="w-3.5 h-3.5 text-primary" />
             <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Lomé, Togo</span>
          </div>
        </div>

        <div className="px-4 py-2 bg-foreground rounded-full shadow-card border border-white/5">
           <p className="text-[11px] font-bold text-white uppercase tracking-wider whitespace-nowrap">
             {currentIndex + 1} <span className="text-white/30">/</span> {items.length} <span className="ml-1 opacity-50 text-[10px] font-medium uppercase tracking-tight">objets</span>
           </p>
        </div>
      </header>

      <div className="relative flex-1">
        <AnimatePresence>
          {items
            .slice(currentIndex, currentIndex + 2)
            .reverse()
            .map((item, index, arr) => {
              const isFront = index === arr.length - 1;
              return (
                <DiscoveryCard
                  key={item.id}
                  item={item}
                  isFront={isFront}
                  onSwipeRight={handleSwipeRight}
                  onSwipeLeft={handleSwipeLeft}
                />
              );
            })}
        </AnimatePresence>
      </div>

      {/* Style C Actions (❌ ⭐ 💬) - Sized for mobile thumbs */}
      <div className="relative z-50 mt-12 flex items-center justify-center gap-8">
        <button
          onClick={handleSwipeLeft}
          className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-muted border border-border shadow-card transition-all active:scale-95 hover:bg-rose-50 hover:text-danger hover:border-rose-100"
          aria-label="Passer"
        >
          <X className="h-6 w-6 transition-transform group-hover:rotate-90 duration-500" />
        </button>

        <button
          onClick={handleSave}
          className="group flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-3xl bg-primary text-white shadow-cta transition-all active:scale-95 hover:bg-blue-700"
          aria-label="Sauvegarder"
        >
          <Star className="h-7 w-7 transition-transform group-hover:scale-110 duration-500" />
        </button>

        <button
          onClick={handleSwipeRight}
          className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-muted border border-border shadow-card transition-all active:scale-95 hover:bg-emerald-50 hover:text-success hover:border-emerald-100"
          aria-label="Réserver"
        >
          <MessageSquare className="h-6 w-6 transition-all group-hover:scale-110" />
        </button>
      </div>

      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="pointer-events-none absolute inset-x-4 bottom-28 z-[60] flex justify-center"
          >
            <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-popup">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{toast.text}</span>

                {toast.type === "RESERVE" && toast.exchangeId && (
                  <Link
                    href={`/exchange/${toast.exchangeId}`}
                    className="mt-0.5 text-xs font-semibold text-primary hover:underline underline-offset-2"
                  >
                    Aller au chat
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}