"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition, useState } from "react";
import { Globe } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

import { updatePreferredLanguage } from "@/app/actions/location";
import { localizeHref, stripLocalePrefix } from "@/lib/i18n/pathnames";
import { cn } from "@/lib/utils";

type Locale = "fr" | "en" | "es" | "pt";

interface LocaleOption {
  code: Locale;
  label: string;
  flag: string;
}

const LOCALES: LocaleOption[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
];

export default function LocaleSwitcher({
  align = "right",
  variant = "button",
}: {
  align?: "left" | "right";
  variant?: "button" | "select";
}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("localeSwitcher");

  const currentLocale = LOCALES.find((l) => l.code === locale);

  function onSelectChange(newLocale: Locale) {
    startTransition(async () => {
      try {
        const result = await updatePreferredLanguage(newLocale);
        if (!result.ok) {
          toast.error(t("error"));
          return;
        }

        const newPath = localizeHref(newLocale, stripLocalePrefix(pathname));
        router.push(newPath);
        setIsOpen(false);
      } catch {
        toast.error(t("error"));
      }
    });
  }

  if (variant === "select") {
    return (
      <div className="relative">
        <select
          value={locale}
          onChange={(e) => onSelectChange(e.target.value as Locale)}
          disabled={isPending}
          className="appearance-none bg-transparent text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer outline-none pr-6"
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.label}
            </option>
          ))}
        </select>
        <Globe className="w-4 h-4 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all",
          isOpen
            ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
            : "bg-white/60 text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLocale?.flag}</span>
        <span className="uppercase">{locale}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={cn(
              "absolute top-full mt-2 z-50 min-w-[160px] bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            <div className="p-2">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => onSelectChange(l.code)}
                  disabled={isPending}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    locale === l.code
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span className="text-lg">{l.flag}</span>
                  <span>{l.label}</span>
                  {locale === l.code && (
                    <span className="ml-auto text-indigo-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
