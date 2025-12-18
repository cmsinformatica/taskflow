-- =============================================
-- Fixes for Collaboration and Subscriptions
-- =============================================

-- 1. Add Subscription Tracking to Profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;

-- 2. Fix Workspace Collaboration Policies

-- Drop existing restrictive policies for Workspaces (if necessary to refine)
-- (Assuming standard ones exist, we will ensure members can view)
-- The existing policy "Users can view workspaces they belong to" is likely fine if it checks workspace_members.
-- Let's double check Boards policies which are often the bottleneck.

-- 3. Fix Board/List/Card Collaboration Policies

-- Allow any workspace member to view boards (already exists usually, but reinforcing)
DROP POLICY IF EXISTS "Users can view boards in their workspaces" ON boards;
CREATE POLICY "Users can view boards in their workspaces" ON boards
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR created_by = auth.uid()
    OR is_public = true
  );

-- Allow workspace members to create boards
DROP POLICY IF EXISTS "Users can create boards in their workspaces" ON boards;
CREATE POLICY "Users can create boards in their workspaces" ON boards
  FOR INSERT WITH CHECK (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- CRITICAL: Allow workspace members to UPDATE boards (e.g. change title, background)
-- Previously restricted to owner
DROP POLICY IF EXISTS "Board owners can update" ON boards;
CREATE POLICY "Workspace members can update boards" ON boards
  FOR UPDATE USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR created_by = auth.uid()
  );

-- LISTS POLICIES
DROP POLICY IF EXISTS "Users can manage lists in their boards" ON lists;
CREATE POLICY "Workspace members can manage lists" ON lists
  FOR ALL USING (
    board_id IN (
      SELECT id FROM boards 
      WHERE workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
      OR created_by = auth.uid()
    )
  );

-- CARDS POLICIES
DROP POLICY IF EXISTS "Users can manage cards in their boards" ON cards;
CREATE POLICY "Workspace members can manage cards" ON cards
  FOR ALL USING (
    list_id IN (
        SELECT l.id FROM lists l
        INNER JOIN boards b ON l.board_id = b.id
        WHERE b.workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
        OR b.created_by = auth.uid()
    )
  );

-- 4. Fix comments policies
DROP POLICY IF EXISTS "Users can manage comments" ON comments; 
-- (Assuming one existed, if not we create one)
CREATE POLICY "Workspace members can comment" ON comments
  FOR ALL USING (
    card_id IN (
        SELECT c.id FROM cards c
        INNER JOIN lists l ON c.list_id = l.id
        INNER JOIN boards b ON l.board_id = b.id
        WHERE b.workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    )
  );
