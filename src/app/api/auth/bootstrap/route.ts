import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserResolution } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { localizeHref } from "@/lib/i18n/pathnames";
import {
  TERMS_COOKIE_NAME,
  TERMS_COOKIE_MAX_AGE,
  serializeTermsCookie,
} from "@/lib/legal";
import {
  normalizePostAuthPath,
  ONBOARDING_COOKIE_NAME,
  PERSISTENT_COOKIE_MAX_AGE,
  resolveRedirectLocale,
  sanitizeNextPath,
  serializeOnboardingCookie,
} from "@/lib/onboarding";

type BootstrapPayload = {
  locale?: string | null;
  next?: string | null;
};

async function resolveBootstrapState(request: NextRequest, payload?: BootstrapPayload) {
  const locale = resolveRedirectLocale(
    payload?.locale ??
      request.nextUrl.searchParams.get("locale") ??
      request.cookies.get("SWAPLY_LOCALE")?.value
  );
  const nextPath = normalizePostAuthPath(
    sanitizeNextPath(payload?.next ?? request.nextUrl.searchParams.get("next"))
  );
  const resolution = await getCurrentUserResolution();

  if (resolution.status === "unauthenticated") {
    return {
      locale,
      ok: false as const,
      reason: "unauthenticated" as const,
      targetPath: `${localizeHref(locale, "/login")}?next=${encodeURIComponent(nextPath)}`,
      hasAcceptedTerms: false,
      hasCompletedOnboarding: false,
    };
  }

  if (resolution.status === "missing_terms") {
    return {
      locale,
      ok: false as const,
      reason: "missing_terms" as const,
      targetPath: `${localizeHref(locale, "/signup")}?next=${encodeURIComponent(nextPath)}&terms=required`,
      hasAcceptedTerms: false,
      hasCompletedOnboarding: false,
    };
  }

  const user = resolution.user;
  const hasCompletedOnboarding = Boolean(user.hasCompletedOnboarding);
  const targetPath = hasCompletedOnboarding
    ? localizeHref(locale, nextPath)
    : `${localizeHref(locale, "/onboarding")}${
        nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : ""
      }`;

  return {
    locale,
    ok: true as const,
    reason: "ok" as const,
    targetPath,
    hasAcceptedTerms: true,
    hasCompletedOnboarding,
  };
}

function applyBootstrapCookies(
  response: NextResponse,
  state: Awaited<ReturnType<typeof resolveBootstrapState>>
) {
  response.cookies.set(
    ONBOARDING_COOKIE_NAME,
    serializeOnboardingCookie(state.hasCompletedOnboarding),
    {
      path: "/",
      sameSite: "lax",
      maxAge: PERSISTENT_COOKIE_MAX_AGE,
    }
  );

  response.cookies.set(TERMS_COOKIE_NAME, serializeTermsCookie(state.hasAcceptedTerms), {
    path: "/",
    sameSite: "lax",
    maxAge: TERMS_COOKIE_MAX_AGE,
  });

  response.cookies.set("SWAPLY_LOCALE", state.locale, {
    path: "/",
    sameSite: "lax",
    maxAge: PERSISTENT_COOKIE_MAX_AGE,
  });

  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const state = await resolveBootstrapState(request);
  if (state.reason === "missing_terms") {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  const response = NextResponse.redirect(new URL(state.targetPath, request.url));
  return applyBootstrapCookies(response, state);
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as BootstrapPayload;
  const state = await resolveBootstrapState(request, payload);
  if (state.reason === "missing_terms") {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  const response = NextResponse.json(
    {
      ok: state.ok,
      reason: state.reason,
      targetPath: state.targetPath,
      hasAcceptedTerms: state.hasAcceptedTerms,
      hasCompletedOnboarding: state.hasCompletedOnboarding,
    },
    { status: state.ok ? 200 : 401 }
  );

  return applyBootstrapCookies(response, state);
}
