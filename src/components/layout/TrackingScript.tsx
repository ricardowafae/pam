"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getInfluencerTracking } from "@/lib/influencer-tracking";

/**
 * Invisible component that fires tracking calls on every page navigation
 * when an influencer tracking session is active.
 *
 * Included once in the website layout.
 */
export default function TrackingScript() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid double-tracking the same path
    if (pathname === lastTrackedPath.current) return;
    lastTrackedPath.current = pathname;

    const tracking = getInfluencerTracking();
    if (!tracking) return;

    // Ensure session and visitor IDs exist
    const sessionId =
      sessionStorage.getItem("pam_session_id") ??
      `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem("pam_session_id", sessionId);

    const visitorId =
      localStorage.getItem("pam_visitor_id") ??
      `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("pam_visitor_id", visitorId);

    // Fire and forget
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_path: pathname,
        influencer_slug: tracking.slug,
        session_id: sessionId,
        visitor_id: visitorId,
        referrer: document.referrer || null,
      }),
    }).catch(() => {
      // tracking should never block the user
    });
  }, [pathname]);

  return null;
}
