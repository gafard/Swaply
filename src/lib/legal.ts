export const TERMS_VERSION = "2026-03-11";
export const TERMS_COOKIE_NAME = "SWAPLY_TERMS_ACCEPTED";
export const TERMS_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type TermsAcceptance = {
  acceptedTermsAt: Date | null;
  acceptedTermsVersion: string | null;
};

export function parseTermsCookie(value?: string | null) {
  if (value === "1") {
    return true;
  }

  if (value === "0") {
    return false;
  }

  return null;
}

export function serializeTermsCookie(hasAcceptedTerms: boolean) {
  return hasAcceptedTerms ? "1" : "0";
}

export function readTermsAcceptanceFromMetadata(metadata: unknown): TermsAcceptance {
  if (!metadata || typeof metadata !== "object") {
    return {
      acceptedTermsAt: null,
      acceptedTermsVersion: null,
    };
  }

  const record = metadata as Record<string, unknown>;
  const version =
    typeof record.accepted_terms_version === "string" ? record.accepted_terms_version : null;
  const rawAcceptedAt =
    typeof record.accepted_terms_at === "string" ? record.accepted_terms_at : null;

  if (!rawAcceptedAt) {
    return {
      acceptedTermsAt: null,
      acceptedTermsVersion: version,
    };
  }

  const parsed = new Date(rawAcceptedAt);
  return {
    acceptedTermsAt: Number.isNaN(parsed.getTime()) ? null : parsed,
    acceptedTermsVersion: version,
  };
}
