"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { MapPin, Package, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
      className="absolute inset-0 overflow-hidden rounded-[3.2rem] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-white/20 touch-none"
    >
      {/* Swipe Feedback Labels - Smaller and more subtle */}
      <motion.div
        style={{ opacity: reserveOpacity, scale: reserveScale }}
        className="absolute left-6 top-8 z-40 rounded-xl border-2 border-emerald-500 bg-white/20 backdrop-blur-xl px-4 py-1.5 text-sm font-black text-emerald-500 uppercase tracking-[0.2em] shadow-xl rotate-[-12deg]"
      >
        RÉSERVER
      </motion.div>

      <motion.div
        style={{ opacity: skipOpacity, scale: skipScale }}
        className="absolute right-6 top-8 z-40 rounded-xl border-2 border-rose-500 bg-white/20 backdrop-blur-xl px-4 py-1.5 text-sm font-black text-rose-500 uppercase tracking-[0.2em] shadow-xl rotate-[12deg]"
      >
        PASSER
      </motion.div>

      {/* Main Image Layer */}
      <div className="relative h-full w-full bg-slate-50">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover select-none pointer-events-none"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-16 w-16 text-slate-200" />
          </div>
        )}

        {/* Global Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Floating Info (Style C - Minimalist & Premium) */}
        <div className="absolute inset-x-4 bottom-4 z-30">
          <div className="bg-black/20 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 shadow-2xl space-y-3 overflow-hidden">
            <div className="flex items-end justify-between">
              <div className="space-y-1.5">
                <h2 className="text-xl font-black text-white tracking-tight leading-tight">
                  {item.title}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white">
                    {item.creditValue} <span className="text-[10px] text-white/50 font-medium tracking-tighter">CR</span>
                  </span>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <div className="flex items-center gap-1.5 opacity-80">
                     <MapPin className="w-3 h-3 text-white/60" />
                     <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">
                       {item.locationZone}
                     </span>
                  </div>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/10 border border-white/5">
                    <span className="text-[8px] font-black text-white tracking-widest">📍 0.8 KM</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 group/seller">
                 <div className="text-right">
                    <p className="text-[9px] font-black text-white tracking-wide leading-none">{item.owner.username}</p>
                    <div className="flex items-center gap-0.5 mt-0.5 justify-end">
                       <Star className="w-2 h-2 fill-amber-400 border-none" />
                       <span className="text-[8px] font-bold text-white/60 truncate max-w-[40px]">{item.owner.trustScore}</span>
                    </div>
                 </div>
                 <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-[10px] text-white border border-white/30 font-black">
                    {item.owner.username.charAt(0).toUpperCase()}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}