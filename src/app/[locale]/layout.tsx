import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Toaster } from "react-hot-toast";

import BottomNav from "@/components/BottomNav";
import OnboardingStatusSync from "@/components/OnboardingStatusSync";
import PreferredLanguageSync from "@/components/PreferredLanguageSync";
import { routing } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((value) => [value, `/${value}`])
      ),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: "Swaply",
      locale,
      type: "website",
      images: [{ url: "/opengraph-image" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/twitter-image"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const [messages, user] = await Promise.all([getMessages(), getCurrentUser()]);

  return (
    <NextIntlClientProvider messages={messages}>
      <OnboardingStatusSync hasCompletedOnboarding={user?.hasCompletedOnboarding ?? null} />
      <PreferredLanguageSync preferredLanguage={user?.preferredLanguage ?? null} />
      <div className="relative mx-auto min-h-screen max-w-md overflow-x-hidden bg-[#f8f2e9]/90 shadow-[0_30px_100px_rgba(16,32,58,0.18)] lg:border-x lg:border-white/70">
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={12}
          toastOptions={{
            duration: 4000,
            style: {
              background: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              padding: "16px 24px",
              color: "#0f172a",
              borderRadius: "28px",
              fontSize: "14px",
              fontWeight: "700",
              boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
              maxWidth: "400px",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#f43f5e",
                secondary: "#fff",
              },
              style: {
                background: "rgba(255, 250, 250, 0.9)",
                border: "1px solid rgba(244, 63, 94, 0.2)",
              }
            },
          }}
        />
        {children}
        <BottomNav />
      </div>
    </NextIntlClientProvider>
  );
}
