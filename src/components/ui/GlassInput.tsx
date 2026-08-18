"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, icon, rightElement, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-4 pointer-events-none text-foreground-muted flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-2xl border border-border bg-surface/70 px-4 py-3 text-sm text-foreground placeholder:text-muted backdrop-blur-xl transition-all outline-none",
            "focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10",
            icon && "pl-11",
            rightElement && "pr-12",
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";

export default GlassInput;
