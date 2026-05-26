-- CESA Financial OS — Claude API Cost Tracker
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/giznzfbmotrsuokkmxzx/sql

-- ── api_usage_logs: one row per Claude API call ──────────────────────────────
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  agent_type    TEXT        NOT NULL CHECK (agent_type IN ('cfo', 'tax')),
  model         TEXT        NOT NULL,
  input_tokens  INTEGER     NOT NULL DEFAULT 0,
  output_tokens INTEGER     NOT NULL DEFAULT 0,
  cost_usd      NUMERIC(10, 6) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_api_usage_created_at  ON api_usage_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_agent_type  ON api_usage_logs (agent_type);

ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon full access" ON api_usage_logs
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "authenticated full access" ON api_usage_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── api_settings: single-row config table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_settings (
  id                  INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  monthly_budget_eur  NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the single settings row
INSERT INTO api_settings (id, monthly_budget_eur)
VALUES (1, 10.00)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE api_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon full access" ON api_settings
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "authenticated full access" ON api_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
