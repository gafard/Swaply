"use client";

import { useEffect, useState } from "react";
import SwapGainAnimation from "./SwapGainAnimation";

export default function SwapGainListener() {
  const [gain, setGain] = useState<{ amount: number; show: boolean }>({
    amount: 0,
    show: false,
  });

  useEffect(() => {
    const handleGain = (event: any) => {
      const amount = event.detail?.amount || 0;
      if (amount > 0) {
        setGain({ amount, show: true });
      }
    };

    window.addEventListener("swap-gain", handleGain);
    return () => window.removeEventListener("swap-gain", handleGain);
  }, []);

  return (
    <SwapGainAnimation
      amount={gain.amount}
      show={gain.show}
      onComplete={() => setGain((prev) => ({ ...prev, show: false }))}
    />
  );
}

/**
 * Utility to trigger a swap gain animation from anywhere in the client
 */
export const triggerSwapGain = (amount: number) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("swap-gain", { detail: { amount } }));
  }
};
