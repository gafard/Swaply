import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { ExchangeStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedContainer";
import { ArrowLeft, ChevronRight, History, ShieldCheck } from "lucide-react";

const historyStatuses: ExchangeStatus[] = ["COMPLETED", "EXPIRED", "CANCELLED", "CONFIRMED"];

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

export default async function ProfileHistoryPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Historique indisponible</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Connectez-vous pour consulter vos échanges passés.
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
      status: { in: historyStatuses },
    },
    include: {
      item: true,
      owner: true,
      requester: true,
      meetingPoint: true,
    },
    orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24 font-sans sm:pb-8">
      <AnimatedContainer
        initialY={-20}
        className="bg-white/85 backdrop-blur-xl px-5 pt-12 pb-4 sticky top-0 z-40 border-b border-gray-100/60 flex items-center gap-3"
      >
        <Link href="/profile" className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-700">
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Historique</h1>
          <p className="text-xs text-gray-500 font-medium">Archives de vos échanges passés</p>
        </div>
      </AnimatedContainer>

      <div className="px-5 pt-6 space-y-4">
        {exchanges.length === 0 ? (
          <AnimatedContainer className="bg-white border border-dashed border-gray-200 rounded-[1.75rem] p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <History className="w-6 h-6 text-gray-400" />
            </div>
            <p className="font-bold text-gray-900 mb-1">Aucun historique</p>
            <p className="text-sm text-gray-500">
              Les échanges terminés ou expirés apparaîtront ici.
            </p>
          </AnimatedContainer>
        ) : (
          exchanges.map((exchange, index) => {
            const otherUser = exchange.ownerId === user.id ? exchange.requester : exchange.owner;
            const happenedAt = exchange.completedAt ?? exchange.createdAt;

            return (
              <AnimatedItem key={exchange.id} index={index}>
                <Link
                  href={`/exchange/${exchange.id}`}
                  className="block rounded-[1.75rem] bg-white border border-gray-100 shadow-sm p-4 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-base font-bold text-gray-900">{exchange.item.title}</p>
                      <p className="text-xs text-gray-500 font-medium">
                        Avec {otherUser.username} • {formatDistanceToNow(happenedAt, { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusStyles[exchange.status]}`}
                    >
                      {statusLabels[exchange.status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Valeur</p>
                      <p className="text-sm font-extrabold text-indigo-600">{exchange.item.creditValue} CR</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Lieu</p>
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">
                        {exchange.meetingPoint?.name ?? "Non défini"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm font-bold text-indigo-600">
                    Voir le détail
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              </AnimatedItem>
            );
          })
        )}
      </div>
    </main>
  );
}
