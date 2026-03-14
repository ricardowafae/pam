"use client";

import { cn } from "@/lib/utils";
import { PawPrint } from "lucide-react";

interface PawRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function PawRating({
  value,
  onChange,
  max = 5,
  readOnly = false,
  size = "md",
}: PawRatingProps) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < value;
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(i + 1)}
            className={cn(
              "transition-colors",
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"
            )}
          >
            <PawPrint
              className={cn(
                sizeClasses[size],
                "transition-colors",
                filled
                  ? "text-[#c4956a] fill-[#c4956a]"
                  : "text-[#c4956a]/25"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
