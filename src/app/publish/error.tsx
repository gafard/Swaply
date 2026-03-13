"use client";

import { useEffect } from "react";
import { RefreshCw, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PublishError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Publish Flow Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-orange-100 animate-pulse" />
        <Package className="relative z-10 h-10 w-10 text-orange-500" />
      </div>

      <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
        Erreur lors de la publication
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
        Une erreur est survenue pendant la préparation de votre annonce. 
        Vos photos sont peut-être encore là, essayez de rafraîchir.
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
          Réessayer l&apos;étape
        </button>
        <Link
          href="/discover"
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          Abandonner
        </Link>
      </div>
    </div>
  );
}
