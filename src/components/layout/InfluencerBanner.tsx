"use client";

import { useState, useEffect } from "react";
import { Heart, X } from "lucide-react";
import {
  getInfluencerTracking,
  clearInfluencerTracking,
} from "@/lib/influencer-tracking";

/**
 * Global banner that shows "Indicado por {name}" across all site pages
 * when the user arrived via an influencer link.
 */
export default function InfluencerBanner() {
  const [name, setName] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const tracking = getInfluencerTracking();
    if (tracking?.name) {
      setName(tracking.name);
      setVisible(true);
    }
  }, []);

  if (!visible || !name) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20">
      <div className="mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-center gap-2 text-sm relative">
        <Heart className="size-3.5 text-primary fill-primary" />
        <span className="text-foreground">
          Indicado por{" "}
          <strong className="text-primary">{name}</strong>
        </span>
        <Heart className="size-3.5 text-primary fill-primary" />

        <button
          type="button"
          onClick={() => {
            clearInfluencerTracking();
            setVisible(false);
          }}
          className="absolute right-4 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          aria-label="Remover indicacao"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
