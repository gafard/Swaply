import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { ExchangeStatus } from "@prisma/client";
import { Settings, LogOut, Star, Package, ShieldCheck, ChevronRight, Heart } from "lucide-react";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedContainer";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-5 font-sans">
         <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
           <ShieldCheck className="w-10 h-10" />
         </div>
         <h1 className="text-2xl font-bold mb-2">Non connecté</h1>
         <p className="text-gray-500 text-center mb-8">Connectez-vous pour voir votre profil et vos objets.</p>
         <Link href="/login" className="bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-2xl w-full text-center shadow-lg shadow-indigo-200">
           Se connecter
         </Link>
      </main>
    )
  }

  // Fetch user stats
  const activeItemsCount = await prisma.item.count({
    where: { ownerId: user.id, status: "AVAILABLE" }
  });

  const completedExchanges = await prisma.exchange.count({
    where: { 
      OR: [{ ownerId: user.id }, { requesterId: user.id }],
      status: ExchangeStatus.COMPLETED
    }
  });
  return (
    <main className="min-h-screen bg-background pb-24 font-sans sm:pb-8 relative">
      
      {/* Header Profile Area */}
      <div className="bg-surface rounded-b-[40px] pt-16 pb-10 px-6 shadow-card relative z-10 border-b border-border">
        <AnimatedContainer initialY={-20} className="flex justify-between items-start mb-8">
           <h1 className="text-2xl font-semibold text-foreground tracking-tight">Mon Profil</h1>
           <button className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 border border-border hover:bg-slate-100 transition-all active:scale-95 shadow-sm">
             <Settings className="w-5.5 h-5.5" />
           </button>
        </AnimatedContainer>

        <AnimatedContainer delay={0.1} className="flex items-center gap-6">
           <div className="w-24 h-24 rounded-[32px] bg-primary flex items-center justify-center text-4xl font-bold text-white shadow-cta border-4 border-surface overflow-hidden">
              {user.username.charAt(0).toUpperCase()}
           </div>
           <div className="space-y-1">
             <h2 className="text-3xl font-bold text-foreground leading-tight tracking-tight">{user.username}</h2>
             <p className="text-sm font-medium text-muted mb-4">{user.email}</p>
             <div className="flex items-center gap-2 bg-primary/5 text-primary px-3.5 py-2 rounded-2xl w-max border border-primary/10 shadow-inner">
               <Star className="w-4 h-4 fill-primary" />
               <span className="text-[11px] font-bold uppercase tracking-tight">{user.trustScore} Trust Score</span>
             </div>
           </div>
        </AnimatedContainer>

        {/* Stats Row */}
        <AnimatedContainer delay={0.2} className="flex gap-4 mt-10">
           <div className="flex-1 bg-primary rounded-[28px] p-6 shadow-cta border border-white/10 group active:scale-[0.98] transition-transform">
              <p className="text-[10px] font-bold text-white/60 mb-1.5 uppercase tracking-widest">Crédits</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-white leading-none">{user.credits}</p>
                <span className="text-[10px] font-bold text-white/40 mb-1">UNITÉS</span>
              </div>
           </div>
           <div className="flex-[1.3] bg-background border border-border rounded-[28px] p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4 h-full">
                 <div className="flex flex-col justify-center border-r border-border pr-2">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 leading-none">Objets</span>
                    <span className="text-xl font-bold text-foreground">{activeItemsCount}</span>
                 </div>
                 <div className="flex flex-col justify-center pl-2">
                    <span className="text-xl font-bold text-foreground">{completedExchanges}</span>
                 </div>
              </div>
           </div>
        </AnimatedContainer>
      </div>

      {/* Menu Options */}
      <div className="px-5 pt-10 space-y-4">
        
        <AnimatedItem index={0}>
          <h3 className="text-[11px] font-bold text-muted uppercase tracking-widest px-3 mb-3">Mes Activités</h3>
        </AnimatedItem>

        <AnimatedItem index={1}>
          <Link href="/profile/items" className="flex items-center justify-between bg-surface px-6 py-5 rounded-[28px] border border-border shadow-sm hover:border-primary/30 transition-all group active:scale-[0.99]">
            <div className="flex items-center gap-4">
               <div className="w-11 h-11 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-transform shadow-inner">
                 <Package className="w-5.5 h-5.5" />
               </div>
               <span className="font-semibold text-[15px] text-foreground">Gérer mes objets</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <ChevronRight className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </AnimatedItem>

        <AnimatedItem index={2}>
          <Link href="/favorites" className="flex items-center justify-between bg-surface px-6 py-5 rounded-[28px] border border-border shadow-sm hover:border-primary/30 transition-all group active:scale-[0.99]">
            <div className="flex items-center gap-4">
               <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 group-hover:scale-110 transition-transform shadow-inner">
                 <Heart className="w-5.5 h-5.5 fill-rose-500" />
               </div>
               <span className="font-semibold text-[15px] text-foreground">Mes favoris</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <ChevronRight className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </AnimatedItem>

        <AnimatedItem index={3}>
          <Link href="/profile/history" className="flex items-center justify-between bg-surface px-6 py-5 rounded-[28px] border border-border shadow-sm hover:border-primary/30 transition-all group active:scale-[0.99]">
            <div className="flex items-center gap-4">
               <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 group-hover:scale-110 transition-transform shadow-inner">
                 <ShieldCheck className="w-5.5 h-5.5" />
               </div>
               <span className="font-semibold text-[15px] text-foreground">Historique des échanges</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <ChevronRight className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </AnimatedItem>

        <AnimatedItem index={4} className="pt-6">
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="w-full flex items-center justify-center gap-3 bg-rose-50/50 text-rose-600 font-bold px-6 py-5 rounded-[28px] border border-rose-100 hover:bg-rose-50 transition-all active:scale-[0.98] shadow-sm">
               <LogOut className="w-5.5 h-5.5" />
               Se déconnecter
            </button>
          </form>
        </AnimatedItem>

      </div>
    </main>
  );
}
