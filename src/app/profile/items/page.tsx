import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { ItemStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedContainer";
import { ArrowLeft, ChevronRight, Package, PlusCircle } from "lucide-react";
import DeleteItemButton from "./DeleteItemButton";

const statusStyles: Record<ItemStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
  AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-100",
  RESERVED: "bg-amber-50 text-amber-700 border-amber-100",
  EXCHANGED: "bg-slate-100 text-slate-700 border-slate-200",
  REMOVED: "bg-rose-50 text-rose-700 border-rose-100",
};

const statusLabels: Record<ItemStatus, string> = {
  DRAFT: "Brouillon",
  AVAILABLE: "Disponible",
  RESERVED: "Réservé",
  EXCHANGED: "Échangé",
  REMOVED: "Retiré",
};

export default async function ProfileItemsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
          <Package className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Objets indisponibles</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Connectez-vous pour gérer vos annonces et suivre leur statut.
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

  const items = await prisma.item.findMany({
    where: { 
      ownerId: user.id,
      status: { not: "REMOVED" }
    },
    include: {
      city: true,
      zone: true,
      metric: true,
      exchanges: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24 font-sans sm:pb-8">
      <AnimatedContainer
        initialY={-20}
        className="bg-white/85 backdrop-blur-xl px-5 pt-12 pb-4 sticky top-0 z-40 border-b border-gray-100/60 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <Link href="/profile" className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-700">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mes objets</h1>
            <p className="text-xs text-gray-500 font-medium">Inventaire et statuts de vos publications</p>
          </div>
        </div>
        <Link
          href="/publish"
          className="w-10 h-10 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 flex items-center justify-center"
        >
          <PlusCircle className="w-5 h-5" />
        </Link>
      </AnimatedContainer>

      <div className="px-5 pt-6 space-y-4">
        {items.length === 0 ? (
          <AnimatedContainer className="bg-white border border-dashed border-gray-200 rounded-[1.75rem] p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
            <p className="font-bold text-gray-900 mb-1">Aucun objet publié</p>
            <p className="text-sm text-gray-500 mb-6">
              Publiez votre premier objet pour démarrer des échanges.
            </p>
            <Link
              href="/publish"
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
            >
              Publier un objet
            </Link>
          </AnimatedContainer>
        ) : (
          items.map((item, index) => {
            const pendingExchange = item.exchanges[0];

            return (
              <AnimatedItem key={item.id} index={index}>
                <div className="rounded-[1.75rem] bg-white border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-gray-900 line-clamp-1">{item.title}</p>
                      <p className="text-xs text-gray-500 font-medium">
                        Publié {formatDistanceToNow(item.createdAt, { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold shrink-0 ${statusStyles[item.status]}`}
                    >
                      {statusLabels[item.status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Crédits</p>
                      <p className="text-sm font-extrabold text-indigo-600">{item.priceSwaps}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Zone</p>
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">
                        {item.zone?.name ?? item.city?.name ?? "Zone inconnue"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">IA</p>
                      <p className="text-sm font-bold text-gray-900">
                        {typeof item.aiConfidence === "number"
                          ? `${Math.round(item.aiConfidence * 100)}%`
                          : "--"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <span>Vues: {item.metric?.totalViews ?? 0}</span>
                    <span>Favoris: {item.metric?.favoritesCount ?? 0}</span>
                  </div>

                  <div className="space-y-3">
                    {pendingExchange ? (
                      <Link
                        href={`/exchange/${pendingExchange.id}`}
                        className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700"
                      >
                        Conversation active
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        Aucun échange en cours
                      </div>
                    )}

                    {!pendingExchange && item.status === "AVAILABLE" && (
                      <DeleteItemButton itemId={item.id} itemTitle={item.title} />
                    )}
                  </div>
                </div>
              </AnimatedItem>
            );
          })
        )}
      </div>
    </main>
  );
}
