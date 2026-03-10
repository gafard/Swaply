import prisma from "@/lib/prisma";
import { sendMessage, confirmExchange } from "@/app/actions/message";
import { selectMeetingPoint } from "@/app/actions/exchange";
import { getCurrentUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedContainer";
import RealtimeMessages from "@/components/RealtimeMessages";
import { ArrowLeft, MapPin, Send, MessageCircle, MoreVertical, Package, CheckCircle2 } from "lucide-react";
import MeetingPointSelector from "@/components/MeetingPointSelector";

export default async function ExchangePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) redirect("/login");

  const exchange = await prisma.exchange.findFirst({
    where: {
      id,
      OR: [{ requesterId: currentUser.id }, { ownerId: currentUser.id }],
    },
    include: {
      item: { include: { owner: true } },
      requester: true,
      owner: true,
      meetingPoint: true,
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: true }
      }
    }
  });

  if (!exchange) return notFound();

  const meetingPoints = await prisma.meetingPoint.findMany({
    orderBy: { name: "asc" }
  });

  const currentUserId = currentUser.id;
  const isPending = exchange.status === "PENDING";

  return (
    <main className="h-screen flex flex-col bg-[#F8F9FA] font-sans relative overflow-hidden">
      
      {/* 1. Fixed Item Context Header */}
      <AnimatedContainer initialY={-20} className="px-5 pt-8 pb-4 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="bg-slate-50 w-9 h-9 rounded-xl flex items-center justify-center text-slate-900 border border-slate-100 active:scale-90 transition-transform">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
               {exchange.item.imageUrl && (
                 <img src={exchange.item.imageUrl} alt="" className="w-full h-full object-cover" />
               )}
             </div>
             <div className="flex flex-col">
               <h1 className="text-sm font-black text-slate-900 line-clamp-1 leading-none mb-1">{exchange.item.title}</h1>
               <div className="flex items-center gap-1.5">
                 <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                   {exchange.status}
                 </span>
                 <span className="text-[10px] font-bold text-slate-400">Restant: 24h</span>
               </div>
             </div>
          </div>
        </div>
        
        <div className="bg-slate-50 w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
          <MoreVertical className="w-5 h-5" />
        </div>
      </AnimatedContainer>

      <div className="flex-1 overflow-y-auto pb-48 no-scrollbar bg-slate-50/30">
        <div className="p-5 space-y-6">
          {/* Meeting Point Logistics Card */}
          <AnimatedContainer delay={0.1}>
            <MeetingPointSelector 
              exchangeId={exchange.id} 
              points={meetingPoints as any} 
              currentPointId={exchange.meetingPointId} 
            />
          </AnimatedContainer>

          {/* Messages Flow */}
          <div className="pt-4">
            <RealtimeMessages
              currentUserId={currentUserId}
              exchangeId={exchange.id}
              initialMessages={exchange.messages}
              owner={{ id: exchange.owner.id, username: exchange.owner.username }}
              requester={{ id: exchange.requester.id, username: exchange.requester.username }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Fixed Action Bar / Chat Input */}
      <AnimatedContainer initialY={50} className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100/80 px-5 pt-4 inset-x-0 pb-8 sm:pb-4 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.1)] z-30">
        
        {isPending ? (
          <div className="flex flex-col gap-3">
            <form action={sendMessage.bind(null, exchange.id)} className="flex gap-2 relative group">
               <input 
                 type="text" 
                 name="message"
                 placeholder="Message sécurisé..." 
                 className="flex-1 bg-white border border-gray-200 outline-none rounded-2xl px-5 py-3.5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-400 shadow-sm"
                 required
               />
               <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 bg-indigo-600/10 text-indigo-600 rounded-xl aspect-square flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                 <Send className="w-5 h-5 ml-0.5" strokeWidth={2.5} />
               </button>
             </form>

             <form action={confirmExchange.bind(null, exchange.id)}>
               <button type="submit" className="w-full bg-emerald-500 text-white hover:bg-emerald-600 font-bold text-[15px] py-4 rounded-[1.25rem] transition-colors border border-emerald-600 shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 active:scale-95">
                 <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                 Confirmer le Troc
               </button>
             </form>
          </div>
        ) : (
          <div className="w-full bg-gray-50 text-gray-400 font-bold text-sm py-4 rounded-[1.25rem] border border-gray-100 shadow-inner flex items-center justify-center">
             Transaction Complétée
          </div>
        )}
      </AnimatedContainer>
    </main>
  );
}
