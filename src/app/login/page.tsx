"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import AppLogo from "@/components/AppLogo";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { localizeHref, stripLocalePrefix } from "@/lib/i18n/pathnames";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth.login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      const nextPath =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next")
          : null;
      const targetPath = nextPath ? stripLocalePrefix(nextPath) : "/";
      router.push(localizeHref(locale, targetPath));
      router.refresh();
    } else {
      alert(t("errors.generic"));
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-transparent font-sans">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(36,87,255,0.2),_transparent_55%)]" />
      <div className="pointer-events-none absolute -left-14 top-20 h-48 w-48 rounded-full bg-[#ff8e63]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-200/25 blur-3xl" />
      <div className="absolute right-6 top-6 z-20">
        <LocaleSwitcher variant="button" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-24">
        {/* Logo Section */}
        <div className="mb-10 flex flex-col items-center">
          <AppLogo
            size={84}
            priority
            className="mb-6 h-21 w-21 rounded-[2rem] border border-white/80 bg-white p-2 shadow-[0_18px_45px_rgba(36,87,255,0.16)]"
          />
          <h1 className="font-display text-4xl font-bold tracking-[-0.06em] text-slate-950">Swaply</h1>
        </div>

        <div className="paper-panel w-full max-w-sm rounded-[36px] px-6 py-7">
          <div className="mb-7 space-y-2 text-center sm:text-left">
            <h2 className="font-display text-[2rem] font-bold tracking-[-0.05em] text-slate-950">{t("title")}</h2>
            <p className="text-sm font-medium leading-6 text-slate-500">{t("subtitle")}</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
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

            <button 
              disabled={loading}
              className="mt-4 w-full rounded-[24px] bg-[#10203a] py-4 font-black text-white shadow-[0_16px_36px_rgba(16,32,58,0.22)] transition-all hover:bg-[#0d1a31] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? t("loading") : t("submit")}
            </button>
          </form>

          <div className="relative py-5">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
             <div className="relative flex justify-center bg-[#fffaf2] px-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300">{t("separator")}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button className="flex items-center justify-center rounded-[22px] border border-slate-200 bg-white py-4 transition-colors hover:bg-slate-50">
                <div className="w-5 h-5 bg-indigo-50 rounded-md flex items-center justify-center text-[10px] font-black text-indigo-600">G</div>
             </button>
             <button className="flex items-center justify-center rounded-[22px] border border-slate-200 bg-white py-4 transition-colors hover:bg-slate-50">
                <div className="w-5 h-5 bg-indigo-50 rounded-md flex items-center justify-center text-[10px] font-black text-indigo-600">f</div>
             </button>
          </div>

          <div className="flex flex-col items-center gap-4 pt-5">
            <p className="text-sm font-medium text-slate-500">
              {t("noAccount")}
            </p>
            <Link 
              href={localizeHref(locale, "/signup")}
              className="w-full rounded-[24px] border border-slate-200 bg-white py-4 text-center text-sm font-black text-slate-900 transition-all hover:bg-slate-50 active:scale-[0.98]"
            >
              {t("createAccount")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
