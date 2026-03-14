-- ============================================================================
-- Patas, Amor e Memorias - Database Schema
-- Migration: 00001_initial_schema
-- Description: Complete database setup with all tables, RLS, triggers, storage
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. Extensions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ENUM TYPES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM (
  'admin', 'equipe', 'cliente', 'fotografo', 'influenciador'
);

CREATE TYPE order_status AS ENUM (
  'pendente', 'pago', 'em_producao', 'enviado', 'entregue', 'cancelado'
);

CREATE TYPE payment_method AS ENUM (
  'cartao', 'pix', 'boleto'
);

CREATE TYPE payment_status AS ENUM (
  'pendente', 'processando', 'pago', 'falhou', 'reembolsado', 'expirado'
);

CREATE TYPE dogbook_theme AS ENUM (
  'verao', 'inverno', 'natal', 'ano_novo', 'caoniversario'
);

CREATE TYPE dogbook_stage AS ENUM (
  'aguardando_pagamento',
  'aguardando_fotos',
  'em_criacao',
  'em_aprovacao',
  'em_producao',
  'enviado',
  'concluido'
);

CREATE TYPE session_type AS ENUM (
  'pocket', 'estudio', 'completa'
);

CREATE TYPE session_status AS ENUM (
  'aguardando_pagamento',
  'agendada',
  'confirmada',
  'realizada',
  'em_edicao',
  'entregue',
  'cancelada'
);

CREATE TYPE partner_status AS ENUM (
  'ativo', 'inativo'
);

CREATE TYPE permission_status AS ENUM (
  'pendente', 'solicitada', 'aprovada', 'recusada'
);

CREATE TYPE coupon_type AS ENUM (
  'percentual', 'fixo'
);

CREATE TYPE commission_status AS ENUM (
  'pendente', 'processando', 'pago'
);

CREATE TYPE lead_status AS ENUM (
  'visitante',
  'carrinho',
  'checkout_iniciado',
  'pagamento_falhou',
  'pix_expirado',
  'boleto_pendente',
  'pix_pendente',
  'boleto_compensado',
  'pix_compensado',
  'convertido',
  'resgatado'
);

CREATE TYPE message_channel AS ENUM (
  'email', 'whatsapp'
);

CREATE TYPE campaign_status AS ENUM (
  'rascunho', 'agendada', 'enviada', 'cancelada'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'cliente',
  full_name   TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  avatar_url  TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. CUSTOMERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE customers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  cpf         TEXT,
  birth_date  DATE,
  cep         TEXT,
  street      TEXT,
  number      TEXT,
  complement  TEXT,
  neighborhood TEXT,
  city        TEXT,
  state       TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_phone ON customers(phone);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. PETS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE pets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  breed       TEXT,
  birthday    DATE,
  species     TEXT DEFAULT 'cachorro',
  photo_url   TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pets_customer ON pets(customer_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. PRODUCTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  category        TEXT NOT NULL CHECK (category IN ('dogbook', 'sessao', 'vale_presente')),
  description     TEXT,
  base_price      DECIMAL(10,2) NOT NULL,
  max_installments INTEGER NOT NULL DEFAULT 10,
  pix_discount_pct DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  image_url       TEXT,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);

-- Seed initial products
INSERT INTO products (name, slug, category, base_price, max_installments, pix_discount_pct, sort_order) VALUES
  ('Dogbook',              'dogbook',          'dogbook',  490.00, 10, 5.00, 1),
  ('Experiencia Pocket',   'sessao-pocket',    'sessao',   900.00, 10, 5.00, 2),
  ('Sessao Estudio',       'sessao-estudio',   'sessao',  3700.00, 10, 5.00, 3),
  ('Sessao Completa',      'sessao-completa',  'sessao',  4900.00, 10, 5.00, 4);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. VOLUME DISCOUNTS (progressive discounts for Dogbook)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE volume_discounts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  min_qty     INTEGER NOT NULL,
  max_qty     INTEGER,
  discount_pct DECIMAL(5,2) NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Dogbook volume discounts
INSERT INTO volume_discounts (product_id, min_qty, max_qty, discount_pct)
SELECT id, 2, 3, 5.00 FROM products WHERE slug = 'dogbook'
UNION ALL
SELECT id, 4, NULL, 10.00 FROM products WHERE slug = 'dogbook';

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. ORDERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number      TEXT NOT NULL UNIQUE,
  customer_id       UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  subtotal          DECIMAL(10,2) NOT NULL,
  discount_amount   DECIMAL(10,2) NOT NULL DEFAULT 0,
  total             DECIMAL(10,2) NOT NULL,
  status            order_status NOT NULL DEFAULT 'pendente',
  payment_method    payment_method,
  payment_status    payment_status NOT NULL DEFAULT 'pendente',
  stripe_payment_id TEXT,
  stripe_checkout_id TEXT,
  coupon_id         UUID, -- FK added after coupons table
  influencer_id     UUID, -- FK added after influencers table
  tracking_code     TEXT,
  nf_number         TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at           TIMESTAMPTZ,
  shipped_at        TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_stripe ON orders(stripe_payment_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. ORDER ITEMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL DEFAULT 1,
  unit_price  DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. DOGBOOKS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE dogbooks (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id     UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id       UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  pet_id            UUID REFERENCES pets(id) ON DELETE SET NULL,
  sub_number        TEXT NOT NULL, -- e.g., "#PAM-001-1"
  theme             dogbook_theme NOT NULL DEFAULT 'verao',
  stage             dogbook_stage NOT NULL DEFAULT 'aguardando_pagamento',
  total_pages       INTEGER NOT NULL DEFAULT 20,
  photos_uploaded   INTEGER NOT NULL DEFAULT 0,
  photos_max        INTEGER NOT NULL DEFAULT 30,
  deadline_creative TIMESTAMPTZ,
  preview_ready     BOOLEAN NOT NULL DEFAULT FALSE,
  approved_at       TIMESTAMPTZ,
  nf_number         TEXT,
  tracking_code     TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dogbooks_order ON dogbooks(order_id);
CREATE INDEX idx_dogbooks_customer ON dogbooks(customer_id);
CREATE INDEX idx_dogbooks_stage ON dogbooks(stage);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. DOGBOOK PERSONALITY TRAITS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE dogbook_traits (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dogbook_id  UUID NOT NULL REFERENCES dogbooks(id) ON DELETE CASCADE,
  trait_name  TEXT NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dogbook_traits_dogbook ON dogbook_traits(dogbook_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. PHOTOGRAPHERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE photographers (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name                  TEXT NOT NULL,
  email                 TEXT NOT NULL,
  phone                 TEXT,
  instagram             TEXT,
  portfolio_url         TEXT,
  bio                   TEXT,
  status                partner_status NOT NULL DEFAULT 'ativo',
  -- Pricing per session type
  price_pocket          DECIMAL(10,2),
  price_estudio         DECIMAL(10,2),
  price_completa        DECIMAL(10,2),
  commission_pct        DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  -- Address
  cep                   TEXT,
  street                TEXT,
  number                TEXT,
  complement            TEXT,
  neighborhood          TEXT,
  city                  TEXT,
  state                 TEXT,
  -- Business info
  razao_social          TEXT,
  nome_fantasia         TEXT,
  cnpj                  TEXT,
  -- Banking
  bank                  TEXT,
  agency                TEXT,
  account               TEXT,
  pix_key               TEXT,
  -- Work schedule
  work_period_start     TIME,
  work_period_end       TIME,
  available_monday      BOOLEAN DEFAULT TRUE,
  available_tuesday     BOOLEAN DEFAULT TRUE,
  available_wednesday   BOOLEAN DEFAULT TRUE,
  available_thursday    BOOLEAN DEFAULT TRUE,
  available_friday      BOOLEAN DEFAULT TRUE,
  available_saturday    BOOLEAN DEFAULT FALSE,
  available_sunday      BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_photographers_user ON photographers(user_id);
CREATE INDEX idx_photographers_status ON photographers(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. PHOTO SESSIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE photo_sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_number    TEXT NOT NULL UNIQUE,
  order_item_id     UUID REFERENCES order_items(id) ON DELETE SET NULL,
  order_id          UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_id       UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  photographer_id   UUID REFERENCES photographers(id) ON DELETE SET NULL,
  pet_id            UUID REFERENCES pets(id) ON DELETE SET NULL,
  session_type      session_type NOT NULL,
  status            session_status NOT NULL DEFAULT 'aguardando_pagamento',
  payment_status    payment_status NOT NULL DEFAULT 'pendente',
  scheduled_date    DATE,
  scheduled_time    TIME,
  duration_minutes  INTEGER,
  location          TEXT,
  total_photos      INTEGER DEFAULT 0,
  observations      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_customer ON photo_sessions(customer_id);
CREATE INDEX idx_sessions_photographer ON photo_sessions(photographer_id);
CREATE INDEX idx_sessions_status ON photo_sessions(status);
CREATE INDEX idx_sessions_date ON photo_sessions(scheduled_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. INFLUENCERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE influencers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  instagram         TEXT,
  slug              TEXT NOT NULL UNIQUE,
  bio               TEXT,
  status            partner_status NOT NULL DEFAULT 'ativo',
  commission_per_sale DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  -- Business info
  razao_social      TEXT,
  nome_fantasia     TEXT,
  cnpj              TEXT,
  -- Banking
  bank              TEXT,
  agency            TEXT,
  account           TEXT,
  pix_key           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_influencers_slug ON influencers(slug);
CREATE INDEX idx_influencers_user ON influencers(user_id);
CREATE INDEX idx_influencers_status ON influencers(status);


-- ─────────────────────────────────────────────────────────────────────────────
-- 14. COUPONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE coupons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT NOT NULL UNIQUE,
  coupon_type     coupon_type NOT NULL DEFAULT 'fixo',
  discount_value  DECIMAL(10,2) NOT NULL,
  influencer_id   UUID REFERENCES influencers(id) ON DELETE SET NULL,
  max_uses        INTEGER,
  current_uses    INTEGER NOT NULL DEFAULT 0,
  valid_from      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until     TIMESTAMPTZ,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  single_use_per_customer BOOLEAN NOT NULL DEFAULT TRUE,
  stackable       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_influencer ON coupons(influencer_id);

-- Deferred FKs on orders (coupons and influencers now exist)
ALTER TABLE orders ADD CONSTRAINT fk_orders_coupon
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;
ALTER TABLE orders ADD CONSTRAINT fk_orders_influencer
  FOREIGN KEY (influencer_id) REFERENCES influencers(id) ON DELETE SET NULL;

-- Seed standard coupons
INSERT INTO coupons (code, coupon_type, discount_value, valid_until) VALUES
  ('PAM10OFF', 'fixo', 10.00, NOW() + INTERVAL '1 year'),
  ('PAM20OFF', 'fixo', 20.00, NOW() + INTERVAL '1 year'),
  ('PAM50OFF', 'fixo', 50.00, NOW() + INTERVAL '1 year');

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. COUPON USAGE LOG
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE coupon_usages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id   UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  used_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupon_usages_coupon ON coupon_usages(coupon_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. COMMISSIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE commissions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photographer_id   UUID REFERENCES photographers(id) ON DELETE SET NULL,
  influencer_id     UUID REFERENCES influencers(id) ON DELETE SET NULL,
  order_id          UUID REFERENCES orders(id) ON DELETE SET NULL,
  session_id        UUID REFERENCES photo_sessions(id) ON DELETE SET NULL,
  total_sale_value  DECIMAL(10,2) NOT NULL,
  commission_pct    DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  status            commission_status NOT NULL DEFAULT 'pendente',
  paid_at           TIMESTAMPTZ,
  receipt_url       TEXT,
  period_month      INTEGER NOT NULL,
  period_year       INTEGER NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_commission_partner CHECK (
    (photographer_id IS NOT NULL AND influencer_id IS NULL)
    OR (photographer_id IS NULL AND influencer_id IS NOT NULL)
  )
);

CREATE INDEX idx_commissions_photographer ON commissions(photographer_id);
CREATE INDEX idx_commissions_influencer ON commissions(influencer_id);
CREATE INDEX idx_commissions_period ON commissions(period_year, period_month);

-- ─────────────────────────────────────────────────────────────────────────────
-- 17. GALLERY PHOTOS (customer uploads)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE gallery_photos (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  dogbook_id        UUID REFERENCES dogbooks(id) ON DELETE SET NULL,
  storage_path      TEXT NOT NULL,
  url               TEXT NOT NULL,
  file_name         TEXT,
  file_size         INTEGER,
  pet_name          TEXT,
  favorited         BOOLEAN NOT NULL DEFAULT FALSE,
  permission_status permission_status NOT NULL DEFAULT 'pendente',
  permission_requested_at TIMESTAMPTZ,
  uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_customer ON gallery_photos(customer_id);
CREATE INDEX idx_gallery_dogbook ON gallery_photos(dogbook_id);
CREATE INDEX idx_gallery_permission ON gallery_photos(permission_status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 18. TEAM MEMBERS (admin staff)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE team_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'equipe',
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  -- Granular permissions
  perm_dashboard      BOOLEAN NOT NULL DEFAULT TRUE,
  perm_analytics      BOOLEAN NOT NULL DEFAULT FALSE,
  perm_clientes       BOOLEAN NOT NULL DEFAULT FALSE,
  perm_sessoes        BOOLEAN NOT NULL DEFAULT FALSE,
  perm_pedidos        BOOLEAN NOT NULL DEFAULT FALSE,
  perm_galeria        BOOLEAN NOT NULL DEFAULT FALSE,
  perm_influenciadores BOOLEAN NOT NULL DEFAULT FALSE,
  perm_fotografos     BOOLEAN NOT NULL DEFAULT FALSE,
  perm_precos         BOOLEAN NOT NULL DEFAULT FALSE,
  perm_equipe         BOOLEAN NOT NULL DEFAULT FALSE,
  perm_comunicacao    BOOLEAN NOT NULL DEFAULT FALSE,
  perm_conversao      BOOLEAN NOT NULL DEFAULT FALSE,
  -- Personal info
  phone               TEXT,
  cpf                 TEXT,
  rg                  TEXT,
  birth_date          DATE,
  work_start_date     DATE,
  work_end_date       DATE,
  -- Address
  cep                 TEXT,
  street              TEXT,
  number              TEXT,
  complement          TEXT,
  neighborhood        TEXT,
  city                TEXT,
  state               TEXT,
  -- Banking
  bank                TEXT,
  agency              TEXT,
  account             TEXT,
  pix_key             TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_team_user ON team_members(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 19. GIFT CARDS (Vale Presente)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE gift_cards (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT NOT NULL UNIQUE,
  purchaser_name  TEXT NOT NULL,
  purchaser_email TEXT NOT NULL,
  recipient_name  TEXT,
  recipient_email TEXT,
  amount          DECIMAL(10,2) NOT NULL,
  balance         DECIMAL(10,2) NOT NULL,
  message         TEXT,
  order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
  redeemed_by     UUID REFERENCES customers(id) ON DELETE SET NULL,
  redeemed_at     TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gift_cards_code ON gift_cards(code);

-- ─────────────────────────────────────────────────────────────────────────────
-- 20. LEADS / CONVERSION TRACKING
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT,
  email           TEXT,
  phone           TEXT,
  status          lead_status NOT NULL DEFAULT 'visitante',
  source          TEXT,
  influencer_id   UUID REFERENCES influencers(id) ON DELETE SET NULL,
  product_interest TEXT,
  cart_value      DECIMAL(10,2),
  recovery_link   TEXT,
  coupon_sent     BOOLEAN NOT NULL DEFAULT FALSE,
  coupon_id       UUID REFERENCES coupons(id) ON DELETE SET NULL,
  recovered       BOOLEAN NOT NULL DEFAULT FALSE,
  sessions_count  INTEGER NOT NULL DEFAULT 0,
  pages_viewed    INTEGER NOT NULL DEFAULT 0,
  last_activity   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_influencer ON leads(influencer_id);
CREATE INDEX idx_leads_created ON leads(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 21. MESSAGES (internal messaging system)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject     TEXT,
  body        TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_receiver ON messages(receiver_id, read);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 22. CAMPAIGNS (email/whatsapp campaigns)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE campaigns (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  channel         message_channel NOT NULL DEFAULT 'email',
  status          campaign_status NOT NULL DEFAULT 'rascunho',
  subject         TEXT,
  body            TEXT NOT NULL,
  audience_filter JSONB, -- flexible filter criteria
  total_sent      INTEGER NOT NULL DEFAULT 0,
  total_opened    INTEGER NOT NULL DEFAULT 0,
  total_clicked   INTEGER NOT NULL DEFAULT 0,
  scheduled_at    TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 23. AUTO MESSAGES (triggered messages)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE auto_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- 'pet_birthday', 'tutor_birthday', 'festive_date', 'post_purchase', etc.
  trigger_config JSONB, -- date offsets, conditions
  channel     message_channel NOT NULL DEFAULT 'whatsapp',
  template    TEXT NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 24. MESSAGE TEMPLATES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE message_templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  category    TEXT, -- 'festivo', 'marketing', 'transacional'
  channel     message_channel NOT NULL DEFAULT 'whatsapp',
  subject     TEXT,
  body        TEXT NOT NULL,
  variables   TEXT[], -- list of variables used: {nome}, {pet_nome}, etc.
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 25. ANALYTICS PAGE VIEWS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE page_views (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id    TEXT, -- anonymous visitor ID (cookie)
  page_path     TEXT NOT NULL,
  referrer      TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  device_type   TEXT, -- 'desktop', 'mobile', 'tablet'
  user_agent    TEXT,
  ip_hash       TEXT, -- hashed for privacy
  session_id    TEXT,
  influencer_id UUID REFERENCES influencers(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_page_views_created ON page_views(created_at DESC);
CREATE INDEX idx_page_views_path ON page_views(page_path);
CREATE INDEX idx_page_views_influencer ON page_views(influencer_id);
CREATE INDEX idx_page_views_session ON page_views(session_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 26. ORDER NUMBER SEQUENCE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE SEQUENCE order_number_seq START WITH 1001;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := '#PAM-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- ─────────────────────────────────────────────────────────────────────────────
-- 27. SESSION NUMBER SEQUENCE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE SEQUENCE session_number_seq START WITH 1001;

CREATE OR REPLACE FUNCTION generate_session_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.session_number := '#SES-' || LPAD(nextval('session_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_session_number
  BEFORE INSERT ON photo_sessions
  FOR EACH ROW
  WHEN (NEW.session_number IS NULL OR NEW.session_number = '')
  EXECUTE FUNCTION generate_session_number();

-- ─────────────────────────────────────────────────────────────────────────────
-- 28. AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_profiles_updated   BEFORE UPDATE ON profiles       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated  BEFORE UPDATE ON customers      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated   BEFORE UPDATE ON products       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated     BEFORE UPDATE ON orders         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_dogbooks_updated   BEFORE UPDATE ON dogbooks       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sessions_updated   BEFORE UPDATE ON photo_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_photog_updated     BEFORE UPDATE ON photographers  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_influencers_updated BEFORE UPDATE ON influencers   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_leads_updated      BEFORE UPDATE ON leads          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_team_updated       BEFORE UPDATE ON team_members   FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 29. AUTO-CREATE PROFILE ON SIGNUP
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'cliente'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 30. COUPON USAGE INCREMENT
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coupons
  SET current_uses = current_uses + 1
  WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_coupon_usage
  AFTER INSERT ON coupon_usages
  FOR EACH ROW
  EXECUTE FUNCTION increment_coupon_usage();

-- ═════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═════════════════════════════════════════════════════════════════════════════

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION auth_role()
RETURNS user_role AS $$
  SELECT COALESCE(
    (SELECT role FROM profiles WHERE id = auth.uid()),
    'cliente'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is admin or equipe?
CREATE OR REPLACE FUNCTION is_admin_or_equipe()
RETURNS BOOLEAN AS $$
  SELECT auth_role() IN ('admin', 'equipe');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT auth_role() = 'admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── PROFILES ──
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Admin can read all profiles"
  ON profiles FOR SELECT
  USING (is_admin_or_equipe());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admin can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

-- ── CUSTOMERS ──
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients see own data"
  ON customers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admin/equipe see all customers"
  ON customers FOR SELECT
  USING (is_admin_or_equipe());

CREATE POLICY "Admin can insert customers"
  ON customers FOR INSERT
  WITH CHECK (is_admin_or_equipe() OR user_id = auth.uid());

CREATE POLICY "Admin can update customers"
  ON customers FOR UPDATE
  USING (is_admin_or_equipe() OR user_id = auth.uid());

-- ── PETS ──
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners see own pets"
  ON pets FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    OR is_admin_or_equipe()
  );

CREATE POLICY "Owners manage own pets"
  ON pets FOR ALL
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    OR is_admin_or_equipe()
  );

-- ── PRODUCTS (public read) ──
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Admin can manage products"
  ON products FOR ALL
  USING (is_admin_or_equipe());

-- ── ORDERS ──
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients see own orders"
  ON orders FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin sees all orders"
  ON orders FOR SELECT
  USING (is_admin_or_equipe());

CREATE POLICY "Admin can manage orders"
  ON orders FOR ALL
  USING (is_admin_or_equipe());

CREATE POLICY "Clients can insert orders"
  ON orders FOR INSERT
  WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- ── ORDER ITEMS ──
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Via order access"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders
      WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    )
    OR is_admin_or_equipe()
  );

CREATE POLICY "Admin manages order items"
  ON order_items FOR ALL
  USING (is_admin_or_equipe());

-- ── DOGBOOKS ──
ALTER TABLE dogbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients see own dogbooks"
  ON dogbooks FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    OR is_admin_or_equipe()
  );

CREATE POLICY "Admin manages dogbooks"
  ON dogbooks FOR ALL
  USING (is_admin_or_equipe());

CREATE POLICY "Clients can update own dogbooks"
  ON dogbooks FOR UPDATE
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- ── PHOTO SESSIONS ──
ALTER TABLE photo_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients see own sessions"
  ON photo_sessions FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Photographers see assigned sessions"
  ON photo_sessions FOR SELECT
  USING (
    photographer_id IN (SELECT id FROM photographers WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin sees all sessions"
  ON photo_sessions FOR SELECT
  USING (is_admin_or_equipe());

CREATE POLICY "Admin manages sessions"
  ON photo_sessions FOR ALL
  USING (is_admin_or_equipe());

-- ── PHOTOGRAPHERS ──
ALTER TABLE photographers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photographers see own data"
  ON photographers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Photographers update own data"
  ON photographers FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admin sees all photographers"
  ON photographers FOR SELECT
  USING (is_admin_or_equipe());

CREATE POLICY "Admin manages photographers"
  ON photographers FOR ALL
  USING (is_admin_or_equipe());

-- ── INFLUENCERS ──
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Influencers see own data"
  ON influencers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Influencers update own data"
  ON influencers FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admin sees all influencers"
  ON influencers FOR SELECT
  USING (is_admin_or_equipe());

CREATE POLICY "Admin manages influencers"
  ON influencers FOR ALL
  USING (is_admin_or_equipe());

-- Public read for influencer landing pages
CREATE POLICY "Public can read active influencer slugs"
  ON influencers FOR SELECT
  USING (status = 'ativo');

-- ── COUPONS (public read for validation) ──
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can validate coupons"
  ON coupons FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Admin manages coupons"
  ON coupons FOR ALL
  USING (is_admin_or_equipe());

-- ── COMMISSIONS ──
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners see own commissions"
  ON commissions FOR SELECT
  USING (
    photographer_id IN (SELECT id FROM photographers WHERE user_id = auth.uid())
    OR influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin sees all commissions"
  ON commissions FOR SELECT
  USING (is_admin_or_equipe());

CREATE POLICY "Admin manages commissions"
  ON commissions FOR ALL
  USING (is_admin_or_equipe());

-- ── GALLERY PHOTOS ──
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients see own photos"
  ON gallery_photos FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Clients upload own photos"
  ON gallery_photos FOR INSERT
  WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin sees all photos"
  ON gallery_photos FOR SELECT
  USING (is_admin_or_equipe());

CREATE POLICY "Admin manages photos"
  ON gallery_photos FOR ALL
  USING (is_admin_or_equipe());

-- ── TEAM MEMBERS ──
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team sees own record"
  ON team_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admin sees all team"
  ON team_members FOR SELECT
  USING (is_admin());

CREATE POLICY "Admin manages team"
  ON team_members FOR ALL
  USING (is_admin());

-- ── GIFT CARDS ──
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can validate gift cards"
  ON gift_cards FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Admin manages gift cards"
  ON gift_cards FOR ALL
  USING (is_admin_or_equipe());

-- ── LEADS ──
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin sees all leads"
  ON leads FOR ALL
  USING (is_admin_or_equipe());

-- ── MESSAGES ──
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own messages"
  ON messages FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users mark own messages as read"
  ON messages FOR UPDATE
  USING (receiver_id = auth.uid());

-- ── CAMPAIGNS, AUTO MESSAGES, TEMPLATES ──
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages campaigns"
  ON campaigns FOR ALL USING (is_admin_or_equipe());

CREATE POLICY "Admin manages auto messages"
  ON auto_messages FOR ALL USING (is_admin_or_equipe());

CREATE POLICY "Admin manages templates"
  ON message_templates FOR ALL USING (is_admin_or_equipe());

-- ── PAGE VIEWS (insert-only for tracking) ──
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admin reads analytics"
  ON page_views FOR SELECT
  USING (is_admin_or_equipe());

-- ── VOLUME DISCOUNTS ──
ALTER TABLE volume_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads active discounts"
  ON volume_discounts FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Admin manages discounts"
  ON volume_discounts FOR ALL
  USING (is_admin_or_equipe());

-- ── DOGBOOK TRAITS ──
ALTER TABLE dogbook_traits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Via dogbook access"
  ON dogbook_traits FOR SELECT
  USING (
    dogbook_id IN (
      SELECT id FROM dogbooks
      WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    )
    OR is_admin_or_equipe()
  );

CREATE POLICY "Clients manage own traits"
  ON dogbook_traits FOR ALL
  USING (
    dogbook_id IN (
      SELECT id FROM dogbooks
      WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    )
    OR is_admin_or_equipe()
  );

-- ── COUPON USAGES ──
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin sees coupon usage"
  ON coupon_usages FOR SELECT
  USING (is_admin_or_equipe());

CREATE POLICY "System can insert coupon usage"
  ON coupon_usages FOR INSERT
  WITH CHECK (TRUE);

-- ═════════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ═════════════════════════════════════════════════════════════════════════════

-- Create storage buckets (run via Supabase Dashboard or SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('customer-photos', 'customer-photos', FALSE),
  ('dogbook-previews', 'dogbook-previews', FALSE),
  ('product-images', 'product-images', TRUE),
  ('team-avatars', 'team-avatars', FALSE),
  ('campaign-assets', 'campaign-assets', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: customer-photos
CREATE POLICY "Clients upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'customer-photos'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Clients read own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'customer-photos'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Admin reads all customer photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'customer-photos'
    AND is_admin_or_equipe()
  );

-- Storage policies: product-images (public)
CREATE POLICY "Anyone reads product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin manages product images"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'product-images'
    AND is_admin_or_equipe()
  );

-- Storage policies: dogbook-previews
CREATE POLICY "Clients read own dogbook previews"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'dogbook-previews'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Admin manages dogbook previews"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'dogbook-previews'
    AND is_admin_or_equipe()
  );

-- ═════════════════════════════════════════════════════════════════════════════
-- VIEWS (for common queries)
-- ═════════════════════════════════════════════════════════════════════════════

-- Dashboard KPIs view
CREATE OR REPLACE VIEW v_dashboard_kpis AS
SELECT
  (SELECT COUNT(*) FROM orders WHERE created_at >= NOW() - INTERVAL '30 days') AS orders_30d,
  (SELECT COUNT(*) FROM orders WHERE status = 'pago' AND created_at >= NOW() - INTERVAL '30 days') AS paid_30d,
  (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status IN ('pago', 'em_producao', 'enviado', 'entregue') AND created_at >= NOW() - INTERVAL '30 days') AS revenue_30d,
  (SELECT COUNT(*) FROM customers) AS total_customers,
  (SELECT COUNT(*) FROM photo_sessions WHERE scheduled_date >= CURRENT_DATE) AS upcoming_sessions,
  (SELECT COUNT(*) FROM dogbooks WHERE stage NOT IN ('concluido')) AS active_dogbooks,
  (SELECT COUNT(*) FROM leads WHERE status NOT IN ('convertido', 'resgatado') AND created_at >= NOW() - INTERVAL '30 days') AS pending_leads_30d;

-- Influencer stats view
CREATE OR REPLACE VIEW v_influencer_stats AS
SELECT
  i.id,
  i.name,
  i.slug,
  i.instagram,
  i.status,
  COUNT(DISTINCT pv.session_id) AS total_visits,
  COUNT(DISTINCT pv.id) AS total_views,
  COUNT(DISTINCT o.id) AS total_sales,
  COALESCE(SUM(o.total), 0) AS total_revenue,
  COALESCE(SUM(c.commission_amount), 0) AS total_commissions
FROM influencers i
LEFT JOIN page_views pv ON pv.influencer_id = i.id
LEFT JOIN orders o ON o.influencer_id = i.id AND o.status IN ('pago', 'em_producao', 'enviado', 'entregue')
LEFT JOIN commissions c ON c.influencer_id = i.id
GROUP BY i.id;

-- ═════════════════════════════════════════════════════════════════════════════
-- DONE
-- ═════════════════════════════════════════════════════════════════════════════
