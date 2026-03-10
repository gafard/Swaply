import { getCurrentUser } from "@/lib/auth";
import { getLocale, getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { Heart, Package, ChevronLeft } from "lucide-react";
import ItemCard from "@/components/ItemCard";
import Link from "next/link";
import { redirect } from "next/navigation";
import { localizeHref } from "@/lib/i18n/pathnames";
import { presentItem } from "@/lib/item-presenter";

const FAVORITES_WISHLIST_TITLE = "__favorites__";

export default async function FavoritesPage() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("favoritesPage")]);
  const user = await getCurrentUser();
  if (!user) {
    redirect(localizeHref(locale, "/login?next=/favorites"));
  }

  const favoritesWishlist = await prisma.wishlist.findFirst({
    where: {
      userId: user.id,
      title: FAVORITES_WISHLIST_TITLE,
    },
    select: { id: true },
  });

  const matches = favoritesWishlist
    ? await prisma.wishlistMatch.findMany({
        where: {
          wishlistId: favoritesWishlist.id,
          item: {
            status: "AVAILABLE",
          },
        },
        include: {
          item: {
            include: {
              owner: { select: { username: true, trustScore: true } },
              city: { select: { name: true } },
              zone: { select: { name: true } },
              metric: true,
              images: { orderBy: { orderIndex: "asc" }, take: 1 },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const savedItems = matches.map((match) => presentItem(match.item));

  return (
    <main className="min-h-screen bg-white pb-24 font-sans sm:pb-8">
      <div className="bg-white/80 backdrop-blur-xl px-5 pt-12 pb-5 sticky top-0 z-40 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={localizeHref(locale, "/profile")}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {t("title")}
          </h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
        </div>
      </div>

      <div className="px-5 py-8">
        {savedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-slate-100">
              <Package className="w-10 h-10 text-slate-200" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              {t("emptyTitle")}
            </h2>
            <p className="text-sm text-slate-400 max-w-[240px] font-medium leading-relaxed mb-8">
              {t("emptyBody")}
            </p>
            <Link
              href={localizeHref(locale, "/")}
              className="bg-indigo-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-all text-sm"
            >
              {t("exploreItems")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {savedItems.map((item, index) => (
              <ItemCard key={item.id} item={item as any} index={index} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
