import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swaply | Découvre & Troque",
  description: "Plateforme de troc locale moderne à Lomé.",
  manifest: "/manifest.json",
  themeColor: "#4F46E5",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Swaply",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#F7F7F5] text-slate-800 font-sans selection:bg-indigo-500/30" suppressHydrationWarning>
        <div className="max-w-md mx-auto relative bg-[#F7F7F5] min-h-screen shadow-2xl shadow-gray-200 lg:border-x lg:border-gray-100 overflow-x-hidden">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
