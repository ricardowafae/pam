"use client";

import { useState, useCallback } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

type PresetDays = 7 | 30 | 90 | 360;

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets: { label: string; days: PresetDays }[] = [
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
  { label: "360 dias", days: 360 },
];

function toInputDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getActivePreset(range: DateRange): PresetDays | null {
  if (!range.start || !range.end) return null;
  const diffMs = range.end.getTime() - range.start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  for (const p of presets) {
    if (diffDays === p.days || diffDays === p.days - 1) return p.days;
  }
  return null;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const activePreset = getActivePreset(value);

  const applyPreset = useCallback(
    (days: PresetDays) => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setDate(start.getDate() - days);
      start.setHours(0, 0, 0, 0);
      onChange({ start, end });
      setCustomStart("");
      setCustomEnd("");
    },
    [onChange]
  );

  const applyCustom = () => {
    if (!customStart || !customEnd) return;
    const start = new Date(customStart + "T00:00:00");
    const end = new Date(customEnd + "T23:59:59.999");
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
    onChange({ start, end });
  };

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Calendar className="size-4 text-muted-foreground" />
        Periodo de Analise
      </div>

      {/* Presets */}
      <div className="mt-3 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.days}
            onClick={() => applyPreset(p.days)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              activePreset === p.days
                ? "border-[#8b5e5e] bg-[#8b5e5e] text-white"
                : "border-input bg-background text-foreground hover:bg-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom range */}
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-[10px] font-medium text-muted-foreground">
            Data Inicial
          </label>
          <Input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="mt-0.5 h-8 w-36 text-xs"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground">
            Data Final
          </label>
          <Input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="mt-0.5 h-8 w-36 text-xs"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={applyCustom}
          disabled={!customStart || !customEnd}
          className="h-8 text-xs"
        >
          Aplicar Periodo
        </Button>
      </div>
    </div>
  );
}

/** Helper: check if a date string falls within a DateRange */
export function isInRange(dateStr: string, range: DateRange): boolean {
  if (!range.start || !range.end) return true;
  const d = new Date(dateStr);
  return d >= range.start && d <= range.end;
}

/** Returns a default 30-day range */
export function getDefault30DayRange(): DateRange {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setDate(start.getDate() - 30);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}
