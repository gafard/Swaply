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
        "flex items-center gap-2 bg-white border rounded-2xl px-4 py-3 transition-all duration-200",
        isFocused ? "border-indigo-500 ring-2 ring-indigo-100" : "border-slate-200"
      )}>
        <Search className={cn(
          "w-5 h-5 transition-colors",
          isFocused ? "text-indigo-500" : "text-slate-400"
        )} />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
        />
        {value && (
          <button
            onClick={() => setValue("")}
            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        )}
      </div>
    </div>
  );
}
