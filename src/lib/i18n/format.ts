import { formatDistanceToNow } from "date-fns";
import { enUS, es, fr, ptBR } from "date-fns/locale";

function resolveLocale(locale?: string | null) {
  if (locale && locale.trim()) {
    return locale;
  }

  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || "en";
  } catch {
    return "en";
  }
}

function resolveDateFnsLocale(locale?: string | null) {
  const normalized = resolveLocale(locale).toLowerCase();

  if (normalized.startsWith("fr")) {
    return fr;
  }

  if (normalized.startsWith("es")) {
    return es;
  }

  if (normalized.startsWith("pt")) {
    return ptBR;
  }

  return enUS;
}

export function formatDate(
  locale: string | null | undefined,
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat(resolveLocale(locale), options).format(new Date(value));
}

export function formatNumber(
  locale: string | null | undefined,
  value: number,
  options?: Intl.NumberFormatOptions
) {
  return new Intl.NumberFormat(resolveLocale(locale), options).format(value);
}

export function formatCurrency(
  locale: string | null | undefined,
  amount: number,
  currencyCode: string
) {
  try {
    return new Intl.NumberFormat(resolveLocale(locale), {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currencyCode}`;
  }
}

export function formatRelativeTime(
  locale: string | null | undefined,
  value: Date | string | number
) {
  return formatDistanceToNow(new Date(value), {
    addSuffix: true,
    locale: resolveDateFnsLocale(locale),
  });
}
