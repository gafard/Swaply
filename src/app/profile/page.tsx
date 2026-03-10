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
    <main className="min-h-screen bg-[#F8F9FA] pb-24 font-sans sm:pb-8 relative">
      
      {/* Header Profile Area */}
      <div className="bg-white rounded-b-[2.5rem] pt-16 pb-8 px-6 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] relative z-10">
        <AnimatedContainer initialY={-20} className="flex justify-between items-start mb-6">
           <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Mon Profil</h1>
           <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
             <Settings className="w-5 h-5" />
           </button>
        </AnimatedContainer>

        <AnimatedContainer delay={0.1} className="flex items-center gap-6">
           <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-indigo-100 border-4 border-white">
              {user.username.charAt(0).toUpperCase()}
           </div>
           <div>
             <h2 className="text-3xl font-black text-gray-900 leading-tight tracking-tight">{user.username}</h2>
             <p className="text-sm font-bold text-gray-400 mb-3">{user.email}</p>
             <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl w-max border border-indigo-100/30">
               <Star className="w-4 h-4 fill-indigo-600" />
               <span className="text-[12px] font-black uppercase tracking-tight">{user.trustScore} Trust Score</span>
             </div>
           </div>
        </AnimatedContainer>

        {/* Stats Row */}
        <AnimatedContainer delay={0.2} className="flex gap-4 mt-8">
           <div className="flex-1 bg-indigo-600 rounded-[1.5rem] p-5 shadow-xl shadow-indigo-100 border border-white/10">
              <p className="text-[10px] font-black text-indigo-100 mb-1 uppercase tracking-[0.2em]">Credits</p>
              <p className="text-3xl font-black text-white leading-none">{user.credits}</p>
           </div>
           <div className="flex-[1.2] bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5">
              <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objets</span>
                    <span className="text-lg font-black text-slate-900">{activeItemsCount}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Troc</span>
                    <span className="text-lg font-black text-slate-900">{completedExchanges}</span>
                 </div>
              </div>
           </div>
        </AnimatedContainer>
      </div>

      {/* Menu Options */}
      <div className="px-5 pt-8 space-y-3">
        
        <AnimatedItem index={0}>
          <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Mes Activités</h3>
        </AnimatedItem>

        <AnimatedItem index={1}>
          <Link href="/profile/items" className="flex items-center justify-between bg-white px-5 py-4 rounded-[1.25rem] border border-gray-100 shadow-sm shadow-gray-100/50 hover:border-indigo-200 transition-colors group">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                 <Package className="w-5 h-5" />
               </div>
               <span className="font-bold text-[15px] text-gray-800">Gérer mes objets</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </Link>
        </AnimatedItem>

        <AnimatedItem index={2}>
          <Link href="/favorites" className="flex items-center justify-between bg-white px-5 py-4 rounded-[1.25rem] border border-gray-100 shadow-sm shadow-gray-100/50 hover:border-indigo-200 transition-colors group">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                 <Heart className="w-5 h-5 fill-rose-600" />
               </div>
               <span className="font-bold text-[15px] text-gray-800">Mes favoris</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-rose-600 transition-colors" />
          </Link>
        </AnimatedItem>

        <AnimatedItem index={3}>
          <Link href="/profile/history" className="flex items-center justify-between bg-white px-5 py-4 rounded-[1.25rem] border border-gray-100 shadow-sm shadow-gray-100/50 hover:border-indigo-200 transition-colors group">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                 <ShieldCheck className="w-5 h-5" />
               </div>
               <span className="font-bold text-[15px] text-gray-800">Historique des échanges</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
          </Link>
        </AnimatedItem>

        <AnimatedItem index={4} className="pt-4">
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-600 font-bold px-5 py-4 rounded-[1.25rem] border border-rose-100 hover:bg-rose-100 transition-colors">
               <LogOut className="w-5 h-5" />
               Se déconnecter
            </button>
          </form>
        </AnimatedItem>

      </div>
    </main>
  );
}
