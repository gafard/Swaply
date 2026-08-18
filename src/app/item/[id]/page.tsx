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
  Sparkles,
  Share2,
} from "lucide-react";
import Link from "next/link";
import ReserveButton from "@/components/exchange/ReserveButton";
import ItemViewTracker from "@/components/item/ItemViewTracker";
import ReportItemButton from "@/components/item/ReportItemButton";
import { localizeHref } from "@/lib/i18n/pathnames";
import DeleteItemButton from "@/app/profile/items/DeleteItemButton";
import HoloBadge from "@/components/ui/HoloBadge";

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
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-danger/10 text-danger rounded-3xl border border-danger/20 flex items-center justify-center mb-6 shadow-sm">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Objet retiré</h1>
        <p className="text-sm text-muted max-w-xs mb-8">
          Cet objet n'est plus disponible car il a été supprimé par son propriétaire ou par la modération.
        </p>
        <Link
          href={localizeHref(locale, "/")}
          className="w-full max-w-xs rounded-2xl bg-primary text-white font-bold py-4 shadow-cta hover:bg-primary-hover transition-all"
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
    <main className="min-h-screen bg-background flex flex-col pb-36 font-sans text-foreground">
      {!isOwner && <ItemViewTracker itemId={item.id} />}

      {/* Floating Top Navigation */}
      <div className="fixed top-0 inset-x-0 z-50 p-4 sm:p-6 flex justify-between items-center pointer-events-none max-w-2xl mx-auto">
        <Link
          href={localizeHref(locale, "/")}
          aria-label={t("backHome")}
          className="bg-surface/85 backdrop-blur-2xl w-11 h-11 rounded-2xl flex items-center justify-center text-foreground shadow-md border border-border active:scale-95 transition-transform pointer-events-auto hover:border-primary/40"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </Link>
      </div>

      {/* Hero Image Gallery */}
      <div className="relative aspect-[4/5] w-full max-w-2xl mx-auto overflow-hidden bg-background">
        <ImageGallery images={item.images} title={item.title} />
      </div>

      {/* Spec Sheet & Main Body */}
      <div className="flex-1 bg-surface -mt-8 rounded-t-[40px] shadow-lg relative z-10 px-6 pt-8 max-w-2xl mx-auto w-full border-t border-border">
        {/* Title & Price Row */}
        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <HoloBadge variant={item.status === "AVAILABLE" ? "success" : "gold"} size="sm">
                {item.status === "AVAILABLE" ? t("available") : t("reserved")}
              </HoloBadge>
              {item.category && (
                <HoloBadge variant="primary" size="sm">
                  {item.category}
                </HoloBadge>
              )}
              {item.brand && (
                <HoloBadge variant="neutral" size="sm">
                  {item.brand}
                </HoloBadge>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
              {item.title}
            </h1>

            <div className="flex items-center gap-1.5 text-muted text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{locationLabel}</span>
            </div>
          </div>

          {/* Glowing Price Pill */}
          <div className="shrink-0 rounded-[24px] border border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent p-4 text-center min-w-[95px] shadow-sm">
            <span className="font-display block text-3xl font-bold text-foreground leading-none">
              {item.priceSwaps}
            </span>
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1 block">
              SWAPS
            </span>
          </div>
        </div>

        {/* AI Valuation Insight Card */}
        {item.aiSuggestedSwaps && (
          <div className="mb-8 rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {t("aiEstimate")}
              </span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed font-medium">
              {t("aiSuggestion", { amount: item.aiSuggestedSwaps })}
              {typeof item.aiConfidence === "number" && (
                <span className="text-muted">
                  {" "}• {t("confidence", { value: Math.round(item.aiConfidence * 100) })}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2.5 mb-8">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-muted">
            {t("description")}
          </h2>
          <p className="text-sm text-foreground/85 leading-relaxed font-medium whitespace-pre-line">
            {item.description || t("noDescription")}
          </p>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="rounded-[24px] border border-border bg-surface-raised/70 p-4">
            <div className="flex items-center gap-2 text-primary mb-1.5">
              <Eye className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted">
                {t("views")}
              </span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">
              {item.metric?.totalViews ?? 0}
            </p>
            <p className="text-[10px] text-muted font-medium mt-0.5">
              {t("uniqueVisitors", { count: item.metric?.uniqueViews ?? 0 })}
            </p>
          </div>

          <div className="rounded-[24px] border border-border bg-surface-raised/70 p-4">
            <div className="flex items-center gap-2 text-rose-500 mb-1.5">
              <Heart className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted">
                {t("favorites")}
              </span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">
              {item.metric?.favoritesCount ?? 0}
            </p>
            <p className="text-[10px] text-muted font-medium mt-0.5">
              {t("realInterest")}
            </p>
          </div>
        </div>

        {/* Seller Profile Card */}
        <div className="flex items-center justify-between p-4 bg-surface-raised/60 border border-border rounded-[28px] mb-12 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-pink-500 flex items-center justify-center text-lg font-bold text-white shadow-cta">
              {item.owner.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground text-sm">{item.owner.username}</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 mt-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>
                  {t("trustScore", { value: item.owner.trustScore })}
                </span>
              </div>
            </div>
          </div>
          <Link
            href={localizeHref(locale, "/messages")}
            aria-label={t("openMessages")}
            className="w-11 h-11 rounded-2xl bg-surface border border-border flex items-center justify-center text-primary shadow-sm hover:border-primary/40 active:scale-95 transition-all"
          >
            <MessageSquare className="w-5 h-5" />
          </Link>
        </div>

        {/* Management or Report Actions */}
        {isOwner && !hasPendingExchange && item.status === "AVAILABLE" && (
          <div className="mb-12">
            <DeleteItemButton itemId={item.id} itemTitle={item.title} />
          </div>
        )}

        {!isOwner && (
          <div className="mb-12">
            <ReportItemButton itemId={item.id} />
          </div>
        )}
      </div>

      {/* Floating Action Bar for Reservation */}
      {!isOwner && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-surface/90 backdrop-blur-2xl border-t border-border z-[60] flex justify-center pb-[max(env(safe-area-inset-bottom),20px)] shadow-lg">
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
