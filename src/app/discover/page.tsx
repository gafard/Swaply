import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Loader2 } from "lucide-react";

import DiscoverContent from "@/components/discover/DiscoverContent";
import TopNav from "@/components/TopNav";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function DiscoverPage() {
  const [user, t] = await Promise.all([getCurrentUser(), getTranslations("discover")]);

  const unreadCount = user
    ? await prisma.notification.count({
        where: { userId: user.id, read: false },
      })
    : 0;

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      <TopNav unreadCount={unreadCount} user={user} showGuestActions={false} showSearch={false} showBalance={false} />
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium text-slate-500">{t("loadingParams")}</p>
          </div>
        }
      >
        <DiscoverContent />
      </Suspense>
    </main>
  );
}
