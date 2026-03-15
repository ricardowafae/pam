/**
 * Client-side influencer tracking via localStorage.
 * Persists the influencer slug, coupon code, and name so that
 * attribution survives navigation across the entire site.
 */

const STORAGE_KEY = "pam_influencer";
const EXPIRY_DAYS = 30;

export interface InfluencerTracking {
  slug: string;
  couponCode: string;
  name: string;
  timestamp: number;
}

/** Save influencer tracking data to localStorage. */
export function saveInfluencerTracking(
  slug: string,
  couponCode: string,
  name: string
): void {
  if (typeof window === "undefined") return;
  try {
    const data: InfluencerTracking = {
      slug,
      couponCode,
      name,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // silently fail (e.g. storage full, private browsing)
  }
}

/** Read influencer tracking data. Returns null if missing or expired (30 days). */
export function getInfluencerTracking(): InfluencerTracking | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data: InfluencerTracking = JSON.parse(raw);
    const elapsed = Date.now() - data.timestamp;
    const maxAge = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    if (elapsed > maxAge) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/** Remove influencer tracking data from localStorage. */
export function clearInfluencerTracking(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently fail
  }
}

/** Convenience: get just the influencer slug, or null. */
export function getInfluencerSlug(): string | null {
  return getInfluencerTracking()?.slug ?? null;
}
