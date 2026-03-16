-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Move all demo/fictional data to January 2026
-- Purpose: Concentrate all test data in a single month (Jan 2026) so it
--          doesn't interfere with real data once the site goes live.
--
-- Strategy: For each row, calculate the day offset relative to the earliest
--           record in that table, then place it within Jan 1-31, 2026.
--           This preserves relative chronological ordering.
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper: Clamp a day-of-month to 1-28 (safe for any month)
-- We'll map records proportionally across Jan 1-28 based on their original ordering.

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. CUSTOMERS — created_at, updated_at
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE customers
SET
  created_at = '2026-01-01T00:00:00Z'::timestamptz
    + (
        EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM customers)))
        / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM customers) - (SELECT MIN(created_at) FROM customers))), 1)
      ) * INTERVAL '27 days'
    + (random() * INTERVAL '12 hours'),
  updated_at = '2026-01-01T00:00:00Z'::timestamptz
    + (
        EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM customers)))
        / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM customers) - (SELECT MIN(created_at) FROM customers))), 1)
      ) * INTERVAL '27 days'
    + INTERVAL '1 hour'
WHERE created_at < '2026-02-01' OR created_at > '2026-01-31';

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. PETS — created_at
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE pets
SET created_at = c.created_at
FROM customers c
WHERE pets.customer_id = c.id;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. ORDERS — created_at, updated_at, paid_at, shipped_at, delivered_at
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE orders
SET
  created_at = '2026-01-02T09:00:00Z'::timestamptz
    + (
        EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM orders)))
        / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM orders) - (SELECT MIN(created_at) FROM orders))), 1)
      ) * INTERVAL '26 days'
    + (random() * INTERVAL '8 hours'),
  updated_at = '2026-01-02T10:00:00Z'::timestamptz
    + (
        EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM orders)))
        / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM orders) - (SELECT MIN(created_at) FROM orders))), 1)
      ) * INTERVAL '26 days'
    + (random() * INTERVAL '8 hours'),
  paid_at = CASE
    WHEN paid_at IS NOT NULL THEN
      '2026-01-02T10:30:00Z'::timestamptz
        + (
            EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM orders)))
            / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM orders) - (SELECT MIN(created_at) FROM orders))), 1)
          ) * INTERVAL '26 days'
    ELSE NULL
  END,
  shipped_at = CASE
    WHEN shipped_at IS NOT NULL THEN
      '2026-01-05T10:00:00Z'::timestamptz
        + (
            EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM orders)))
            / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM orders) - (SELECT MIN(created_at) FROM orders))), 1)
          ) * INTERVAL '26 days'
    ELSE NULL
  END,
  delivered_at = CASE
    WHEN delivered_at IS NOT NULL THEN
      '2026-01-08T14:00:00Z'::timestamptz
        + (
            EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM orders)))
            / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM orders) - (SELECT MIN(created_at) FROM orders))), 1)
          ) * INTERVAL '26 days'
    ELSE NULL
  END;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. ORDER_ITEMS — created_at (match parent order)
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE order_items
SET created_at = o.created_at
FROM orders o
WHERE order_items.order_id = o.id;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. DOGBOOKS — created_at, updated_at, deadline_creative, approved_at
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE dogbooks
SET
  created_at = o.created_at,
  updated_at = o.updated_at,
  deadline_creative = CASE
    WHEN deadline_creative IS NOT NULL THEN o.created_at + INTERVAL '14 days'
    ELSE NULL
  END,
  approved_at = CASE
    WHEN approved_at IS NOT NULL THEN o.created_at + INTERVAL '10 days'
    ELSE NULL
  END
FROM orders o
WHERE dogbooks.order_id = o.id;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. DOGBOOK_TRAITS — created_at
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE dogbook_traits
SET created_at = d.created_at
FROM dogbooks d
WHERE dogbook_traits.dogbook_id = d.id;

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. PHOTOGRAPHERS — created_at, updated_at, work_period_start, work_period_end
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE photographers
SET
  created_at = '2026-01-01T08:00:00Z'::timestamptz
    + (ROW_NUMBER() OVER (ORDER BY created_at) - 1) * INTERVAL '2 days',
  updated_at = '2026-01-01T09:00:00Z'::timestamptz
    + (ROW_NUMBER() OVER (ORDER BY created_at) - 1) * INTERVAL '2 days',
  work_period_start = CASE
    WHEN work_period_start IS NOT NULL THEN '2026-01-01'::date
    ELSE NULL
  END,
  work_period_end = CASE
    WHEN work_period_end IS NOT NULL THEN '2026-12-31'::date
    ELSE NULL
  END;

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. PHOTO_SESSIONS — created_at, updated_at, scheduled_date
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE photo_sessions
SET
  created_at = '2026-01-05T10:00:00Z'::timestamptz
    + (
        EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM photo_sessions)))
        / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM photo_sessions) - (SELECT MIN(created_at) FROM photo_sessions))), 1)
      ) * INTERVAL '23 days',
  updated_at = '2026-01-05T11:00:00Z'::timestamptz
    + (
        EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM photo_sessions)))
        / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM photo_sessions) - (SELECT MIN(created_at) FROM photo_sessions))), 1)
      ) * INTERVAL '23 days',
  scheduled_date = CASE
    WHEN scheduled_date IS NOT NULL THEN
      '2026-01-10'::date
        + (
            EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM photo_sessions)))
            / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM photo_sessions) - (SELECT MIN(created_at) FROM photo_sessions))), 1)
          ) * 18 * INTERVAL '1 day'
    ELSE NULL
  END;

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. INFLUENCERS — created_at, updated_at
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE influencers
SET
  created_at = '2026-01-01T08:00:00Z'::timestamptz
    + (ROW_NUMBER() OVER (ORDER BY created_at) - 1) * INTERVAL '1 day',
  updated_at = '2026-01-01T09:00:00Z'::timestamptz
    + (ROW_NUMBER() OVER (ORDER BY created_at) - 1) * INTERVAL '1 day';

-- ═══════════════════════════════════════════════════════════════════════════
-- 10. COUPONS — created_at, valid_until
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE coupons
SET
  created_at = '2026-01-01T00:00:00Z'::timestamptz,
  valid_until = CASE
    WHEN valid_until IS NOT NULL THEN '2026-06-30T23:59:59Z'::timestamptz
    ELSE NULL
  END
WHERE code NOT IN ('FIXED_WELCOME10', 'FIXED_VOLTA5', 'FIXED_FRETE_GRATIS');

-- ═══════════════════════════════════════════════════════════════════════════
-- 11. COUPON_USAGES — used_at
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE coupon_usages
SET used_at = o.created_at
FROM orders o
WHERE coupon_usages.order_id = o.id;

-- ═══════════════════════════════════════════════════════════════════════════
-- 12. COMMISSIONS — created_at, paid_at, period_month, period_year
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE commissions
SET
  period_month = 1,
  period_year = 2026,
  created_at = '2026-01-15T10:00:00Z'::timestamptz
    + (
        EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM commissions)))
        / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM commissions) - (SELECT MIN(created_at) FROM commissions))), 1)
      ) * INTERVAL '14 days',
  paid_at = CASE
    WHEN paid_at IS NOT NULL THEN '2026-01-20T10:00:00Z'::timestamptz
      + (
          EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM commissions)))
          / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM commissions) - (SELECT MIN(created_at) FROM commissions))), 1)
        ) * INTERVAL '10 days'
    ELSE NULL
  END;

-- ═══════════════════════════════════════════════════════════════════════════
-- 13. GALLERY_PHOTOS — created_at, updated_at
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE gallery_photos
SET
  created_at = '2026-01-10T10:00:00Z'::timestamptz
    + (
        EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM gallery_photos)))
        / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM gallery_photos) - (SELECT MIN(created_at) FROM gallery_photos))), 1)
      ) * INTERVAL '18 days',
  updated_at = '2026-01-10T11:00:00Z'::timestamptz
    + (
        EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM gallery_photos)))
        / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM gallery_photos) - (SELECT MIN(created_at) FROM gallery_photos))), 1)
      ) * INTERVAL '18 days';

-- ═══════════════════════════════════════════════════════════════════════════
-- 14. GIFT_CARDS — created_at, updated_at, expires_at, redeemed_at
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE gift_cards
SET
  created_at = '2026-01-05T10:00:00Z'::timestamptz
    + (
        EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM gift_cards)))
        / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM gift_cards) - (SELECT MIN(created_at) FROM gift_cards))), 1)
      ) * INTERVAL '20 days',
  updated_at = '2026-01-05T11:00:00Z'::timestamptz
    + (
        EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM gift_cards)))
        / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM gift_cards) - (SELECT MIN(created_at) FROM gift_cards))), 1)
      ) * INTERVAL '20 days',
  expires_at = CASE
    WHEN expires_at IS NOT NULL THEN '2026-07-31T23:59:59Z'::timestamptz
    ELSE NULL
  END,
  redeemed_at = CASE
    WHEN redeemed_at IS NOT NULL THEN '2026-01-20T14:00:00Z'::timestamptz
    ELSE NULL
  END;

-- ═══════════════════════════════════════════════════════════════════════════
-- 15. LEADS — created_at, updated_at
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE leads
SET
  created_at = '2026-01-03T08:00:00Z'::timestamptz
    + (
        EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM leads)))
        / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM leads) - (SELECT MIN(created_at) FROM leads))), 1)
      ) * INTERVAL '25 days',
  updated_at = '2026-01-03T09:00:00Z'::timestamptz
    + (
        EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM leads)))
        / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM leads) - (SELECT MIN(created_at) FROM leads))), 1)
      ) * INTERVAL '25 days';

-- ═══════════════════════════════════════════════════════════════════════════
-- 16. MESSAGES — created_at
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE messages
SET
  created_at = '2026-01-05T10:00:00Z'::timestamptz
    + (
        EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM messages)))
        / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM messages) - (SELECT MIN(created_at) FROM messages))), 1)
      ) * INTERVAL '23 days';

-- ═══════════════════════════════════════════════════════════════════════════
-- 17. CAMPAIGNS — created_at, scheduled_at, sent_at
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE campaigns
SET
  created_at = '2026-01-05T08:00:00Z'::timestamptz
    + (
        EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM campaigns)))
        / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM campaigns) - (SELECT MIN(created_at) FROM campaigns))), 1)
      ) * INTERVAL '22 days',
  scheduled_at = CASE
    WHEN scheduled_at IS NOT NULL THEN '2026-01-10T09:00:00Z'::timestamptz
    ELSE NULL
  END,
  sent_at = CASE
    WHEN sent_at IS NOT NULL THEN '2026-01-10T09:30:00Z'::timestamptz
    ELSE NULL
  END;

-- ═══════════════════════════════════════════════════════════════════════════
-- 18. AUTO_MESSAGES — created_at
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE auto_messages
SET created_at = '2026-01-01T00:00:00Z'::timestamptz;

-- ═══════════════════════════════════════════════════════════════════════════
-- 19. MESSAGE_TEMPLATES — created_at
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE message_templates
SET created_at = '2026-01-01T00:00:00Z'::timestamptz;

-- ═══════════════════════════════════════════════════════════════════════════
-- 20. PAGE_VIEWS — created_at
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE page_views
SET
  created_at = '2026-01-01T00:00:00Z'::timestamptz
    + (
        EXTRACT(EPOCH FROM (created_at - (SELECT MIN(created_at) FROM page_views)))
        / GREATEST(EXTRACT(EPOCH FROM ((SELECT MAX(created_at) FROM page_views) - (SELECT MIN(created_at) FROM page_views))), 1)
      ) * INTERVAL '30 days';

-- ═══════════════════════════════════════════════════════════════════════════
-- 21. TEAM_MEMBERS — created_at, updated_at
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE team_members
SET
  created_at = '2026-01-01T00:00:00Z'::timestamptz,
  updated_at = '2026-01-01T00:00:00Z'::timestamptz;

COMMIT;
