import { getLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { getDiscoveryFeed } from "@/app/actions/item";
import prisma from "@/lib/prisma";
import TopNav from "@/components/TopNav";
import StoriesBar from "@/components/home/StoriesBar";
import LiveSwapRadar from "@/components/home/LiveSwapRadar";
import BentoShowcase from "@/components/home/BentoShowcase";
import WelcomeBonusTrigger from "@/components/wallet/WelcomeBonusTrigger";

export default async function Home() {
  const user = await getCurrentUser();
  const { nearby, popular, deals, userZone } = await getDiscoveryFeed();
  const locale = await getLocale();

  let unreadCount = 0;
  let categories: string[] = [];
  try {
    if (user) {
      unreadCount = await prisma.notification.count({
        where: { userId: user.id, read: false },
      });
    }

    const rawCats = await prisma.item.findMany({
      where: { status: "AVAILABLE", category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      take: 6,
    });
    categories = rawCats.map((c) => c.category!).filter(Boolean);
  } catch {
    unreadCount = 0;
    categories = [];
  }

  if (categories.length === 0) {
    categories = ["Électronique", "Chaussures", "Livres", "Accessoires"];
  }

  return (
    <main className="min-h-screen bg-background pb-36 font-sans relative overflow-hidden">
      {/* Top Floating App Bar */}
      <TopNav unreadCount={unreadCount} user={user} showSearch showBalance />

      {/* Main Dynamic Stage */}
      <div className="mx-auto max-w-md px-4 pt-2 space-y-6 sm:px-6">
        {/* 1. Real Categories Stories Tray */}
        <StoriesBar categories={categories} />

        {/* 2. Interactive Live Swap Radar Canvas with REAL DB items */}
        <LiveSwapRadar userZone={userZone || "Lomé Centre"} items={nearby} />

        {/* 3. High-Vibe Bento Drop Grid with REAL DB items */}
        <BentoShowcase nearby={nearby} popular={popular} deals={deals} />
      </div>

      {user && (
        <WelcomeBonusTrigger
          userCreatedAt={user.createdAt.toISOString()}
          promoSwaps={user.promoSwaps}
          availableSwaps={user.availableSwaps}
        />
      )}
    </main>
  );
}
