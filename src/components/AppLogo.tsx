"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

type AppLogoProps = {
  size?: number;
  alt?: string;
  className?: string;
  priority?: boolean;
};

export default function AppLogo({
  size = 48,
  alt = "Swaply",
  className,
  priority = false,
}: AppLogoProps) {
  return (
    <Image
      src="/Logo-512x512.png"
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={cn("object-cover", className)}
      sizes={`${size}px`}
    />
  );
}
