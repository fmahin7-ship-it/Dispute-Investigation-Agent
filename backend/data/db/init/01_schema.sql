-- NovaCart EDI — schema (runs on first docker compose up)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Operational truth
-- ---------------------------------------------------------------------------

CREATE TABLE customers (
  id            TEXT PRIMARY KEY,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  address_line1 TEXT NOT NULL,
  suburb        TEXT NOT NULL,
  state         TEXT NOT NULL DEFAULT 'VIC',
  postcode      TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id              TEXT PRIMARY KEY,
  order_number    TEXT NOT NULL UNIQUE,
  customer_id     TEXT NOT NULL REFERENCES customers(id),
  status          TEXT NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'AUD',
  total_amount    NUMERIC(12, 2) NOT NULL,
  item_sku        TEXT NOT NULL,
  item_name       TEXT NOT NULL,
  item_category   TEXT,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE shipments (
  id                 TEXT PRIMARY KEY,
  order_id           TEXT NOT NULL REFERENCES orders(id),
  carrier            TEXT NOT NULL,
  tracking_number    TEXT NOT NULL,
  status             TEXT NOT NULL,
  delivered_at       TIMESTAMPTZ,
  gps_lat            NUMERIC(10, 7),
  gps_lng            NUMERIC(10, 7),
  registered_lat     NUMERIC(10, 7),
  registered_lng     NUMERIC(10, 7),
  distance_meters    NUMERIC(10, 2),
  delivery_method    TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE delivery_evidence (
  id              TEXT PRIMARY KEY,
  order_id        TEXT NOT NULL REFERENCES orders(id),
  exists_flag     BOOLEAN NOT NULL DEFAULT FALSE,
  photo_url       TEXT,
  caption         TEXT,
  limitations     TEXT[] NOT NULL DEFAULT '{}',
  captured_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id              TEXT PRIMARY KEY,
  order_id        TEXT NOT NULL REFERENCES orders(id),
  provider        TEXT NOT NULL DEFAULT 'stripe',
  charge_id       TEXT NOT NULL,
  amount          NUMERIC(12, 2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'AUD',
  status          TEXT NOT NULL,
  charged_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE warehouse_picks (
  id              TEXT PRIMARY KEY,
  order_id        TEXT NOT NULL REFERENCES orders(id),
  sku_ordered     TEXT NOT NULL,
  sku_picked      TEXT NOT NULL,
  name_ordered    TEXT NOT NULL,
  name_picked     TEXT NOT NULL,
  picked_at       TIMESTAMPTZ NOT NULL,
  picker_id       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_dispute_history (
  id              TEXT PRIMARY KEY,
  customer_id     TEXT NOT NULL REFERENCES customers(id),
  related_order   TEXT,
  claim_type      TEXT NOT NULL,
  outcome         TEXT NOT NULL,
  amount_aud      NUMERIC(12, 2),
  opened_at       TIMESTAMPTZ NOT NULL,
  notes           TEXT
);

CREATE TABLE disputes (
  id                 TEXT PRIMARY KEY,
  case_number        TEXT NOT NULL UNIQUE,
  order_id           TEXT NOT NULL REFERENCES orders(id),
  customer_id        TEXT NOT NULL REFERENCES customers(id),
  claim_type         TEXT NOT NULL,
  customer_message   TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'open',
  amount_aud         NUMERIC(12, 2) NOT NULL,
  demo               BOOLEAN NOT NULL DEFAULT FALSE,
  expected_recommendation TEXT,
  expected_action    TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE investigations (
  id              TEXT PRIMARY KEY,
  dispute_id      TEXT NOT NULL REFERENCES disputes(id),
  status          TEXT NOT NULL,
  risk            TEXT,
  recommendation  TEXT,
  recommended_action TEXT,
  reason          TEXT,
  finding_json    JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

CREATE TABLE investigation_evidence (
  id                 TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  investigation_id   TEXT NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
  evidence_key       TEXT NOT NULL,
  source             TEXT NOT NULL,
  fact               TEXT NOT NULL,
  source_record_id   TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE decisions (
  id                 TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  investigation_id   TEXT NOT NULL REFERENCES investigations(id),
  ai_recommendation  TEXT,
  human_decision     TEXT NOT NULL,
  decided_by         TEXT NOT NULL,
  role_label         TEXT NOT NULL DEFAULT 'Manager',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id              BIGSERIAL PRIMARY KEY,
  event_type      TEXT NOT NULL,
  payload         JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Policy chunks for RAG (filled by npm run rag:index)
CREATE TABLE policy_chunks (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  doc_name     TEXT NOT NULL,
  section      TEXT,
  chunk_index  INT NOT NULL,
  content      TEXT NOT NULL,
  embedding    vector(1536),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_disputes_case ON disputes(case_number);
CREATE INDEX idx_history_customer ON customer_dispute_history(customer_id);
CREATE INDEX idx_policy_doc ON policy_chunks(doc_name);
