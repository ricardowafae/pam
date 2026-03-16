-- ═══════════════════════════════════════════════════════════════════
-- Blacklist de Clientes
-- Bloqueia tentativas de compra e contato
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS customer_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf_cnpj TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  rg TEXT,
  address TEXT,
  reason TEXT,
  blocked_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cpf_cnpj)
);

-- Index for fast lookup during checkout
CREATE INDEX IF NOT EXISTS idx_blacklist_cpf ON customer_blacklist(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_blacklist_email ON customer_blacklist(email);

-- RLS
ALTER TABLE customer_blacklist ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admin) full access
CREATE POLICY "Allow authenticated full access to blacklist"
ON customer_blacklist
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert initial entries
INSERT INTO customer_blacklist (cpf_cnpj, name, rg, address, reason)
VALUES
  ('13515193871', 'Carlos Alberto Franco Ballarati', '9711743-2', 'Alameda Guaramomis, 739, apto 111, Moema, São Paulo/SP, CEP 04076-011', 'Bloqueio administrativo'),
  ('03279196981', 'Paula Mateus', '6306920-5', 'Alameda Guaramomis, 739, apto 111, Moema, São Paulo/SP, CEP 04076-011', 'Bloqueio administrativo')
ON CONFLICT (cpf_cnpj) DO NOTHING;
