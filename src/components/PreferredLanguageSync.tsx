"use client";

import { useEffect } from "react";

import { routing } from "@/i18n/routing";

export default function PreferredLanguageSync({
  preferredLanguage,
}: {
  preferredLanguage?: string | null;
}) {
  useEffect(() => {
    if (
      !preferredLanguage ||
      !routing.locales.includes(preferredLanguage as (typeof routing.locales)[number])
    ) {
      return;
    }

    document.cookie = `SWAPLY_LOCALE=${preferredLanguage}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  }, [preferredLanguage]);

  return null;
}
