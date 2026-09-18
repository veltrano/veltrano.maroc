CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL,
  phone_normalized text,
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_phone_idx ON orders (phone_normalized);

CREATE TABLE IF NOT EXISTS fixed_coupons (
  code text PRIMARY KEY,
  created_at timestamptz NOT NULL,
  payload jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS whatsapp_queue (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL,
  payload jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS staff (
  id text PRIMARY KEY,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO staff (id, name)
VALUES ('owner-zakaria', 'Zakaria')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS clients (
  id text PRIMARY KEY,
  name text NOT NULL,
  phone text,
  phone_normalized text,
  email text,
  email_normalized text,
  city text,
  delivery_address text,
  preferred_language text NOT NULL DEFAULT 'fr'
    CHECK (preferred_language IN ('fr', 'ar')),
  source text NOT NULL DEFAULT 'site_web'
    CHECK (source IN ('site_web', 'popup_email', 'whatsapp', 'instagram', 'telephone', 'manuel')),
  notes text NOT NULL DEFAULT '',
  assigned_staff_id text REFERENCES staff(id) ON DELETE SET NULL,
  next_callback_at timestamptz,
  contact_status text NOT NULL DEFAULT 'a_contacter'
    CHECK (contact_status IN ('a_contacter', 'pas_de_reponse', 'rappel_planifie', 'contacte')),
  marketing_email boolean NOT NULL DEFAULT false,
  marketing_whatsapp boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (phone IS NOT NULL OR email IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS clients_phone_normalized_idx ON clients (phone_normalized);
CREATE INDEX IF NOT EXISTS clients_email_normalized_idx ON clients (email_normalized);
CREATE INDEX IF NOT EXISTS clients_next_callback_idx ON clients (next_callback_at);

CREATE TABLE IF NOT EXISTS order_clients (
  order_id text PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  client_id text NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  linked_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_clients_client_idx ON order_clients (client_id);

CREATE TABLE IF NOT EXISTS contact_attempts (
  id text PRIMARY KEY,
  client_id text NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  outcome text NOT NULL
    CHECK (outcome IN ('contacte', 'pas_de_reponse', 'rappel_planifie')),
  notes text NOT NULL DEFAULT '',
  next_callback_at timestamptz,
  staff_id text REFERENCES staff(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_attempts_client_idx
  ON contact_attempts (client_id, created_at DESC);

CREATE TABLE IF NOT EXISTS exchanges (
  id text PRIMARY KEY,
  client_id text NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  order_id text REFERENCES orders(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('requested', 'completed')),
  description text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS client_notes (
  id text PRIMARY KEY,
  client_id text NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  body text NOT NULL,
  author text NOT NULL,
  order_id text REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_list_pins (
  list_key text NOT NULL
    CHECK (list_key IN ('clients_fideles', 'achats_baggy', 'achats_straight', 'en_attente_echange')),
  client_id text NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  added_by text NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (list_key, client_id)
);

CREATE TABLE IF NOT EXISTS email_signups (
  id text PRIMARY KEY,
  email text NOT NULL,
  email_normalized text NOT NULL,
  language text NOT NULL CHECK (language IN ('fr', 'ar')),
  marketing_consent boolean NOT NULL,
  coupon_code text NOT NULL UNIQUE,
  coupon_status text NOT NULL
    CHECK (coupon_status IN ('active', 'used', 'expired')),
  email_status text NOT NULL
    CHECK (email_status IN ('queued', 'sent', 'failed')),
  client_id text NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  linked_order_id text REFERENCES orders(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS email_signups_email_idx
  ON email_signups (email_normalized, created_at DESC);

CREATE TABLE IF NOT EXISTS welcome_coupon_events (
  id text PRIMARY KEY,
  signup_id text NOT NULL REFERENCES email_signups(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
