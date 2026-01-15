-- Migration: Add Reset User Data Function
-- Date: 2026-01-15
-- Description: A stored procedure to safely and atomically wipe all user data while keeping the account active.

CREATE OR REPLACE FUNCTION reset_user_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres), allowing bypass of RLS if needed, but we check auth.uid()
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- 1. Get the current user ID safely
  target_user_id := auth.uid();

  -- Safety check: Ensure we have a user
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Perform Deletions (Order matters if there are foreign keys without cascade, though usually we have cascading deletes)
  -- Deleting transactional data first
  DELETE FROM transactions WHERE user_id = target_user_id;
  DELETE FROM credit_cards WHERE user_id = target_user_id;
  DELETE FROM financial_goals WHERE user_id = target_user_id;
  DELETE FROM debts WHERE user_id = target_user_id;
  DELETE FROM ai_rules WHERE user_id = target_user_id;
  DELETE FROM custom_categories WHERE user_id = target_user_id;
  
  -- Deleting Gamification History
  DELETE FROM xp_history WHERE user_id = target_user_id;
  DELETE FROM user_achievements WHERE user_id = target_user_id;
  DELETE FROM weekly_challenges WHERE user_id = target_user_id;
  DELETE FROM streaks WHERE user_id = target_user_id;

  -- 3. Reset Profile Stats (Do not delete the profile itself)
  UPDATE profiles 
  SET 
    xp = 0,
    level = 1,
    main_goal = NULL,
    current_situation = NULL,
    has_onboarding = false
  WHERE user_id = target_user_id;

END;
$$;
