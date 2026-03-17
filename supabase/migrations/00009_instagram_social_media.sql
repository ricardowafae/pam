-- =====================================================
-- Migration 00009: Instagram & Social Media Management
-- =====================================================

-- Enums
CREATE TYPE instagram_post_type AS ENUM ('reels', 'carousel', 'story', 'single_image');
CREATE TYPE instagram_post_status AS ENUM ('idea', 'draft', 'scheduled', 'published', 'archived');
CREATE TYPE content_platform AS ENUM ('instagram', 'youtube', 'tiktok');
CREATE TYPE news_topic AS ENUM ('tools', 'research', 'business', 'general');

-- =====================================================
-- Instagram Posts (content manager)
-- =====================================================
CREATE TABLE instagram_posts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caption          TEXT,
  post_type        instagram_post_type NOT NULL DEFAULT 'single_image',
  status           instagram_post_status NOT NULL DEFAULT 'idea',
  platform         content_platform NOT NULL DEFAULT 'instagram',
  scheduled_at     TIMESTAMPTZ,
  published_at     TIMESTAMPTZ,
  ig_media_id      TEXT UNIQUE,
  ig_permalink     TEXT,
  ig_thumbnail_url TEXT,
  impressions      INTEGER DEFAULT 0,
  reach            INTEGER DEFAULT 0,
  likes            INTEGER DEFAULT 0,
  comments         INTEGER DEFAULT 0,
  saves            INTEGER DEFAULT 0,
  shares           INTEGER DEFAULT 0,
  engagement_rate  NUMERIC(5,2) DEFAULT 0,
  tags             TEXT[] DEFAULT '{}',
  notes            TEXT,
  media_urls       TEXT[] DEFAULT '{}',
  created_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_instagram_posts_status ON instagram_posts(status);
CREATE INDEX idx_instagram_posts_scheduled ON instagram_posts(scheduled_at);
CREATE INDEX idx_instagram_posts_ig_media ON instagram_posts(ig_media_id);

-- =====================================================
-- Instagram Insights Daily (cached profile metrics)
-- =====================================================
CREATE TABLE instagram_insights_daily (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date             DATE NOT NULL UNIQUE,
  impressions      INTEGER DEFAULT 0,
  reach            INTEGER DEFAULT 0,
  profile_views    INTEGER DEFAULT 0,
  follower_count   INTEGER DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,
  website_clicks   INTEGER DEFAULT 0,
  email_clicks     INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_insights_daily_date ON instagram_insights_daily(date);

-- =====================================================
-- Instagram Competitors
-- =====================================================
CREATE TABLE instagram_competitors (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  handle            TEXT NOT NULL UNIQUE,
  display_name      TEXT,
  profile_pic_url   TEXT,
  follower_count    INTEGER DEFAULT 0,
  following_count   INTEGER DEFAULT 0,
  media_count       INTEGER DEFAULT 0,
  avg_likes         NUMERIC(10,2) DEFAULT 0,
  avg_comments      NUMERIC(10,2) DEFAULT 0,
  engagement_rate   NUMERIC(5,2) DEFAULT 0,
  posting_frequency NUMERIC(5,2) DEFAULT 0,
  notes             TEXT,
  last_synced_at    TIMESTAMPTZ,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Competitor Posts (manual entry)
-- =====================================================
CREATE TABLE competitor_posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id   UUID NOT NULL REFERENCES instagram_competitors(id) ON DELETE CASCADE,
  post_type       TEXT,
  caption_preview TEXT,
  permalink       TEXT,
  likes           INTEGER DEFAULT 0,
  comments        INTEGER DEFAULT 0,
  posted_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_competitor_posts_competitor ON competitor_posts(competitor_id);

-- =====================================================
-- News Feeds (RSS sources)
-- =====================================================
CREATE TABLE news_feeds (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  url             TEXT NOT NULL,
  topic           news_topic DEFAULT 'general',
  is_active       BOOLEAN DEFAULT TRUE,
  last_fetched_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- News Articles (cached parsed articles)
-- =====================================================
CREATE TABLE news_articles (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id        UUID NOT NULL REFERENCES news_feeds(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  url            TEXT NOT NULL UNIQUE,
  source_name    TEXT,
  summary        TEXT,
  published_at   TIMESTAMPTZ,
  topic          news_topic DEFAULT 'general',
  is_read        BOOLEAN DEFAULT FALSE,
  is_bookmarked  BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_articles_feed ON news_articles(feed_id);
CREATE INDEX idx_news_articles_topic ON news_articles(topic);

-- =====================================================
-- Instagram Token Store (singleton)
-- =====================================================
CREATE TABLE instagram_token_store (
  id               INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  access_token     TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  ig_user_id       TEXT NOT NULL,
  ig_username      TEXT,
  last_refreshed_at TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- RLS Policies (authenticated users only)
-- =====================================================
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_insights_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_token_store ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access on instagram_posts"
  ON instagram_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access on instagram_insights_daily"
  ON instagram_insights_daily FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access on instagram_competitors"
  ON instagram_competitors FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access on competitor_posts"
  ON competitor_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access on news_feeds"
  ON news_feeds FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access on news_articles"
  ON news_articles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Token store: only service_role should access directly (via API routes)
-- No RLS policy for authenticated — admin API routes use service_role key
CREATE POLICY "No direct access to token store"
  ON instagram_token_store FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- =====================================================
-- Updated_at triggers
-- =====================================================
CREATE TRIGGER trg_instagram_posts_updated
  BEFORE UPDATE ON instagram_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_instagram_competitors_updated
  BEFORE UPDATE ON instagram_competitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
