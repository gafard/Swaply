export const TERMS_VERSION = "2026-03-11";

export type TermsAcceptance = {
  acceptedTermsAt: Date | null;
  acceptedTermsVersion: string | null;
};

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
