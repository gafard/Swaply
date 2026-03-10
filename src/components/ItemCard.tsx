"use client";

import { motion } from "framer-motion";
import { Star, Package, MapPin, Eye, Heart, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toggleSaveItem } from "@/app/actions/item";
import { AnimatedItem } from "@/components/AnimatedContainer";
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
  views?: number;
  _count?: {
    savedBy: number;
  };
  distance?: number;
  functionalStatus?: string;
  status?: string;
}

export default function ItemCard({ item, index }: { item: Item, index: number }) {
  const [isSaved, setIsSaved] = useState(false); // Potential improvement: fetch actual state from prop

  return (
    <AnimatedItem index={index}>
      <Link href={`/item/${item.id}`} className="group block h-full">
        <div className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 h-full flex flex-col group/card">
          {/* Image Container - Larger & Fill */}
          <div className="aspect-[3/4] overflow-hidden bg-slate-50 relative">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
            )}
            
            {/* Status & Price Overlay */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5">
               <div className={cn(
                 "px-2 py-0.5 rounded-full shadow-sm",
                 item.status === "AVAILABLE" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
               )}>
                  <p className="text-[8px] font-black uppercase tracking-widest">
                    {item.status === "AVAILABLE" ? "Disponible" : "Réservé"}
                  </p>
               </div>
            </div>

            <div className="absolute top-2 right-2">
               <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-sm border border-white/50">
                  <span className="text-xs font-black text-slate-900">{item.creditValue} <span className="text-[9px] text-indigo-600">CR</span></span>
               </div>
            </div>

            {/* Zone Overlay (Bottom Left) */}
            <div className="absolute bottom-2 left-2">
               <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                  <MapPin className="w-2.5 h-2.5 text-white/80" />
                  <span className="text-[9px] font-black text-white uppercase tracking-wider">
                    {item.locationZone}
                  </span>
               </div>
            </div>

            {/* Save Button (Bottom Right) */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsSaved(!isSaved);
                toggleSaveItem(item.id);
              }}
              className={cn(
                "absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                isSaved 
                  ? "bg-rose-500 text-white shadow-lg" 
                  : "bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-rose-500"
              )}
            >
              <Heart className={cn("w-4 h-4", isSaved && "fill-white")} />
            </button>
          </div>

          {/* Content - Compact & Discrete Seller */}
          <div className="p-3 flex-1 flex flex-col gap-1">
            <h3 className="font-bold text-[13px] text-slate-900 line-clamp-1 tracking-tight group-hover/card:text-indigo-600 transition-colors leading-tight">
              {item.title}
            </h3>
            
            <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-50">
               <p className="text-[10px] font-medium text-slate-400">Par {item.owner.username}</p>
               <div className="flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                  <span className="text-[9px] font-black text-slate-600">{item.owner.trustScore}</span>
               </div>
            </div>
          </div>
        </div>
      </Link>
    </AnimatedItem>
  );
}
