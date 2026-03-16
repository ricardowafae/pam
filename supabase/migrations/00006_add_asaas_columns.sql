-- Add Asaas payment gateway columns
ALTER TABLE customers ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS asaas_payment_id TEXT;
