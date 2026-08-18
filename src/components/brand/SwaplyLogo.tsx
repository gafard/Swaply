"use client";

import React from "react";
import SwaplyVectorLogo from "./SwaplyVectorLogo";

interface SwaplyLogoProps {
  size?: number;
  showText?: boolean;
  showSlogan?: boolean;
  className?: string;
  animate?: boolean;
  priority?: boolean;
}

export default function SwaplyLogo({
  size = 46,
  showText = false,
  showSlogan = false,
  className,
  animate = true,
}: SwaplyLogoProps) {
  return (
    <SwaplyVectorLogo
      size={size}
      showText={showText}
      showSlogan={showSlogan}
      className={className}
      animate={animate}
    />
  );
}
