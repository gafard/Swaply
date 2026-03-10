import prisma from "@/lib/prisma";
import { sendMessage } from "@/app/actions/message";
import { getCurrentUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import RealtimeMessages from "@/components/RealtimeMessages";
import { ArrowLeft, MoreVertical, Send, CheckCircle2 } from "lucide-react";
import MeetingPointSelector from "@/components/MeetingPointSelector";
import QRValidation from "@/components/QRValidation";

export default async function ExchangePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const exchange = (await prisma.exchange.findFirst({
    where: {
      id,
      OR: [{ requesterId: currentUser.id }, { ownerId: currentUser.id }],
    },
    include: {
      item: {
        include: {
          owner: true,
          city: true,
          zone: true,
          images: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
      requester: true,
      owner: true,
      meetingPoint: {
        include: {
          city: true,
          zone: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: true },
      },
    },
  })) as any;

  if (!exchange) {
    return notFound();
  }

  const meetingPoints = ((await prisma.meetingPoint.findMany({
    where: {
      countryId: exchange.item.countryId,
      cityId: exchange.item.cityId,
      isActive: true,
      ...(exchange.item.zoneId
        ? {
            OR: [{ zoneId: exchange.item.zoneId }, { zoneId: null }],
          }
        : {}),
    },
    include: {
      city: true,
      zone: true,
    },
    orderBy: { name: "asc" },
  })) as any[]).map((point) => ({
    id: point.id,
    name: point.name,
    zone: point.zone?.name ?? point.city?.name ?? "Zone inconnue",
    description: point.description,
    lat: point.lat,
    lng: point.lng,
    isOfficial: true,
  }));

  const isOwner = exchange.ownerId === currentUser.id;
  const isPending = exchange.status === "PENDING";
  const locationLabel = exchange.item.zone?.name ?? exchange.item.city?.name ?? "Zone inconnue";
  const initialMessages = exchange.messages.map((message: any) => ({
    id: message.id,
    senderId: message.senderId,
    content: message.body,
    sender: {
      username: message.sender.username,
    },
  }));

  return (
    <main className="h-screen flex flex-col bg-[#F8F9FA] font-sans relative overflow-hidden">
      <AnimatedContainer
        initialY={-20}
        className="px-5 pt-8 pb-4 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 sticky top-0 z-50 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="bg-slate-50 w-9 h-9 rounded-xl flex items-center justify-center text-slate-900 border border-slate-100 active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
              {exchange.item.images?.[0]?.url && (
                <img
                  src={exchange.item.images[0].url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-slate-900 line-clamp-1 leading-none mb-1">
                {exchange.item.title}
              </h1>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide ${
                    exchange.status === "COMPLETED"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  {exchange.status}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {locationLabel}
                </span>
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
          <AnimatedContainer delay={0.1}>
            <QRValidation
              exchangeId={exchange.id}
              isOwner={isOwner}
              initialToken={exchange.qrToken}
              status={exchange.status}
            />
          </AnimatedContainer>

          <AnimatedContainer delay={0.15}>
            <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Recapitulatif du troc
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-500">Valeur de l'objet</span>
                  <span className="text-slate-900">{exchange.item.priceSwaps} SC</span>
                </div>
                {exchange.requesterSwaps > exchange.item.priceSwaps && (
                  <div className="flex justify-between items-center text-sm font-bold p-3 bg-indigo-50 rounded-2xl border border-indigo-100/50">
                    <span className="text-indigo-600">Complement demandeur</span>
                    <span className="text-indigo-700 font-black">
                      +{exchange.requesterSwaps - exchange.item.priceSwaps} SC
                    </span>
                  </div>
                )}
                <div className="h-px bg-slate-50 my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 uppercase">
                    Total reserve
                  </span>
                  <span className="text-lg font-black text-primary">
                    {exchange.requesterSwaps} SC
                  </span>
                </div>
              </div>
            </div>
          </AnimatedContainer>

          <AnimatedContainer delay={0.2}>
            <MeetingPointSelector
              exchangeId={exchange.id}
              points={meetingPoints}
              currentPointId={exchange.meetingPointId}
            />
          </AnimatedContainer>

          <div className="pt-4">
            <RealtimeMessages
              currentUserId={currentUser.id}
              exchangeId={exchange.id}
              initialMessages={initialMessages}
              owner={{ id: exchange.owner.id, username: exchange.owner.username }}
              requester={{
                id: exchange.requester.id,
                username: exchange.requester.username,
              }}
            />
          </div>
        </div>
      </div>

      <AnimatedContainer
        initialY={50}
        className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100/80 px-5 pt-4 inset-x-0 pb-8 sm:pb-4 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.1)] z-30"
      >
        {isPending ? (
          <form action={sendMessage.bind(null, exchange.id)} className="flex gap-2 relative group">
            <input
              type="text"
              name="message"
              placeholder="Message securise..."
              className="flex-1 bg-white border border-gray-200 outline-none rounded-2xl px-5 py-3.5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-400 shadow-sm"
              required
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 bg-indigo-600/10 text-indigo-600 rounded-xl aspect-square flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors"
            >
              <Send className="w-5 h-5 ml-0.5" strokeWidth={2.5} />
            </button>
          </form>
        ) : (
          <div className="w-full bg-emerald-50 text-emerald-600 font-bold text-sm py-4 rounded-[1.25rem] border border-emerald-100 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Transaction completee
          </div>
        )}
      </AnimatedContainer>
    </main>
  );
}
