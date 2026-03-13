"use client";

import { Star, Zap } from "lucide-react";
import { getXPForLevel } from "@/lib/gamification-logic";


interface LevelProgressProps {
  level: number;
  xp: number;
}

export function LevelProgress({ level, xp }: LevelProgressProps) {
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const progressInLevel = xp - currentLevelXP;
  const totalInLevel = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.min(100, Math.max(0, (progressInLevel / totalInLevel) * 100));

  return (
    <div className="bg-surface border border-border rounded-[32px] p-6 shadow-sm relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
            <Zap className="w-6 h-6 fill-primary" />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-muted uppercase tracking-widest leading-none mb-1">
              Niveau Actuel
            </h4>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-foreground">{level}</span>
              <span className="text-xs font-bold text-muted uppercase italic">SwapLeague</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end text-primary mb-1">
            <Star className="w-3.5 h-3.5 fill-primary" />
            <span className="text-xs font-black italic">{xp} XP</span>
          </div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">
            {nextLevelXP - xp} XP avant niv. {level + 1}
          </p>
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-primary to-[#2457ff] rounded-full transition-all duration-1000 ease-out shadow-lg"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center px-1">
          <span className="text-[9px] font-black text-muted uppercase tracking-widest italic">Niv. {level}</span>
          <span className="text-[9px] font-black text-muted uppercase tracking-widest italic">Niv. {level + 1}</span>
        </div>
      </div>
    </div>
  );
}
