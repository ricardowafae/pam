-- ============================================================
-- Migration 00003: Create site_settings table (if not exists)
--
-- This table stores global configuration like commission rates.
-- Must exist for /api/commissions/rates POST to work.
-- ============================================================

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS but allow service_role full access
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: allow service_role (used by API routes) to read/write
CREATE POLICY "Service role full access" ON site_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);
