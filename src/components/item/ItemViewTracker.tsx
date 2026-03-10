"use client";

import { useEffect } from "react";

import { incrementItemView } from "@/app/actions/item";

const SESSION_STORAGE_KEY = "swaply:viewer-session";

function getViewerSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const nextValue =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `viewer-${Date.now()}`;

  window.localStorage.setItem(SESSION_STORAGE_KEY, nextValue);
  return nextValue;
}

export default function ItemViewTracker({ itemId }: { itemId: string }) {
  useEffect(() => {
    const sessionId = getViewerSessionId();
    incrementItemView(itemId, sessionId).catch(() => {
      // Metrics should not break the detail page experience.
    });
  }, [itemId]);

  return null;
}
