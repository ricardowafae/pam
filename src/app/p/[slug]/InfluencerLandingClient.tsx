"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveInfluencerTracking } from "@/lib/influencer-tracking";

interface Props {
  slug: string;
  name: string;
  couponCode: string;
  discountValue: number;
  discountType: string;
}

/**
 * Client component that:
 * 1. Saves influencer tracking to localStorage
 * 2. Fires a tracking API call
 * 3. Redirects to the home page
 *
 * The user lands here from the influencer's shared link (e.g. /p/julianalemos)
 * and is immediately redirected to the real site with tracking persisted.
 */
export default function InfluencerLandingClient({
  slug,
  name,
  couponCode,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    // 1. Save tracking to localStorage
    saveInfluencerTracking(slug, couponCode, name);

    // Notify CartProvider (may already be mounted in root layout)
    window.dispatchEvent(new CustomEvent("pam-influencer-tracking"));

    // 2. Fire tracking API call (fire and forget)
    const sessionId =
      sessionStorage.getItem("pam_session_id") ?? generateSessionId();
    sessionStorage.setItem("pam_session_id", sessionId);

    const visitorId =
      localStorage.getItem("pam_visitor_id") ?? generateVisitorId();
    localStorage.setItem("pam_visitor_id", visitorId);

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_path: `/p/${slug}`,
        influencer_slug: slug,
        session_id: sessionId,
        visitor_id: visitorId,
        referrer: document.referrer || null,
      }),
    }).catch(() => {
      // silently fail — tracking should never block the user
    });

    // 3. Redirect to home page
    router.replace("/");
  }, [slug, couponCode, name, router]);

  // Show a brief loading state while redirecting
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">
          Redirecionando...
        </p>
      </div>
    </div>
  );
}

function generateSessionId(): string {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateVisitorId(): string {
  return `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
