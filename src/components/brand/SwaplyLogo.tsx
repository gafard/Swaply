"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SwaplyLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  animate?: boolean;
  priority?: boolean;
}

export default function SwaplyLogo({
  size = 44,
  showText = false,
  className,
  animate,
  priority = false,
}: SwaplyLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center shrink-0 rounded-2xl overflow-hidden shadow-sm"
      >
        <Image
          src="/logo.png"
          alt="Swaply"
          width={size}
          height={size}
          priority={priority}
          className="h-full w-full object-contain"
        />
      </div>
      {showText && (
        <span className="font-display text-xl font-black tracking-tight text-foreground">
          Swaply
        </span>
      )}
    </div>
  );
}
