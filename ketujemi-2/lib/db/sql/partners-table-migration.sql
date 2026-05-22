-- Partner program registration applications (/partner form)
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  iban TEXT NOT NULL,
  package TEXT NOT NULL,
  logo_url TEXT,
  link_url TEXT NOT NULL,
  link_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  accepted_terms BOOLEAN NOT NULL DEFAULT FALSE,
  client_ip TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS partners_status_created_idx ON partners (status, created_at DESC);
CREATE INDEX IF NOT EXISTS partners_email_idx ON partners (email);
