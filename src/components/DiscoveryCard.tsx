"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { MapPin, Package, Star, Sparkles } from "lucide-react";

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
  const y = useTransform(x, [-200, 0, 200], [10, 0, 10]);
  const scale = useTransform(x, [-200, 0, 200], [1.02, 1, 1.02]);
  
  // Stickers opacity & scale
  const reserveOpacity = useTransform(x, [20, 120], [0, 1]);
  const reserveScale = useTransform(x, [20, 120], [0.8, 1.15]);
  const skipOpacity = useTransform(x, [-120, -20], [1, 0]);
  const skipScale = useTransform(x, [-120, -20], [1.15, 0.8]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 100;
    if (info.offset.x > threshold || info.velocity.x > 450) {
      onSwipeRight();
      return;
    }
    if (info.offset.x < -threshold || info.velocity.x < -450) {
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
      <div className="absolute inset-x-1.5 inset-y-2 translate-y-2 scale-[0.97] overflow-hidden rounded-[32px] border border-border bg-surface shadow-md">
        {currentPhoto ? (
          <img src={currentPhoto} alt="" className="h-full w-full object-cover opacity-60 blur-[0.4px]" />
        ) : (
          <div className="flex h-full items-center justify-center bg-background/80">
            <Package className="h-10 w-10 text-muted/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30" />
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
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        x: x.get() >= 0 ? 600 : -600,
        opacity: 0,
        rotate: x.get() >= 0 ? 14 : -14,
        transition: { duration: 0.22, ease: "easeOut" },
      }}
      transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
      className="absolute inset-0 overflow-hidden rounded-[34px] border-2 border-border bg-surface shadow-xl select-none"
    >
      {/* Dynamic Gesture Stickers */}
      <motion.div
        style={{ opacity: reserveOpacity, scale: reserveScale }}
        className="absolute left-4 top-6 z-40 rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-xl rotate-[-12deg]"
      >
        🎉 SWAP !
      </motion.div>

      <motion.div
        style={{ opacity: skipOpacity, scale: skipScale }}
        className="absolute right-4 top-6 z-40 rounded-2xl border-2 border-rose-400 bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2 text-sm font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-xl rotate-[12deg]"
      >
        💨 PASSER
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
            <Package className="h-16 w-16 opacity-20" />
          </div>
        )}

        {/* Subtle Bottom Dark Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        {/* Story-style Segmented Photo Progress Bar */}
        {photos.length > 1 && (
          <div className="absolute inset-x-3 top-2.5 z-30 flex items-center gap-1">
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

        {/* Tap Zones for Photo Navigation */}
        {photos.length > 1 && (
          <div className="absolute inset-x-0 top-10 bottom-28 z-20 flex">
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

        {/* Top Header Info (Zone & Seller Badge) */}
        <div className="absolute inset-x-3 top-4 z-30 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-xl shadow-sm">
            <MapPin className="h-3 w-3 text-emerald-400" />
            <span className="truncate max-w-[90px]">{item.locationZone || t("nearby")}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 backdrop-blur-xl shadow-sm">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-[9px] font-black text-white">
              {item.owner.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-[9px] font-black uppercase text-white truncate max-w-[80px]">
              {item.owner.username}
            </span>
            <div className="flex items-center gap-0.5 text-amber-400">
              <Star className="h-2.5 w-2.5 fill-amber-400" />
              <span className="text-[8px] font-black">{item.owner.trustScore}</span>
            </div>
          </div>
        </div>

        {/* Bottom Floating Info Cockpit - Compact & Clear */}
        <div className="absolute inset-x-3 bottom-3 z-30 pointer-events-none">
          <div className="rounded-[24px] border border-white/20 bg-black/70 p-3.5 backdrop-blur-2xl shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-emerald-400">
                  <Sparkles className="h-2.5 w-2.5" />
                  Troque-moi !
                </span>
                <h2 className="line-clamp-1 font-display text-base font-black leading-tight tracking-tight text-white mt-0.5">
                  {item.title}
                </h2>
              </div>

              {/* Swaps Price Pill */}
              <div className="shrink-0 rounded-2xl border border-emerald-400/40 bg-emerald-500/25 px-3 py-1.5 text-right backdrop-blur-md shadow-md">
                <span className="block text-[7px] font-black uppercase tracking-widest text-emerald-300">
                  Valeur
                </span>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="font-display text-lg font-black text-white leading-none">
                    {item.creditValue}
                  </span>
                  <span className="text-[8px] font-black uppercase text-amber-400">
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
