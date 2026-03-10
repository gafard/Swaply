import { routing } from "@/i18n/routing";

export function stripLocalePrefix(pathname: string) {
  const parts = pathname.split("/");
  const locale = parts[1];

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return pathname || "/";
  }

  const stripped = pathname.slice(`/${locale}`.length);
  return stripped || "/";
}

export function localizeHref(locale: string, href: string) {
  if (/^https?:\/\//.test(href)) {
    return href;
  }

  const normalizedHref = href.startsWith("/") ? href : `/${href}`;
  if (normalizedHref === "/") {
    return `/${locale}`;
  }

  return `/${locale}${normalizedHref}`;
}
