"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import AppLogo from "@/components/AppLogo";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { localizeHref } from "@/lib/i18n/pathnames";
import { TERMS_VERSION } from "@/lib/legal";
import SuccessView from "@/components/SuccessView";
import ErrorView from "@/components/ErrorView";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth.signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptedTerms) {
      setTermsError(t("errors.mustAcceptTerms"));
      return;
    }

    setLoading(true);
    setTermsError("");
    setError(null);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          accepted_terms_at: new Date().toISOString(),
          accepted_terms_version: TERMS_VERSION,
        },
      },
    });
    if (!authError) {
      setShowSuccess(true);
    } else {
      console.error("Signup error:", authError);
      if (authError.message?.includes("User already registered")) {
        setError(t("errors.emailAlreadyInUse"));
      } else {
        setError(t("errors.generic"));
      }
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    if (!acceptedTerms) {
      setTermsError(t("errors.mustAcceptTerms"));
      return;
    }

    setGoogleLoading(true);
    setTermsError("");

    const redirectTo = new URL("/api/auth/callback", window.location.origin);
    redirectTo.searchParams.set("locale", locale);
    redirectTo.searchParams.set("next", "/onboarding");
    redirectTo.searchParams.set("acceptedTerms", "1");
    redirectTo.searchParams.set("termsAcceptedAt", new Date().toISOString());
    redirectTo.searchParams.set("termsVersion", TERMS_VERSION);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo.toString(),
      },
    });

    if (authError) {
      setError(t("errors.google"));
      setGoogleLoading(false);
    }
  }

  if (error && error.includes("Google")) {
    return (
      <ErrorView
        title="Erreur d'inscription"
        subtitle={error}
        onRetry={() => setError(null)}
        secondaryActionHref={localizeHref(locale, "/login")}
        secondaryActionLabel="Se connecter"
      />
    );
  }

  if (showSuccess) {
    return (
      <SuccessView
        title="Compte créé !"
        subtitle="Votre compte Swaply a été créé avec succès. Vous pouvez maintenant vous connecter et commencer à troquer."
        actionHref={localizeHref(locale, "/login?next=/onboarding")}
        actionLabel="Se connecter"
      />
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-transparent font-sans">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(36,87,255,0.18),_transparent_55%)]" />
      <div className="pointer-events-none absolute -right-16 top-14 h-52 w-52 rounded-full bg-[#ff8e63]/10 blur-3xl" />
      <div className="pointer-events-none absolute left-0 top-0 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl" />
      <div className="absolute right-6 top-6 z-20">
        <LocaleSwitcher variant="button" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-24">
        {/* Logo Section */}
        <div className="mb-10 flex flex-col items-center">
          <AppLogo
            size={84}
            priority
            className="mb-6 h-21 w-21"
          />
          <h1 className="font-display text-4xl font-bold tracking-[-0.06em] text-slate-950">Swaply</h1>
        </div>

        <div className="paper-panel w-full max-w-sm rounded-[36px] px-6 py-7">
          <div className="mb-7 space-y-2 text-center sm:text-left">
            <h2 className="font-display text-[2rem] font-bold tracking-[-0.05em] text-slate-950">{t("title")}</h2>
            <p className="text-sm font-medium leading-6 text-slate-500">{t("subtitle")}</p>
          </div>
          
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <input 
                  className="w-full rounded-[22px] border border-slate-200 bg-white/85 px-5 py-4 text-sm font-semibold outline-none transition-all placeholder:text-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50" 
                  placeholder={t("emailPlaceholder")}
                  type="email"
                  value={email} 
                  onChange={(e)=>setEmail(e.target.value)} 
                  required
                />
              </div>
              <div className="relative">
                <input 
                  className="w-full rounded-[22px] border border-slate-200 bg-white/85 px-5 py-4 text-sm font-semibold outline-none transition-all placeholder:text-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50" 
                  type="password" 
                  placeholder={t("passwordPlaceholder")}
                  value={password} 
                  onChange={(e)=>setPassword(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-white/80 px-4 py-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => {
                    setAcceptedTerms(event.target.checked);
                    if (event.target.checked) {
                      setTermsError("");
                    }
                  }}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium leading-6 text-slate-600">
                  {t.rich("acceptTermsLabel", {
                    terms: (chunks) => (
                      <Link
                        href={localizeHref(locale, "/terms")}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-indigo-600 underline decoration-indigo-200 underline-offset-4"
                      >
                        {chunks}
                      </Link>
                    ),
                  })}
                </span>
              </label>
              {termsError ? (
                <p className="mt-2 text-sm font-semibold text-rose-600">{termsError}</p>
              ) : null}
            </div>

            <button 
              disabled={loading}
              className="mt-4 w-full rounded-[24px] bg-[#2457ff] py-4 font-black text-white shadow-[0_16px_36px_rgba(36,87,255,0.24)] transition-all hover:bg-[#1d4fe8] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? t("loading") : t("submit")}
            </button>
          </form>

          <div className="relative py-5">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
             <div className="relative flex justify-center bg-[#fffaf2] px-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300">{t("separator")}</div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-[22px] border border-slate-200 bg-white py-4 text-sm font-black text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f3f6ff] text-xs font-black text-indigo-600">
              G
            </span>
            {googleLoading ? t("googleLoading") : t("google")}
          </button>

          <div className="flex flex-col items-center gap-4 pt-5">
            <p className="text-sm font-medium text-slate-500">
              {t("alreadyAccount")}
            </p>
            <Link 
              href={localizeHref(locale, "/login")}
              className="w-full rounded-[24px] border border-slate-200 bg-white py-4 text-center text-sm font-black text-slate-900 transition-all hover:bg-slate-50 active:scale-[0.98]"
            >
              {t("login")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
