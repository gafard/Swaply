"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { MapPin, Package, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  title: string;
  images?: Array<{ url: string; order: number }> | null;
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

export default function DiscoveryCard({
  item,
  onSwipeRight,
  onSwipeLeft,
  isFront,
}: Props) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, 180], [-8, 8]);
  const opacity = useTransform(x, [-250, -200, 0, 200, 250], [0, 1, 1, 1, 0]);
  const primaryImage = item.images?.[0]?.url;
  const t = useTranslations("discoveryCard");

  // Dynamic feedback labels
  const reserveOpacity = useTransform(x, [60, 150], [0, 1]);
  const reserveScale = useTransform(x, [60, 150], [0.8, 1]);
  const skipOpacity = useTransform(x, [-150, -60], [1, 0]);
  const skipScale = useTransform(x, [-150, -60], [1, 0.8]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
    if (info.offset.x > 120) {
      onSwipeRight();
    } else if (info.offset.x < -120) {
      onSwipeLeft();
    }
  };

  if (!isFront) {
    return (
      <div className="absolute inset-0 scale-[0.96] rounded-[3.2rem] border border-slate-100 bg-white shadow-sm overflow-hidden translate-y-2 opacity-50">
        <div className="flex h-full items-center justify-center bg-gray-50">
           <Package className="w-12 h-12 text-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute inset-0 overflow-hidden rounded-[40px] bg-white shadow-popup border border-white/20 touch-none shadow-[0_22px_70px_rgba(0,0,0,0.18)]"
    >
      {/* Swipe Feedback Labels */}
      <motion.div
        style={{ opacity: reserveOpacity, scale: reserveScale }}
        className="absolute left-8 top-10 z-40 rounded-full border border-emerald-500 bg-emerald-500/10 backdrop-blur-xl px-5 py-2 text-[12px] font-black text-emerald-500 uppercase tracking-widest shadow-lg rotate-[-12deg]"
      >
        {t("reserve")}
      </motion.div>

      <motion.div
        style={{ opacity: skipOpacity, scale: skipScale }}
        className="absolute right-8 top-10 z-40 rounded-full border border-rose-500 bg-rose-500/10 backdrop-blur-xl px-5 py-2 text-[12px] font-black text-rose-500 uppercase tracking-widest shadow-lg rotate-[12deg]"
      >
        {t("skip")}
      </motion.div>

      {/* Main Image Layer */}
      <div className="relative h-full w-full bg-slate-50">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={item.title}
            className="h-full w-full object-cover select-none pointer-events-none"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-20 w-20 text-slate-200" />
          </div>
        )}

        {/* Dynamic Scrim Overlays */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/20 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-x-6 bottom-8 z-30">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-white tracking-tight leading-tight drop-shadow-sm">
                {item.title}
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 opacity-90">
                   <MapPin className="w-3.5 h-3.5 text-white/70" />
                   <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                     {item.locationZone}
                   </span>
                </div>
                <div className="h-1 w-1 rounded-full bg-white/30" />
                <span className="text-[11px] font-black text-white/80 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-md border border-white/5">
                  {t("nearby")}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2">
                <span className="text-2xl font-black text-white tracking-tighter">
                  {item.creditValue}
                </span>
                <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">SWAPS</span>
              </div>
              
              <div className="flex items-center gap-2 group/seller bg-black/20 backdrop-blur-md rounded-2xl p-1.5 pr-4 border border-white/5">
                 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[14px] text-white border border-white/20 font-black shadow-inner">
                    {item.owner.username.charAt(0).toUpperCase()}
                 </div>
                 <div>
                    <p className="text-[11px] font-black text-white tracking-wide leading-none">{item.owner.username}</p>
                    <div className="flex items-center gap-1 mt-1">
                       <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                       <span className="text-[10px] font-black text-white/60 tracking-tighter">{item.owner.trustScore}</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
