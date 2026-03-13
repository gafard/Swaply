"use client";

import { useEffect } from "react";
import { RefreshCw, MessageCircle, Home } from "lucide-react";
import Link from "next/link";

export default function ExchangeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Exchange Page Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-blue-100 animate-pulse" />
        <MessageCircle className="relative z-10 h-10 w-10 text-blue-500" />
      </div>

      <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
        Erreur sur cet échange
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
        Nous n&apos;avons pas pu charger les détails de cette transaction. 
        Vos messages sont en sécurité, réessayez dans un instant.
      </p>

      {error.digest ? (
        <p className="mt-2 text-[10px] font-mono text-slate-400">
          Réf: {error.digest}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
        >
          <RefreshCw className="h-4 w-4" />
          Réactualiser
        </button>
        <Link
          href="/profile"
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#102a72] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98]"
        >
          <Home className="h-4 w-4" />
          Mes échanges
        </Link>
      </div>
    </div>
  );
}
