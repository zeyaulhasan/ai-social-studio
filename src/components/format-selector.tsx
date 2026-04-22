"use client";

import { cn } from "@/lib/utils";
import type { ContentFormat } from "@/types/carousel";

const options: Array<{ label: string; value: ContentFormat }> = [
  { label: "Post 1:1", value: "post" },
  { label: "Story 9:16", value: "story" },
  { label: "Carousel", value: "carousel" },
];

interface FormatSelectorProps {
  value: ContentFormat;
  onChange: (value: ContentFormat) => void;
}

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white/80 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-xl px-3 py-1.5 text-xs font-medium transition sm:text-sm",
            value === option.value
              ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
