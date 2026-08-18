"use client";

import React from "react";
import SwaplyLogo from "@/components/brand/SwaplyLogo";

interface AppLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export default function AppLogo({ size = 44, className, priority = false }: AppLogoProps) {
  return <SwaplyLogo size={size} className={className} animate priority={priority} />;
}
