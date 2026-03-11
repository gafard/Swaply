import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { localizeHref } from "@/lib/i18n/pathnames";
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
  const user = await getCurrentUser();

  if (!user) {
    return {
      locale,
      ok: false as const,
      targetPath: `${localizeHref(locale, "/login")}?next=${encodeURIComponent(nextPath)}`,
      hasCompletedOnboarding: false,
    };
  }

  const hasCompletedOnboarding = Boolean(user.hasCompletedOnboarding);
  const targetPath = hasCompletedOnboarding
    ? localizeHref(locale, nextPath)
    : `${localizeHref(locale, "/onboarding")}${
        nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : ""
      }`;

  return {
    locale,
    ok: true as const,
    targetPath,
    hasCompletedOnboarding,
  };
}

function applyBootstrapCookies(
  response: NextResponse,
  state: Awaited<ReturnType<typeof resolveBootstrapState>>
) {
  response.cookies.set(ONBOARDING_COOKIE_NAME, serializeOnboardingCookie(state.hasCompletedOnboarding), {
    path: "/",
    sameSite: "lax",
    maxAge: PERSISTENT_COOKIE_MAX_AGE,
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
  const response = NextResponse.redirect(new URL(state.targetPath, request.url));
  return applyBootstrapCookies(response, state);
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as BootstrapPayload;
  const state = await resolveBootstrapState(request, payload);
  const response = NextResponse.json(
    {
      ok: state.ok,
      targetPath: state.targetPath,
      hasCompletedOnboarding: state.hasCompletedOnboarding,
    },
    { status: state.ok ? 200 : 401 }
  );

  return applyBootstrapCookies(response, state);
}
