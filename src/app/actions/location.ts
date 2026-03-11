"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { routing } from "@/i18n/routing";
import { actionFail, actionOk } from "@/lib/actions/result";
import {
  ONBOARDING_COOKIE_NAME,
  PERSISTENT_COOKIE_MAX_AGE,
  serializeOnboardingCookie,
} from "@/lib/onboarding";
import prisma from "@/lib/prisma";
import { resolveLocationSelection } from "@/lib/geo.server";

export async function updateCurrentUserLocation(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return actionFail("auth_required");
  }

  try {
    const location = await resolveLocationSelection({
      countryId: formData.get("countryId")?.toString(),
      cityId: formData.get("cityId")?.toString(),
      zoneId: formData.get("zoneId")?.toString(),
    });

    const preferredLanguage = user.preferredLanguage ?? location.country.defaultLanguage;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        countryId: location.country.id,
        cityId: location.city.id,
        zoneId: location.zone.id,
        lat: location.zone.lat ?? location.city.lat,
        lng: location.zone.lng ?? location.city.lng,
        preferredLanguage,
        hasCompletedOnboarding: true,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set(ONBOARDING_COOKIE_NAME, serializeOnboardingCookie(true), {
      path: "/",
      sameSite: "lax",
      maxAge: PERSISTENT_COOKIE_MAX_AGE,
    });

    if (
      preferredLanguage &&
      routing.locales.includes(preferredLanguage as (typeof routing.locales)[number])
    ) {
      cookieStore.set("SWAPLY_LOCALE", preferredLanguage, {
        path: "/",
        sameSite: "lax",
        maxAge: PERSISTENT_COOKIE_MAX_AGE,
      });
    }

    revalidatePath("/");
    revalidatePath("/discover");
    revalidatePath("/favorites");
    revalidatePath("/onboarding");
    revalidatePath("/profile");
    revalidatePath("/publish");

    return actionOk("location_updated", {
      location: {
        countryName: location.country.name,
        cityName: location.city.name,
        zoneName: location.zone.name,
      },
    });
  } catch {
    return actionFail("location_invalid");
  }
}

export async function updatePreferredLanguage(nextLocale: string) {
  const user = await getCurrentUser();
  if (!user) {
    return actionFail("auth_required");
  }

  if (!routing.locales.includes(nextLocale as (typeof routing.locales)[number])) {
    return actionFail("invalid_locale");
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        preferredLanguage: nextLocale,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("SWAPLY_LOCALE", nextLocale, {
      path: "/",
      sameSite: "lax",
      maxAge: PERSISTENT_COOKIE_MAX_AGE,
    });

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/publish");

    return actionOk("language_updated", {
      locale: nextLocale,
    });
  } catch {
    return actionFail("unexpected_error");
  }
}
