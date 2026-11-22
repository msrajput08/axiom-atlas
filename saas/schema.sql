-- AxiomAtlas SaaS: additive Cloudflare D1 schema (NOT applied to production).
-- The public calculators do not use this database.
CREATE TABLE IF NOT EXISTS saas_projects (
  id TEXT PRIMARY KEY NOT NULL,
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 100),
  model TEXT NOT NULL CHECK(model = 'rlc_series_v1'),
  payload_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK(version >= 1),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_saas_projects_owner_updated
  ON saas_projects (owner_id, updated_at DESC);

-- Entitlements may only be written by trusted billing administration in a future release.
-- Having a row does not grant benefits until the server-side paid flag is enabled.
CREATE TABLE IF NOT EXISTS saas_entitlements (
  user_id TEXT PRIMARY KEY NOT NULL,
  plan TEXT NOT NULL CHECK(plan IN ('studio','business')),
  status TEXT NOT NULL CHECK(status IN ('trialing','active','past_due','canceled','expired')),
  current_period_end TEXT NOT NULL,
  billing_provider TEXT,
  provider_subscription_id TEXT UNIQUE,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Fixed-minute buckets. Delete expired buckets by a scheduled maintenance process.
CREATE TABLE IF NOT EXISTS saas_rate_limits (
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('read','write')),
  window_minute INTEGER NOT NULL,
  attempts INTEGER NOT NULL CHECK(attempts >= 1),
  PRIMARY KEY (actor_id, action, window_minute)
);
CREATE INDEX IF NOT EXISTS idx_saas_rate_limits_window ON saas_rate_limits(window_minute);
