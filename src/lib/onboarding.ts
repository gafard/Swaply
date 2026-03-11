import { routing } from "@/i18n/routing";
import { stripLocalePrefix } from "@/lib/i18n/pathnames";

export const ONBOARDING_COOKIE_NAME = "SWAPLY_ONBOARDED";
export const PERSISTENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseOnboardingCookie(value?: string | null) {
  if (value === "1") {
    return true;
  }

  if (value === "0") {
    return false;
  }

  return null;
}

export function serializeOnboardingCookie(hasCompletedOnboarding: boolean) {
  return hasCompletedOnboarding ? "1" : "0";
}

export function resolveRedirectLocale(locale?: string | null): string {
  if (
    locale &&
    routing.locales.includes(locale as (typeof routing.locales)[number])
  ) {
    return locale;
  }

  return routing.defaultLocale;
}

export function sanitizeNextPath(next?: string | null): string {
  if (!next) {
    return "/";
  }

  let decoded = next;
  try {
    decoded = decodeURIComponent(next);
  } catch {
    decoded = next;
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//")) {
    return "/";
  }

  const stripped = stripLocalePrefix(decoded);
  return stripped || "/";
}

export function normalizePostAuthPath(path: string) {
  if (path.startsWith("/login") || path.startsWith("/signup") || path.startsWith("/onboarding")) {
    return "/";
  }

  return path;
}
