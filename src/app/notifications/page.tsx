import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { NotificationType } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, BellRing, MessageCircle, PackageOpen, CheckCircle2, Clock } from "lucide-react";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedContainer";

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="p-6 h-screen flex items-center justify-center">
        <p className="text-gray-500">Connectez-vous pour voir vos notifications.</p>
      </main>
    );
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Mark all as read when visited
  if (notifications.some((notification) => !notification.read)) {
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
  }

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "NEW_MESSAGE": return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "ITEM_RESERVED": return <PackageOpen className="w-5 h-5 text-indigo-500" />;
      case "EXCHANGE_CONFIRMED": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "RESERVATION_EXPIRED": return <Clock className="w-5 h-5 text-rose-500" />;
      default: return <BellRing className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24 font-sans sm:pb-8">
      <AnimatedContainer initialY={-20} className="bg-white/80 backdrop-blur-xl px-5 pt-12 pb-4 sticky top-0 z-40 border-b border-gray-100/50 flex items-center gap-3 shadow-[0_4px_30px_-15px_rgba(0,0,0,0.05)]">
        <Link href="/">
          <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 text-gray-700 hover:bg-gray-50 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </div>
        </Link>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Notifications</h1>
      </AnimatedContainer>

      <div className="px-5 space-y-4 pt-6">
        {notifications.length === 0 ? (
          <AnimatedContainer delay={0.1} className="text-center py-20">
            <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <BellRing className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Aucune notification pour le moment.</p>
          </AnimatedContainer>
        ) : (
          notifications.map((n, i) => (
            <AnimatedItem key={n.id} index={i} className={`relative overflow-hidden rounded-[1.5rem] border p-4 shadow-sm transition-all duration-300 ${!n.read ? 'bg-white border-indigo-100 shadow-[0_4px_20px_-5px_rgba(79,70,229,0.15)] ring-1 ring-indigo-50' : 'bg-white/60 border-gray-100/60 shadow-[0_2px_10px_-5px_rgba(0,0,0,0.05)] hover:bg-white'}`}>
              
              {!n.read && (
                 <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-purple-500" />
              )}
              
              <div className="flex gap-4">
                <div className={`w-12 h-12 shrink-0 rounded-[1.25rem] flex items-center justify-center border shadow-inner ${!n.read ? 'bg-indigo-50 border-indigo-100/50' : 'bg-gray-50 border-gray-100'}`}>
                   {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <span className={`font-bold text-[14px] leading-snug ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 whitespace-nowrap mt-0.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  <p className={`text-[13px] leading-relaxed ${!n.read ? 'text-gray-600 font-medium' : 'text-gray-500'}`}>{n.body}</p>
                </div>
              </div>
            </AnimatedItem>
          ))
        )}
      </div>
    </main>
  );
}
