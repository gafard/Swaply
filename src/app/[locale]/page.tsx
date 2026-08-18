import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
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
  const [locale, t] = await Promise.all([getLocale(), getTranslations("home")]);

  let unreadCount = 0;
  try {
    if (user) {
      unreadCount = await prisma.notification.count({
        where: { userId: user.id, read: false },
      });
    }
  } catch {
    unreadCount = 0;
  }

  return (
    <main className="min-h-screen bg-background pb-36 font-sans relative overflow-hidden">
      {/* Top Floating App Bar */}
      <TopNav unreadCount={unreadCount} user={user} showSearch showBalance />

      {/* Main Dynamic Stage */}
      <div className="mx-auto max-w-md px-4 pt-2 space-y-6 sm:px-6">
        {/* 1. Live Stories Tray */}
        <StoriesBar />

        {/* 2. Interactive Live Swap Radar Canvas */}
        <LiveSwapRadar userZone={userZone || "Lomé Centre"} itemsCount={nearby.length + popular.length} />

        {/* 3. High-Vibe Bento Drop Grid */}
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
