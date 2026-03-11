import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { localizeHref } from "@/lib/i18n/pathnames";
import { TERMS_COOKIE_NAME, parseTermsCookie } from "@/lib/legal";
import {
  normalizePostAuthPath,
  ONBOARDING_COOKIE_NAME,
  parseOnboardingCookie,
} from "@/lib/onboarding";

function resolveLocaleFromPathname(pathname: string) {
  const [, segment] = pathname.split("/");
  return routing.locales.includes(segment as (typeof routing.locales)[number])
    ? segment
    : null;
}

function stripLocaleFromPathname(pathname: string) {
  const locale = resolveLocaleFromPathname(pathname);

  if (!locale) {
    return pathname;
  }

  const withoutLocale = pathname.slice(`/${locale}`.length);
  return withoutLocale || "/";
}

function resolveLocaleFromAcceptLanguage(headerValue: string | null) {
  if (!headerValue) {
    return null;
  }

  const candidates = headerValue
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const candidate of candidates) {
    const baseLocale = candidate.split("-")[0];

    if (routing.locales.includes(candidate as (typeof routing.locales)[number])) {
      return candidate;
    }

    if (routing.locales.includes(baseLocale as (typeof routing.locales)[number])) {
      return baseLocale;
    }
  }

  return null;
}

function resolveRequestLocale(request: NextRequest) {
  return (
    resolveLocaleFromPathname(request.nextUrl.pathname) ??
    (() => {
      const cookieLocale = request.cookies.get("SWAPLY_LOCALE")?.value;
      return routing.locales.includes(cookieLocale as (typeof routing.locales)[number])
        ? cookieLocale
        : null;
    })() ??
    resolveLocaleFromAcceptLanguage(request.headers.get("accept-language")) ??
    routing.defaultLocale
  );
}

export async function middleware(request: NextRequest) {
  const locale = resolveRequestLocale(request);
  const pathname = stripLocaleFromPathname(request.nextUrl.pathname);
  const nextPath = normalizePostAuthPath(`${pathname}${request.nextUrl.search}`);

  if (!resolveLocaleFromPathname(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.cookies.set("SWAPLY_LOCALE", locale);
    return redirectResponse;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-swaply-locale", locale);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.cookies.set("SWAPLY_LOCALE", locale);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          response.cookies.set("SWAPLY_LOCALE", locale);
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if unauthenticated on protected routes
  const protectedPaths = ["/publish", "/exchange", "/discover", "/favorites", "/profile"];
  const isProtectedRoute = protectedPaths.some((path) => pathname.startsWith(path));
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.cookies.set("SWAPLY_LOCALE", locale);
    return redirectResponse;
  }

  const onboardingCookie = parseOnboardingCookie(
    request.cookies.get(ONBOARDING_COOKIE_NAME)?.value
  );
  const termsCookie = parseTermsCookie(request.cookies.get(TERMS_COOKIE_NAME)?.value);
  const isOnboardingRoute = pathname.startsWith("/onboarding");

  if (user && (termsCookie === null || termsCookie === false || onboardingCookie === null)) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/auth/bootstrap";
    url.search = `?locale=${encodeURIComponent(locale)}&next=${encodeURIComponent(nextPath)}`;

    return NextResponse.redirect(url);
  }

  if (user && termsCookie === true && onboardingCookie === false && !isOnboardingRoute) {
    const url = request.nextUrl.clone();
    url.pathname = localizeHref(locale, "/onboarding");
    url.search = nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : "";

    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.cookies.set("SWAPLY_LOCALE", locale);
    return redirectResponse;
  }

  // Redirect to home if logged in and trying to access auth pages
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  if (user && termsCookie === true && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname =
      onboardingCookie === false ? localizeHref(locale, "/onboarding") : `/${locale}`;
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.cookies.set("SWAPLY_LOCALE", locale);
    return redirectResponse;
  }

  if (user && termsCookie === true && onboardingCookie === true && isOnboardingRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.cookies.set("SWAPLY_LOCALE", locale);
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)"
  ],
};
