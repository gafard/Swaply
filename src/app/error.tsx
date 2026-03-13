"use client";

import { useEffect } from "react";
import { RefreshCw, AlertTriangle, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Swaply Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f1e8] px-6 text-center">
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-rose-100 animate-pulse" />
        <AlertTriangle className="relative z-10 h-10 w-10 text-rose-500" />
      </div>

      <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
        Oups, quelque chose s&apos;est cassé
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
        Une erreur inattendue est survenue. Vous pouvez réessayer ou retourner à l&apos;accueil.
      </p>

      {error.digest ? (
        <p className="mt-2 text-[10px] font-mono text-slate-400">
          Réf: {error.digest}
        </p>
      ) : null}

      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#102a72] to-[#2457ff] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98]"
        >
          <Home className="h-4 w-4" />
          Accueil
        </Link>
      </div>
    </div>
  );
}
