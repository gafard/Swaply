import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import "./globals.css";
import { routing } from "@/i18n/routing";

function resolveMetadataBase() {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://swaply.vercel.app");
  } catch {
    return new URL("https://swaply.vercel.app");
  }
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: "Swaply | Découvre & Troque",
  description: "Plateforme de troc locale moderne, prête pour plusieurs pays et villes.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icon-192x192.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Swaply",
  },
  openGraph: {
    title: "Swaply | Découvre & Troque",
    description: "Plateforme de troc locale moderne, prête pour plusieurs pays et villes.",
    siteName: "Swaply",
    type: "website",
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swaply | Découvre & Troque",
    description: "Plateforme de troc locale moderne, prête pour plusieurs pays et villes.",
    images: ["/twitter-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#4F46E5",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const localeHeader = headerStore.get("x-swaply-locale");
  const localeCookie = cookieStore.get("SWAPLY_LOCALE")?.value;
  const preferredLocale = [localeHeader, localeCookie].find((value) =>
    routing.locales.includes(value as (typeof routing.locales)[number])
  );
  const htmlLang = preferredLocale ?? routing.defaultLocale;

  return (
    <html lang={htmlLang} className={inter.variable} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#F7F7F5] text-slate-800 font-sans selection:bg-indigo-500/30" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
