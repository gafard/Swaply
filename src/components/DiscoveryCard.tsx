"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { MapPin, Package, Star, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import HoloBadge from "@/components/ui/HoloBadge";

interface Item {
  id: string;
  title: string;
  imageUrl?: string | null;
  images?: Array<{ url: string; order?: number; orderIndex?: number }> | null;
  creditValue: number;
  locationZone: string;
  owner: {
    username: string;
    trustScore: number;
  };
}

interface Props {
  item: Item;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  isFront: boolean;
}

export default function DiscoveryCard({ item, onSwipeRight, onSwipeLeft, isFront }: Props) {
  const t = useTranslations("discoveryCard");
  const [photoIndex, setPhotoIndex] = useState(0);

  const rawImages = item.images && item.images.length > 0
    ? item.images.map((img) => img.url)
    : item.imageUrl
      ? [item.imageUrl]
      : [];
  const photos = rawImages.length > 0 ? rawImages : [""];

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-10, 0, 10]);
  const y = useTransform(x, [-200, 0, 200], [12, 0, 12]);
  const scale = useTransform(x, [-200, 0, 200], [1.02, 1, 1.02]);
  
  // Stickers opacity & scale
  const reserveOpacity = useTransform(x, [20, 120], [0, 1]);
  const reserveScale = useTransform(x, [20, 120], [0.8, 1.1]);
  const skipOpacity = useTransform(x, [-120, -20], [1, 0]);
  const skipScale = useTransform(x, [-120, -20], [1.1, 0.8]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 110;
    if (info.offset.x > threshold || info.velocity.x > 500) {
      onSwipeRight();
      return;
    }
    if (info.offset.x < -threshold || info.velocity.x < -500) {
      onSwipeLeft();
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length > 1) {
      setPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length > 1) {
      setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const currentPhoto = photos[photoIndex];

  if (!isFront) {
    return (
      <div className="absolute inset-x-2 inset-y-3 translate-y-3 scale-[0.96] overflow-hidden rounded-[36px] border border-border bg-surface shadow-md">
        {currentPhoto ? (
          <img src={currentPhoto} alt="" className="h-full w-full object-cover opacity-50 blur-[0.6px]" />
        ) : (
          <div className="flex h-full items-center justify-center bg-background/80">
            <Package className="h-10 w-10 text-muted/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>
    );
  }

  return (
    <motion.div
      style={{ x, y, rotate, scale }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: "grabbing" }}
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        x: x.get() >= 0 ? 650 : -650,
        opacity: 0,
        rotate: x.get() >= 0 ? 15 : -15,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 26, mass: 0.8 }}
      className="absolute inset-0 overflow-hidden rounded-[38px] border border-border bg-surface shadow-lg select-none"
    >
      {/* Dynamic Gesture Stickers */}
      <motion.div
        style={{ opacity: reserveOpacity, scale: reserveScale }}
        className="absolute left-6 top-8 z-40 rounded-2xl border-2 border-emerald-400 bg-emerald-500/90 px-5 py-2.5 text-base font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-xl rotate-[-12deg]"
      >
        ✨ SWAP !
      </motion.div>

      <motion.div
        style={{ opacity: skipOpacity, scale: skipScale }}
        className="absolute right-6 top-8 z-40 rounded-2xl border-2 border-rose-400 bg-rose-500/90 px-5 py-2.5 text-base font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-xl rotate-[12deg]"
      >
        PASSER ✕
      </motion.div>

      {/* Main Image Container */}
      <div className="relative h-full w-full bg-background overflow-hidden">
        {currentPhoto ? (
          <img
            src={currentPhoto}
            alt={item.title}
            className="h-full w-full object-cover pointer-events-none select-none"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <Package className="h-20 w-20 opacity-20" />
          </div>
        )}

        {/* Ambient Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />

        {/* Story-style Segmented Photo Progress Bar */}
        {photos.length > 1 && (
          <div className="absolute inset-x-4 top-3 z-30 flex items-center gap-1.5">
            {photos.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                  idx === photoIndex ? "bg-white shadow-sm" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        )}

        {/* Invisible Tap Zones for Photo Navigation */}
        {photos.length > 1 && (
          <div className="absolute inset-x-0 top-12 bottom-36 z-20 flex">
            <div
              onClick={handlePrevPhoto}
              className="flex-1 h-full cursor-pointer active:bg-white/5 transition-colors"
            />
            <div
              onClick={handleNextPhoto}
              className="flex-1 h-full cursor-pointer active:bg-white/5 transition-colors"
            />
          </div>
        )}

        {/* Top Header Card Info (Zone & Seller Badge) */}
        <div className="absolute inset-x-4 top-6 z-30 flex items-center justify-between gap-3 pointer-events-none">
          <div className="flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-xl">
            <MapPin className="h-3 w-3 text-primary" />
            <span>{item.locationZone || t("nearby")}</span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur-xl">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/80 text-[10px] font-black text-white">
              {item.owner.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black uppercase text-white">
                {item.owner.username}
              </span>
              <div className="flex items-center gap-0.5 text-amber-400">
                <Star className="h-2.5 w-2.5 fill-amber-400" />
                <span className="text-[9px] font-black">{item.owner.trustScore}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Floating Info Cockpit */}
        <div className="absolute inset-x-4 bottom-4 z-30 pointer-events-none">
          <div className="rounded-[30px] border border-white/20 bg-black/55 p-5 backdrop-blur-2xl shadow-lg">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary">
                  <Sparkles className="h-3 w-3" />
                  Objet vérifié
                </span>
                <h2 className="mt-1 line-clamp-2 font-display text-2xl font-bold leading-tight tracking-tight text-white">
                  {item.title}
                </h2>
              </div>

              {/* Swaps Price Pill */}
              <div className="shrink-0 rounded-[22px] border border-white/25 bg-gradient-to-br from-white/20 to-white/5 px-4 py-3 text-right backdrop-blur-md shadow-md">
                <span className="block text-[8px] font-black uppercase tracking-widest text-white/70">
                  Valeur
                </span>
                <div className="mt-0.5 flex items-baseline justify-end gap-1">
                  <span className="font-display text-2xl font-black text-white leading-none">
                    {item.creditValue}
                  </span>
                  <span className="text-[10px] font-black uppercase text-amber-400">
                    SC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
