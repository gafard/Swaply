"use client";

import { useEffect, useMemo, useState } from "react";

import { triggerSwapGain } from "./SwapGainListener";
import WelcomeSwapsSheet from "./WelcomeSwapsSheet";

const WELCOME_BONUS_STORAGE_KEY = "swaply_welcome_bonus_seen_v2";
const MAX_ELIGIBLE_DAYS = 14;

interface WelcomeBonusTriggerProps {
  userCreatedAt: string;
  promoSwaps: number;
  availableSwaps: number;
}

export default function WelcomeBonusTrigger({
  userCreatedAt,
  promoSwaps,
  availableSwaps,
}: WelcomeBonusTriggerProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isEligible = useMemo(() => {
    if (promoSwaps <= 0) {
      return false;
    }

    const createdAt = new Date(userCreatedAt).getTime();
    return Date.now() - createdAt < MAX_ELIGIBLE_DAYS * 24 * 60 * 60 * 1000;
  }, [promoSwaps, userCreatedAt]);

  useEffect(() => {
    if (!isEligible) {
      return;
    }

    const hasSeenBonus = localStorage.getItem(WELCOME_BONUS_STORAGE_KEY);
    if (hasSeenBonus) {
      return;
    }

    const gainTimer = window.setTimeout(() => {
      triggerSwapGain(promoSwaps);
    }, 450);

    const sheetTimer = window.setTimeout(() => {
      setIsSheetOpen(true);
      localStorage.setItem(WELCOME_BONUS_STORAGE_KEY, "1");
    }, 1100);

    return () => {
      window.clearTimeout(gainTimer);
      window.clearTimeout(sheetTimer);
    };
  }, [isEligible, promoSwaps]);

  return (
    <WelcomeSwapsSheet
      isOpen={isSheetOpen}
      onClose={() => setIsSheetOpen(false)}
      promoSwaps={promoSwaps}
      availableSwaps={availableSwaps}
    />
  );
}
