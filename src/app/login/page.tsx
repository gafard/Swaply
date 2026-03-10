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
    <main className="min-h-screen bg-white flex flex-col font-sans">
      <div className="absolute right-6 top-6 z-20">
        <LocaleSwitcher variant="button" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-20">
        {/* Logo Section */}
        <div className="mb-12 flex flex-col items-center">
          <AppLogo
            size={80}
            priority
            className="mb-6 h-20 w-20 rounded-[2rem] shadow-2xl shadow-indigo-200"
          />
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Swaply</h1>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{t("title")}</h2>
            <p className="text-sm text-slate-400 font-medium tracking-tight">{t("subtitle")}</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300 font-medium" 
                  placeholder={t("emailPlaceholder")}
                  type="email"
                  value={email} 
                  onChange={(e)=>setEmail(e.target.value)} 
                  required
                />
              </div>
              <div className="relative">
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300 font-medium" 
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
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
            >
              {loading ? t("loading") : t("submit")}
            </button>
          </form>

          <div className="relative py-4">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
             <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-slate-300 bg-white px-4 italic">{t("separator")}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button className="flex items-center justify-center py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="w-5 h-5 bg-indigo-50 rounded-md flex items-center justify-center text-[10px] font-black text-indigo-600">G</div>
             </button>
             <button className="flex items-center justify-center py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="w-5 h-5 bg-indigo-50 rounded-md flex items-center justify-center text-[10px] font-black text-indigo-600">f</div>
             </button>
          </div>

          <div className="pt-4 flex flex-col items-center gap-4">
            <p className="text-sm text-slate-400 font-medium">
              {t("noAccount")}
            </p>
            <Link 
              href={localizeHref(locale, "/signup")}
              className="w-full text-center border-2 border-slate-100 text-slate-900 font-black py-4 rounded-2xl hover:bg-slate-50 active:scale-[0.98] transition-all text-sm"
            >
              {t("createAccount")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
