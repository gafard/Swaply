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
    <main className="min-h-screen bg-background flex flex-col pb-24 font-sans">
      {/* Header / Back */}
      <div className="fixed top-0 inset-x-0 z-50 p-6 flex justify-between items-center pointer-events-none">
        <Link href="/" className="bg-surface/80 backdrop-blur-xl w-12 h-12 rounded-2xl flex items-center justify-center text-foreground shadow-popup border border-border active:scale-95 transition-transform pointer-events-auto">
          <ArrowLeft className="w-6 h-6" strokeWidth={2} />
        </Link>
      </div>

      {/* Image Gallery */}
      <div className="relative aspect-[4/5] w-full max-w-2xl mx-auto overflow-hidden bg-slate-100">
        <ImageGallery images={item.images} title={item.title} />
        
        {/* Functional Badge Overlay */}
        {isDefective && (
          <div className="absolute bottom-6 left-6 bg-[#EF4444]/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl flex items-center gap-2 z-20">
            <AlertTriangle className="w-5 h-5 text-white" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
              {item.functionalStatus === "BROKEN" ? "Non-fonctionnel" : "Défaut mineur"}
            </span>
          </div>
        )}
      </div>

      {/* Content Card */}
      <div className="flex-1 bg-surface -mt-10 rounded-t-[40px] shadow-card relative z-10 px-6 pt-10 max-w-2xl mx-auto w-full border-t border-border">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
               <span className="bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-primary/10">
                 {item.category}
               </span>
               {item.brand && (
                 <span className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-slate-200">
                   {item.brand}
                 </span>
               )}
            </div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight leading-tight">{item.title}</h1>
            <div className="flex items-center gap-1.5 text-muted text-sm font-medium">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{item.locationZone}</span>
            </div>
          </div>
          <div className="bg-primary px-5 py-4 rounded-[20px] shadow-cta text-center min-w-[90px]">
            <span className="block text-2xl font-bold text-white">{item.creditValue}</span>
            <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">CRÉDITS</span>
          </div>
        </div>

        {/* AI Explanation / Insights */}
        {item.aiExplanation && (
          <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 mb-10">
             <div className="flex items-center gap-2 mb-3 text-primary">
               <ShieldCheck className="w-4.5 h-4.5" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Analyse IA Swaply</span>
             </div>
             <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
               &quot;{item.aiExplanation}&quot;
             </p>
          </div>
        )}

        <div className="space-y-4 mb-10">
           <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted px-1">Description</h2>
           <p className="text-sm text-foreground/80 leading-relaxed font-medium px-1">
             {item.description}
           </p>
        </div>

        {/* Owner Info */}
        <div className="flex items-center justify-between p-5 bg-surface border border-border rounded-[32px] mb-24 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-2xl font-bold text-primary border border-primary/10 shadow-inner">
                {item.owner.username.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">{item.owner.username}</span>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted mt-1 uppercase tracking-tight">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Trust Score: <span className="text-foreground">{item.owner.trustScore}</span></span>
                </div>
              </div>
           </div>
           <Link href={`/messages?userId=${item.ownerId}`} className="w-12 h-12 rounded-2xl bg-white border border-border flex items-center justify-center text-primary shadow-sm hover:bg-slate-50 active:scale-95 transition-all">
             <MessageSquare className="w-5.5 h-5.5" />
           </Link>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      {!isOwner && (
        <div className="fixed bottom-0 inset-x-0 p-6 bg-surface/80 backdrop-blur-xl border-t border-border z-50 flex justify-center pb-8">
          <form action={async () => {
             "use server";
             const result = await reserveItem(item.id);
             redirect(`/exchange/${result.id}`);
          }} className="w-full max-w-md">
            <button
              type="submit"
              className={cn(
                "w-full py-5 rounded-[20px] font-bold text-[16px] tracking-tight shadow-cta transition-all active:scale-[0.98] text-white",
                isDefective 
                  ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100/50" 
                  : "bg-primary hover:bg-blue-700 shadow-blue-100/50"
              )}
            >
              {isDefective ? "Accepter les défauts & Réserver" : "Réserver cet objet"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
