import { PaymentStatus } from "@prisma/client";

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

function pickStringCandidate(candidates: unknown[]) {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return null;
}

export function toStripeAmount(amount: number, currencyCode: string) {
  const currency = currencyCode.toLowerCase();
  return ZERO_DECIMAL_CURRENCIES.has(currency) ? amount : Math.round(amount * 100);
}

export function mapProviderStatus(value?: string | null) {
  const normalized = value?.trim().toLowerCase() ?? "";

  if (
    ["paid", "success", "successful", "succeeded", "completed", "complete", "approved"].includes(
      normalized
    )
  ) {
    return PaymentStatus.SUCCESS;
  }

  if (
    ["failed", "failure", "declined", "error", "expired"].includes(normalized)
  ) {
    return PaymentStatus.FAILED;
  }

  if (["cancelled", "canceled", "abandoned"].includes(normalized)) {
    return PaymentStatus.CANCELLED;
  }

  return PaymentStatus.PENDING;
}

export function parseJsonSafely(value: string) {
  try {
    return JSON.parse(value) as Record<string, any>;
  } catch {
    return null;
  }
}

export function extractProviderRef(payload: Record<string, any>) {
  return pickStringCandidate([
    payload.providerRef,
    payload.reference,
    payload.transactionRef,
    payload.transactionId,
    payload.paymentId,
    payload.id,
    payload.data?.id,
    payload.data?.reference,
    payload.data?.paymentId,
    payload.data?.transactionId,
  ]);
}

export function extractPaymentId(payload: Record<string, any>) {
  return pickStringCandidate([
    payload.paymentId,
    payload.reference,
    payload.metadata?.paymentId,
    payload.data?.metadata?.paymentId,
    payload.data?.paymentId,
  ]);
}

export function extractStatus(payload: Record<string, any>) {
  return mapProviderStatus(
    pickStringCandidate([
      payload.status,
      payload.paymentStatus,
      payload.state,
      payload.event,
      payload.data?.status,
      payload.data?.paymentStatus,
      payload.data?.state,
      payload.type,
    ])
  );
}
