-- Add 'gratuita' to payment_status enum for invited clients (free sessions)
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'gratuita';
