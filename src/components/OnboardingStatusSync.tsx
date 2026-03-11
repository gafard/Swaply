"use client";

import { useEffect } from "react";

import {
  ONBOARDING_COOKIE_NAME,
  PERSISTENT_COOKIE_MAX_AGE,
  serializeOnboardingCookie,
} from "@/lib/onboarding";

export default function OnboardingStatusSync({
  hasCompletedOnboarding,
}: {
  hasCompletedOnboarding?: boolean | null;
}) {
  useEffect(() => {
    if (typeof hasCompletedOnboarding !== "boolean") {
      return;
    }

    document.cookie = `${ONBOARDING_COOKIE_NAME}=${serializeOnboardingCookie(
      hasCompletedOnboarding
    )}; path=/; max-age=${PERSISTENT_COOKIE_MAX_AGE}; samesite=lax`;
  }, [hasCompletedOnboarding]);

  return null;
}
