"use client";

import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

interface Badge {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  earnedAt?: Date;
}

interface BadgeGridProps {
  badges: Badge[];
  allAchievements: any[];
}

export function BadgeGrid({ badges, allAchievements }: BadgeGridProps) {
  const earnedCodes = new Set(badges.map((b) => b.code));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-3">
        <h3 className="text-[11px] font-black text-muted uppercase tracking-widest">
          Badges & Succès
        </h3>
        <span className="text-[10px] font-black text-primary uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 italic">
          {badges.length} / {allAchievements.length}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {allAchievements.map((achievement) => {
          const isEarned = earnedCodes.has(achievement.code);
          const IconComponent = (LucideIcons as any)[achievement.icon || "Award"] || LucideIcons.Award;

          return (
            <div 
              key={achievement.id}
              className={cn(
                "relative group aspect-square rounded-[24px] border flex flex-col items-center justify-center p-2 transition-all duration-300",
                isEarned 
                  ? "bg-surface border-primary/20 shadow-sm shadow-primary/5 cursor-pointer hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1" 
                  : "bg-surface/40 border-slate-100 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center mb-1 transition-transform group-hover:scale-110",
                isEarned ? "text-primary bg-primary/5" : "text-slate-400 bg-slate-50"
              )}>
                <IconComponent className={cn("w-5.5 h-5.5", isEarned && "fill-primary/10")} />
              </div>
              
              {/* Tooltip emulation */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-xl border border-white/10">
                <p className="font-bold">{achievement.name}</p>
                <p className="text-white/60 font-medium">{achievement.description}</p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
              </div>

              {isEarned && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-surface flex items-center justify-center text-[8px] text-white shadow-sm">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
