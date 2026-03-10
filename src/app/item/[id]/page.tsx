import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import { ArrowLeft, MapPin, Star, ShieldCheck, Info, Package, MessageSquare, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { reserveItem } from "@/app/actions/exchange";

export default async function ItemDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await getCurrentUser();
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          trustScore: true,
        },
      },
      images: {
        orderBy: { order: "asc" }
      }
    },
  }) as any;

  if (!item) notFound();

  const isOwner = user?.id === item.ownerId;
  const isDefective = item.functionalStatus !== "PERFECT";

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col pb-24 font-sans">
      {/* Header / Back */}
      <div className="fixed top-0 inset-x-0 z-50 p-6 flex justify-between items-center pointer-events-none">
        <Link href="/" className="bg-white/80 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center text-gray-900 shadow-xl border border-white/20 active:scale-95 transition-transform pointer-events-auto">
          <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
        </Link>
      </div>

      {/* Image Gallery */}
      <div className="relative aspect-[4/5] w-full max-w-2xl mx-auto overflow-hidden bg-slate-200">
        <ImageGallery images={item.images} title={item.title} />
        
        {/* Functional Badge Overlay */}
        {isDefective && (
          <div className="absolute bottom-6 left-6 bg-red-600/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2 z-20">
            <AlertTriangle className="w-5 h-5 text-white" />
            <span className="text-xs font-black text-white uppercase tracking-widest">
              {item.functionalStatus === "BROKEN" ? "Non-fonctionnel" : "Défaut mineur"}
            </span>
          </div>
        )}
      </div>

      {/* Content Card */}
      <div className="flex-1 bg-white -mt-10 rounded-t-[3rem] shadow-2xl relative z-10 px-6 pt-8 max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
               <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                 {item.category}
               </span>
               {item.brand && (
                 <span className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                   {item.brand}
                 </span>
               )}
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">{item.title}</h1>
            <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
              <MapPin className="w-4 h-4" />
              <span>{item.locationZone}</span>
            </div>
          </div>
          <div className="bg-indigo-600 px-5 py-3 rounded-2xl shadow-xl shadow-indigo-100 text-center min-w-[80px]">
            <span className="block text-2xl font-black text-white">{item.creditValue}</span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-60">CRÉDITS</span>
          </div>
        </div>

        {/* AI Explanation / Insights */}
        {item.aiExplanation && (
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 mb-8">
             <div className="flex items-center gap-2 mb-2 text-indigo-600">
               <ShieldCheck className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Analyse IA Swaply</span>
             </div>
             <p className="text-sm text-slate-600 leading-relaxed font-medium">
               {item.aiExplanation}
             </p>
          </div>
        )}

        <div className="space-y-4 mb-8">
           <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 px-1">Description</h2>
           <p className="text-slate-600 leading-relaxed font-medium px-1">
             {item.description}
           </p>
        </div>

        {/* Owner Info */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border border-slate-100 mb-20">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-xl font-black text-indigo-600 border border-indigo-200">
                {item.owner.username.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-gray-900">{item.owner.username}</span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>Trust Score: {item.owner.trustScore}</span>
                </div>
              </div>
           </div>
           <Link href={`/messages?userId=${item.ownerId}`} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm active:scale-95 transition-transform">
             <MessageSquare className="w-5 h-5" />
           </Link>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      {!isOwner && (
        <div className="fixed bottom-0 inset-x-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50 flex justify-center">
          <form action={async () => {
             "use server";
             // Reservation logic with safeguard will be triggered via client component normally
             // But for now we just link the action
             const result = await reserveItem(item.id);
             redirect(`/exchange/${result.id}`);
          }} className="w-full max-w-md">
            <button
              type="submit"
              className={cn(
                "w-full py-5 rounded-2xl font-black text-lg tracking-tight shadow-2xl transition-all active:scale-[0.98]",
                isDefective 
                  ? "bg-red-600 text-white shadow-red-200" 
                  : "bg-indigo-600 text-white shadow-indigo-200"
              )}
            >
              {isDefective ? "Accepter & Réserver" : "Réserver maintenant"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
