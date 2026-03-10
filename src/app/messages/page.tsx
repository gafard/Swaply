import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { ExchangeStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedContainer";
import { ArrowLeft, ChevronRight, MessageCircle } from "lucide-react";

const statusStyles: Record<ExchangeStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-100",
  EXPIRED: "bg-slate-100 text-slate-600 border-slate-200",
};

const statusLabels: Record<ExchangeStatus, string> = {
  PENDING: "En cours",
  CONFIRMED: "Confirmé",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
  EXPIRED: "Expiré",
};

export default async function MessagesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
          <MessageCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages indisponibles</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Connectez-vous pour retrouver vos conversations et vos échanges.
        </p>
        <Link
          href="/login"
          className="w-full rounded-2xl bg-indigo-600 text-white text-center font-bold py-4 shadow-lg shadow-indigo-200"
        >
          Se connecter
        </Link>
      </main>
    );
  }

  const exchanges = await prisma.exchange.findMany({
    where: {
      OR: [{ ownerId: user.id }, { requesterId: user.id }],
    },
    include: {
      item: true,
      owner: true,
      requester: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const conversations = exchanges
    .map((exchange) => {
      const otherUser = exchange.ownerId === user.id ? exchange.requester : exchange.owner;
      const lastMessage = exchange.messages[0];
      const lastActivity = lastMessage?.createdAt ?? exchange.createdAt;

      return {
        exchange,
        otherUser,
        lastMessage,
        lastActivity,
      };
    })
    .sort((left, right) => right.lastActivity.getTime() - left.lastActivity.getTime());

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24 font-sans sm:pb-8">
      <AnimatedContainer
        initialY={-20}
        className="bg-white/85 backdrop-blur-xl px-5 pt-12 pb-4 sticky top-0 z-40 border-b border-gray-100/60 flex items-center gap-3"
      >
        <Link href="/" className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-700">
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <p className="text-xs text-gray-500 font-medium">Toutes vos conversations actives et passées</p>
        </div>
      </AnimatedContainer>

      <div className="px-5 pt-6 space-y-4">
        {conversations.length === 0 ? (
          <AnimatedContainer className="bg-white border border-dashed border-gray-200 rounded-[1.75rem] p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-gray-400" />
            </div>
            <p className="font-bold text-gray-900 mb-1">Aucune conversation</p>
            <p className="text-sm text-gray-500 mb-6">
              Réservez un objet pour ouvrir un espace de discussion sécurisé.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
            >
              Explorer les objets
            </Link>
          </AnimatedContainer>
        ) : (
          conversations.map(({ exchange, otherUser, lastMessage, lastActivity }, index) => (
            <AnimatedItem key={exchange.id} index={index}>
              <Link
                href={`/exchange/${exchange.id}`}
                className="block rounded-[1.75rem] bg-white border border-gray-100 shadow-sm p-4 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center shrink-0">
                    {otherUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{otherUser.username}</p>
                        <p className="text-xs text-gray-500 font-medium line-clamp-1">{exchange.item.title}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold whitespace-nowrap">
                        {formatDistanceToNow(lastActivity, { addSuffix: true, locale: fr })}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 font-medium line-clamp-2 mb-3">
                      {lastMessage?.content ?? "Aucun message envoyé pour le moment."}
                    </p>

                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusStyles[exchange.status]}`}
                      >
                        {statusLabels[exchange.status]}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600">
                        Ouvrir
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedItem>
          ))
        )}
      </div>
    </main>
  );
}
