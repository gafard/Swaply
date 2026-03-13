import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import {
  ArrowLeft,
  MapPin,
  Star,
  ShieldCheck,
  MessageSquare,
  Eye,
  Heart,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import ReserveButton from "@/components/exchange/ReserveButton";
import ItemViewTracker from "@/components/item/ItemViewTracker";
import ReportItemButton from "@/components/item/ReportItemButton";
import { localizeHref } from "@/lib/i18n/pathnames";
import DeleteItemButton from "@/app/profile/items/DeleteItemButton";

export default async function ItemDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const user = await getCurrentUser();
  const [locale, t] = await Promise.all([getLocale(), getTranslations("itemDetail")]);
  const item = (await prisma.item.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          trustScore: true,
        },
      },
      city: true,
      zone: true,
      metric: true,
      images: {
        orderBy: { orderIndex: "asc" },
      },
      exchanges: {
        where: { status: "PENDING" },
        take: 1,
      },
    },
  })) as any;

  if (!item || item.status === "REMOVED") {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Objet retiré</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Cet objet n'est plus disponible car il a été supprimé par son propriétaire ou par la modération.
        </p>
        <Link
          href="/"
          className="w-full max-w-xs rounded-2xl bg-indigo-600 text-white text-center font-bold py-4 shadow-lg shadow-indigo-200"
        >
          Retour à l'accueil
        </Link>
      </main>
    );
  }

  const isOwner = user?.id === item.ownerId;
  const locationLabel = item.zone?.name ?? item.city?.name ?? t("unknownZone");
  const hasPendingExchange = item.exchanges.length > 0;

  return (
    <main className="min-h-screen bg-background flex flex-col pb-24 font-sans text-slate-900">
      {!isOwner && <ItemViewTracker itemId={item.id} />}

      <div className="fixed top-0 inset-x-0 z-50 p-6 flex justify-between items-center pointer-events-none">
        <Link
          href={localizeHref(locale, "/")}
          aria-label={t("backHome")}
          className="bg-surface/80 backdrop-blur-xl w-12 h-12 rounded-2xl flex items-center justify-center text-foreground shadow-popup border border-border active:scale-95 transition-transform pointer-events-auto"
        >
          <ArrowLeft className="w-6 h-6" strokeWidth={2} />
        </Link>
      </div>

      <div className="relative aspect-[4/5] w-full max-w-2xl mx-auto overflow-hidden bg-slate-100">
        <ImageGallery images={item.images} title={item.title} />
      </div>

      <div className="flex-1 bg-surface -mt-10 rounded-t-[40px] shadow-card relative z-10 px-6 pt-10 max-w-2xl mx-auto w-full border-t border-border">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              {item.category && (
                <span className="bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-primary/10">
                  {item.category}
                </span>
              )}
              {item.brand && (
                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-slate-200">
                  {item.brand}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight leading-tight">
              {item.title}
            </h1>
            <div className="flex items-center gap-1.5 text-muted text-sm font-medium">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{locationLabel}</span>
            </div>
          </div>
          <div className="bg-primary px-5 py-4 rounded-[20px] shadow-cta text-center min-w-[90px]">
            <span className="block text-2xl font-bold text-white">{item.priceSwaps}</span>
            <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">
              SWAPS
            </span>
          </div>
        </div>

        {item.aiSuggestedSwaps && (
          <div className="mb-10 bg-slate-50/50 border border-slate-100 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <ShieldCheck className="w-4.5 h-4.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {t("aiEstimate")}
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {t("aiSuggestion", { amount: item.aiSuggestedSwaps })}
              {typeof item.aiConfidence === "number" && (
                <span className="text-slate-400"> • {t("confidence", { value: Math.round(item.aiConfidence * 100) })}</span>
              )}
            </p>
          </div>
        )}

        <div className="space-y-4 mb-10 text-slate-800">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted px-1">
            {t("description")}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed font-medium px-1">
            {item.description || t("noDescription")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="rounded-[28px] border border-border bg-background px-5 py-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Eye className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                {t("views")}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {item.metric?.totalViews ?? 0}
            </p>
            <p className="text-[11px] text-muted font-medium mt-1">
              {t("uniqueVisitors", { count: item.metric?.uniqueViews ?? 0 })}
            </p>
          </div>
          <div className="rounded-[28px] border border-border bg-background px-5 py-4">
            <div className="flex items-center gap-2 text-rose-500 mb-2">
              <Heart className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                {t("favorites")}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {item.metric?.favoritesCount ?? 0}
            </p>
            <p className="text-[11px] text-muted font-medium mt-1">
              {t("realInterest")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-5 bg-surface border border-border rounded-[32px] mb-24 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-2xl font-bold text-primary border border-primary/10 shadow-inner">
              {item.owner.username.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">{item.owner.username}</span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted mt-1 uppercase tracking-tight">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>
                   {t("trustScore", { value: item.owner.trustScore })}
                </span>
              </div>
            </div>
          </div>
          <Link
            href={localizeHref(locale, "/messages")}
            aria-label={t("openMessages")}
            className="w-12 h-12 rounded-2xl bg-white border border-border flex items-center justify-center text-primary shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
          >
            <MessageSquare className="w-5.5 h-5.5" />
          </Link>
        </div>

        {isOwner && !hasPendingExchange && item.status === "AVAILABLE" && (
          <div className="mb-24 px-1">
            <div className="flex flex-col gap-2">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted">
                Gestion de l'annonce
              </h2>
              <DeleteItemButton itemId={item.id} itemTitle={item.title} />
            </div>
          </div>
        )}

        {!isOwner && (
          <div className="mb-24">
            <ReportItemButton itemId={item.id} />
          </div>
        )}
      </div>

      {!isOwner && (
        <div className="fixed bottom-0 inset-x-0 p-6 bg-surface/80 backdrop-blur-xl border-t border-border z-50 flex justify-center pb-8">
          <ReserveButton
            itemId={item.id}
            itemTitle={item.title}
            isDefective={false}
            userSwaps={user?.availableSwaps ?? 0}
            itemPrice={item.priceSwaps}
          />

        </div>
      )}
    </main>
  );
}
