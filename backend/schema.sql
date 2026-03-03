-- Simple schema for deals MVP
CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  product TEXT NOT NULL,
  quantity_min INTEGER,
  quantity_max INTEGER,
  quantity_band TEXT,
  location TEXT,
  expected_close_date DATE,
  deal_owner TEXT,
  fingerprint TEXT,
  status TEXT DEFAULT 'submitted', -- submitted, flagged, approved, rejected
  justification TEXT,
  cost_matrix JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE deals ADD COLUMN IF NOT EXISTS cost_matrix JSONB;
