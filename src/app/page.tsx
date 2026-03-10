import { getCurrentUser } from "@/lib/auth";
import { Sparkles, TrendingUp, Zap, MapPin } from "lucide-react";
import ItemCard from "@/components/ItemCard";
import TopNav from "@/components/TopNav";
import { getDiscoveryFeed } from "@/app/actions/item";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();
  const { nearby, popular, deals, userZone } = await getDiscoveryFeed();

  const unreadCount = user 
    ? await prisma.notification.count({ where: { userId: user.id, read: false } })
    : 0;

  const SectionHeader = ({ icon: Icon, title, zone, color = "text-gray-900" }: { icon: any, title: string, zone?: string, color?: string }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex flex-col">
        <h3 className={ `text-[17px] font-black tracking-tight flex items-center gap-2 ${color}` }>
          <Icon className="w-4 h-4" />
          {title}
        </h3>
        {zone && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 ml-6">{zone}</span>}
      </div>
      <Link href="/discover" className="text-[11px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-xl">Voir tout</Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24 font-sans sm:pb-8">
      
      {/* 1. Header & Search Bar */}
      <TopNav unreadCount={unreadCount} user={user} />

      <div className="px-5 space-y-10 pt-4">
        
        {/* 2. Premium Discover CTA */}
        <section className="relative group overflow-hidden rounded-[2.5rem] bg-indigo-600 p-8 shadow-2xl shadow-indigo-100 transition-all active:scale-[0.98]">
          <Link href="/discover" className="absolute inset-0 z-20" />
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 blur-3xl rounded-full group-hover:bg-white/20 transition-all duration-700" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">Nouveauté</span>
              <h2 className="text-white text-2xl font-black leading-tight">🔥 Mode Découvrir</h2>
              <p className="text-white/60 text-xs font-bold">Swipe pour matcher des objets</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>
        </section>

        {/* 3. Nearby Section */}
        <section>
          <SectionHeader icon={MapPin} title="Nouveaux près de vous" zone={userZone} color="text-indigo-600" />
          <div className="grid grid-cols-2 gap-4">
            {nearby.slice(0, 4).map((item: any, index: number) => (
              <ItemCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>

        {/* 4. Popular Section */}
        <section>
          <SectionHeader icon={TrendingUp} title="Objets populaires" color="text-rose-500" />
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5">
             {popular.map((item: any, index: number) => (
               <div key={item.id} className="w-[200px] flex-shrink-0">
                 <ItemCard item={item} index={index} />
               </div>
             ))}
          </div>
        </section>

        {/* 5. Good Deals Section */}
        <section className="pb-8">
          <SectionHeader icon={Zap} title="Bonnes affaires" color="text-amber-500" />
          <div className="grid grid-cols-2 gap-4">
            {deals.slice(0, 4).map((item: any, index: number) => (
              <ItemCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
