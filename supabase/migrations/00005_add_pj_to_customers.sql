-- Add PJ (Pessoa Jurídica) support to customers table
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS person_type TEXT NOT NULL DEFAULT 'PF',
  ADD COLUMN IF NOT EXISTS cnpj TEXT,
  ADD COLUMN IF NOT EXISTS razao_social TEXT,
  ADD COLUMN IF NOT EXISTS nome_fantasia TEXT;
