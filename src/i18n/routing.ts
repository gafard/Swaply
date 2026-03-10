import {defineRouting} from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "es", "pt"],
  defaultLocale: "fr",
  localePrefix: "always",
  localeCookie: {
    name: "SWAPLY_LOCALE",
  },
});

export type AppLocale = (typeof routing.locales)[number];
