import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swaply | Troc sur le Campus",
  description: "Marketplace d'échange locale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={jakarta.variable} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#F9FAFB] text-slate-800 font-sans selection:bg-indigo-500/30" suppressHydrationWarning>
        <div className="max-w-md mx-auto relative bg-[#F9FAFB] min-h-screen shadow-2xl shadow-gray-200 lg:border-x lg:border-gray-100 overflow-x-hidden">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
