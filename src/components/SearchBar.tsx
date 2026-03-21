"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Rechercher un objet...", 
  className 
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const debounce = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(debounce);
  }, [value, onSearch]);

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "flex items-center gap-2 rounded-[30px] border px-4 py-3.5 transition-all duration-200 shadow-[0_18px_40px_rgba(16,32,58,0.06)]",
        isFocused
          ? "border-indigo-300 bg-white ring-4 ring-indigo-100/70"
          : "border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,252,247,0.88))]"
      )}>
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-[18px] transition-colors",
          isFocused ? "bg-indigo-50 text-indigo-500" : "bg-[#eef3ff] text-[#2457ff]"
        )}>
          <Search className="h-4.5 w-4.5" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
        />
        {value && (
          <button
            onClick={() => setValue("")}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200"
          >
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        )}
      </div>
    </div>
  );
}
