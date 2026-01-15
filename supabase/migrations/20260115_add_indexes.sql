-- Migration: Add Performance Indexes
-- Date: 2026-01-15
-- Description: Adds composite indexes to frequently queried tables to speed up dashboard loading.

-- 1. Transactions: Most critical table. Filtered by user_id and sorted by date_iso.
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date_iso DESC);

-- 2. Credit Cards: Filtered by user_id.
CREATE INDEX IF NOT EXISTS idx_credit_cards_user ON credit_cards(user_id);

-- 3. Financial Goals: Filtered by user_id.
CREATE INDEX IF NOT EXISTS idx_financial_goals_user ON financial_goals(user_id);

-- 4. Debts: Filtered by user_id.
CREATE INDEX IF NOT EXISTS idx_debts_user ON debts(user_id);

-- 5. AI Rules: Filtered by user_id.
CREATE INDEX IF NOT EXISTS idx_ai_rules_user ON ai_rules(user_id);

-- 6. Profiles: Lookup by ID is already PK, but we might query by user_id in auth flows if they differ (often they are the same in Supabase).
-- Ensure user_id foreign key is indexed if it's not the PK.
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
