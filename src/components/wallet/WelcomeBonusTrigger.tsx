"use client";

import { useEffect } from "react";
import { triggerSwapGain } from "./SwapGainListener";

interface WelcomeBonusTriggerProps {
  userCreatedAt: string;
  hasWallet: boolean;
}

export default function WelcomeBonusTrigger({
  userCreatedAt,
  hasWallet,
}: WelcomeBonusTriggerProps) {
  useEffect(() => {
    const isNewUser = new Date().getTime() - new Date(userCreatedAt).getTime() < 1000 * 60 * 5; // 5 minutes
    const hasSeenBonus = localStorage.getItem("swaply_welcome_bonus_seen");

    if (isNewUser && hasWallet && !hasSeenBonus) {
      // Small delay to let the page load
      const timer = setTimeout(() => {
        triggerSwapGain(60);
        localStorage.setItem("swaply_welcome_bonus_seen", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [userCreatedAt, hasWallet]);

  return null;
}
