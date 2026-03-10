const LOCAL_FALLBACK_URL = "http://localhost:3000";

function sanitizeOrigin(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.origin.replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getPaymentBaseUrl(explicitOrigin?: string | null) {
  return (
    sanitizeOrigin(explicitOrigin) ??
    sanitizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ??
    sanitizeOrigin(process.env.APP_URL) ??
    sanitizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    LOCAL_FALLBACK_URL
  );
}

export function normalizeProviderCode(providerCode: string) {
  return providerCode.trim().toLowerCase();
}

export function isPhoneBasedProvider(providerCode: string) {
  return ["flooz", "tmoney", "mtnmo", "airtelmoney", "moovmoney"].includes(
    normalizeProviderCode(providerCode)
  );
}

export function getProviderEnvKey(providerCode: string, suffix: string) {
  const normalized = normalizeProviderCode(providerCode)
    .replace(/[^a-z0-9]+/g, "_")
    .toUpperCase();

  return `PAYMENT_PROVIDER_${normalized}_${suffix}`;
}

export function getProviderEnv(providerCode: string, suffix: string) {
  return process.env[getProviderEnvKey(providerCode, suffix)];
}

export function buildPaymentUrls(
  providerCode: string,
  paymentId: string,
  explicitOrigin?: string | null
) {
  const baseUrl = getPaymentBaseUrl(explicitOrigin);
  const provider = normalizeProviderCode(providerCode);

  return {
    baseUrl,
    webhookUrl: `${baseUrl}/api/payments/webhooks/${provider}`,
    returnUrl: `${baseUrl}/payments/return?provider=${provider}&paymentId=${paymentId}`,
    cancelUrl: `${baseUrl}/payments/return?provider=${provider}&paymentId=${paymentId}&checkout=cancelled`,
  };
}
