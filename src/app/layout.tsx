import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
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
