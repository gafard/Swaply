import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DiscoveryStack from "../../components/DiscoveryStack";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function DiscoverPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch items for the stack - Using our intelligent ranking logic
  const rawItems = await prisma.item.findMany({
    where: { 
      status: "AVAILABLE",
      ownerId: { not: user.id } // Don't show own items
    },
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { username: true, trustScore: true } },
    }
  });

  // Ranking (duplicated logic from home for now, could be abstracted)
  const items = rawItems.map((item) => {
    const userZone = user.defaultZone || "";
    const isSameZone = item.locationZone === userZone;
    const daysSincePost = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const freshnessScore = Math.max(0, 7 - daysSincePost);
    const score = (item.owner.trustScore * 2) + item.views + freshnessScore + (isSameZone ? 20 : 0);
    return { ...item, _score: score };
  })
  .sort((a, b) => b._score - a._score)
  .slice(0, 20); // Keep top 20 for the stack

  return (
    <main className="h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans">
      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-between z-50">
        <Link href="/" className="bg-white w-10 h-10 rounded-2xl flex items-center justify-center text-gray-900 shadow-sm border border-gray-100 active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight">Découverte</h1>
          <div className="flex items-center gap-1">
             <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">En direct près de vous</span>
          </div>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 relative px-4 pb-32 sm:pb-24">
        <DiscoveryStack items={items} />
      </div>
    </main>
  );
}
