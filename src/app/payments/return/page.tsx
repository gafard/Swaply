import { PaymentStatus } from "@prisma/client";
import { ArrowLeft, CheckCircle2, Clock3, CreditCard, XCircle } from "lucide-react";
import Link from "next/link";

import { resolvePaymentReturn } from "@/lib/payments";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

const statusConfig: Record<
  PaymentStatus,
  {
    title: string;
    description: string;
    badgeClassName: string;
    icon: typeof CheckCircle2;
  }
> = {
  SUCCESS: {
    title: "Paiement confirmé",
    description: "Les Swaps ont été crédités sur votre wallet.",
    badgeClassName: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: CheckCircle2,
  },
  PENDING: {
    title: "Paiement en attente",
    description: "Le provider a bien reçu la demande. La confirmation arrive par webhook.",
    badgeClassName: "bg-amber-50 text-amber-700 border-amber-100",
    icon: Clock3,
  },
  FAILED: {
    title: "Paiement refusé",
    description: "Le provider n'a pas validé la transaction.",
    badgeClassName: "bg-rose-50 text-rose-700 border-rose-100",
    icon: XCircle,
  },
  CANCELLED: {
    title: "Paiement annulé",
    description: "Aucun débit ni crédit de Swaps n'a été appliqué.",
    badgeClassName: "bg-slate-100 text-slate-700 border-slate-200",
    icon: XCircle,
  },
};

export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const providerCode = readSearchParam(resolvedSearchParams, "provider") ?? "";
  const paymentId = readSearchParam(resolvedSearchParams, "paymentId");
  const sessionId = readSearchParam(resolvedSearchParams, "session_id");
  const checkoutState = readSearchParam(resolvedSearchParams, "checkout");

  const result =
    providerCode && paymentId
      ? await resolvePaymentReturn({
          providerCode,
          paymentId,
          sessionId,
          checkoutState,
          searchParams: new URLSearchParams(
            Object.entries(resolvedSearchParams).flatMap(([key, value]) =>
              Array.isArray(value)
                ? value.map((entry) => [key, entry])
                : value
                  ? [[key, value]]
                  : []
            )
          ),
        })
      : null;

  const status = result?.status ?? PaymentStatus.PENDING;
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <main className="min-h-screen bg-[#F8F9FA] px-5 py-12 font-sans">
      <div className="mx-auto max-w-xl">
        <Link
          href="/profile/wallet"
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au wallet
        </Link>

        <div className="rounded-[2.25rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-50 text-slate-700">
            <Icon className="h-10 w-10" />
          </div>

          <div
            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${config.badgeClassName}`}
          >
            {providerCode || "provider"}
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900">
            {config.title}
          </h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
            {result?.message ?? config.description}
          </p>

          {result?.payment ? (
            <div className="mt-8 rounded-[1.75rem] bg-slate-50 p-5">
              <div className="mb-4 flex items-center gap-3 text-slate-900">
                <CreditCard className="h-5 w-5" />
                <span className="text-sm font-black uppercase tracking-widest">
                  Détails du paiement
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-500">Transaction</span>
                  <span className="font-bold text-slate-900">{result.payment.id}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-500">Provider</span>
                  <span className="font-bold text-slate-900">{result.payment.provider.name}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-500">Montant</span>
                  <span className="font-bold text-slate-900">
                    {result.payment.localAmount} {result.payment.currencyCode}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-500">Swaps</span>
                  <span className="font-bold text-slate-900">{result.payment.swapsAmount} SC</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
