-- Add payment columns to applications table
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS payment_order_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS payment_amount INTEGER,
  ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS payment_transaction_id VARCHAR(100);
