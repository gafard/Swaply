"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { MapPin, Package, Star } from "lucide-react";

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
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, 0, 180], [-7, 0, 7]);
  const y = useTransform(x, [-180, 0, 180], [10, 0, 10]);
  const scale = useTransform(x, [-180, 0, 180], [1.01, 1, 1.01]);
  const reserveOpacity = useTransform(x, [30, 140], [0, 1]);
  const skipOpacity = useTransform(x, [-140, -30], [1, 0]);
  const primaryImage = item.imageUrl || item.images?.[0]?.url;

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 110;
    if (info.offset.x > threshold || info.velocity.x > 550) {
      onSwipeRight();
      return;
    }
    if (info.offset.x < -threshold || info.velocity.x < -550) {
      onSwipeLeft();
    }
  };

  if (!isFront) {
    return (
      <div className="absolute inset-0 translate-y-4 scale-[0.972] overflow-hidden rounded-[40px] border border-white/70 bg-surface shadow-[0_20px_46px_rgba(16,32,58,0.08)]">
        {primaryImage ? (
          <img src={primaryImage} alt="" className="h-full w-full object-cover opacity-60 blur-[0.4px]" />
        ) : (
          <div className="flex h-full items-center justify-center bg-background/70">
            <Package className="h-10 w-10 text-slate-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,255,255,0.14)_40%,rgba(16,32,58,0.42))]" />
      </div>
    );
  }

  return (
    <motion.div
      style={{ x, y, rotate, scale }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.015, cursor: "grabbing" }}
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ x: x.get() >= 0 ? 560 : -560, opacity: 0, rotate: x.get() >= 0 ? 10 : -10, transition: { duration: 0.22 } }}
      transition={{ type: "spring", stiffness: 280, damping: 26, mass: 0.9 }}
      className="absolute inset-0 overflow-hidden rounded-[42px] border border-white/25 bg-surface shadow-[0_30px_80px_rgba(16,32,58,0.2)]"
    >
      <motion.div
        style={{ opacity: reserveOpacity }}
        className="absolute left-5 top-5 z-30 rounded-full border border-emerald-400/30 bg-emerald-500/16 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-50 backdrop-blur-xl"
      >
        {t("reserve")}
      </motion.div>
      <motion.div
        style={{ opacity: skipOpacity }}
        className="absolute right-5 top-5 z-30 rounded-full border border-rose-400/30 bg-rose-500/14 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-rose-50 backdrop-blur-xl"
      >
        {t("skip")}
      </motion.div>

      <div className="relative h-full w-full bg-background">
        {primaryImage ? (
          <img src={primaryImage} alt={item.title} className="h-full w-full object-cover select-none pointer-events-none" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-20 w-20 text-slate-200" />
          </div>
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,32,58,0.02)_0%,rgba(16,32,58,0.08)_28%,rgba(16,32,58,0.78)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_58%)]" />

        <div className="absolute inset-x-5 top-5 z-20 flex items-start justify-between gap-3">
          <div className="rounded-full border border-white/14 bg-black/18 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/72 backdrop-blur-md">
            {item.locationZone || t("nearby")}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/14 bg-black/20 px-3 py-1.5 backdrop-blur-md">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/14 text-[11px] font-black text-white">
              {item.owner.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white">{item.owner.username}</p>
              <div className="mt-0.5 flex items-center gap-1 text-white/72">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-black">{item.owner.trustScore}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-5 bottom-5 z-20">
          <div className="rounded-[30px] border border-white/14 bg-[linear-gradient(180deg,rgba(11,18,32,0.2),rgba(11,18,32,0.42))] px-4 py-4 backdrop-blur-xl shadow-[0_16px_40px_rgba(16,32,58,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2 text-white/68">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.16em]">
                    {item.locationZone || t("nearby")}
                  </span>
                </div>
                <h2 className="line-clamp-2 text-[1.75rem] font-bold leading-[1.02] tracking-[-0.05em] text-white">
                  {item.title}
                </h2>
              </div>
              <div className="shrink-0 rounded-[22px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,249,241,0.88))] px-3.5 py-3 text-right shadow-[0_10px_30px_rgba(255,255,255,0.08)]">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Swaps</p>
                <p className="mt-1 text-lg font-black text-slate-900">
                  {item.creditValue}
                  <span className="ml-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">CR</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
