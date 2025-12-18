-- =======================================================
-- FINAL FIX (NUCLEAR OPTION)
-- Removemos TODAS as regras anteriores para garantir que
-- não sobrou nenhuma regra 'permissiva' antiga.
-- =======================================================

-- 1. Limpar TODAS as Policies de CARDS
DROP POLICY IF EXISTS "Users can manage cards in their boards" ON cards;
DROP POLICY IF EXISTS "Workspace members can manage cards" ON cards;
DROP POLICY IF EXISTS "Manage cards" ON cards;
DROP POLICY IF EXISTS "Users can view cards in accessible lists" ON cards;
DROP POLICY IF EXISTS "View cards" ON cards;
DROP POLICY IF EXISTS "Enable read access for all users" ON cards;
DROP POLICY IF EXISTS "Enable insert access for all users" ON cards;
DROP POLICY IF EXISTS "Enable update access for all users" ON cards;
DROP POLICY IF EXISTS "Enable delete access for all users" ON cards;

-- 2. Limpar TODAS as Policies de LISTS
DROP POLICY IF EXISTS "Users can manage lists in their boards" ON lists;
DROP POLICY IF EXISTS "Workspace members can manage lists" ON lists;
DROP POLICY IF EXISTS "Manage lists" ON lists;
DROP POLICY IF EXISTS "Enable read access for all users" ON lists;

-- 3. Limpar TODAS as Policies de BOARDS
DROP POLICY IF EXISTS "Users can view boards in their workspaces" ON boards;
DROP POLICY IF EXISTS "View boards" ON boards;
DROP POLICY IF EXISTS "Users can create boards in their workspaces" ON boards;
DROP POLICY IF EXISTS "Board owners can update" ON boards;
DROP POLICY IF EXISTS "Workspace members can update boards" ON boards;
DROP POLICY IF EXISTS "Update boards" ON boards;
DROP POLICY IF EXISTS "Enable read access for all users" ON boards;


-- =======================================================
-- RECRIAR AS REGRAS (Somente o que é necessário)
-- =======================================================

-- BOARDS
CREATE POLICY "policy_view_boards" ON boards FOR SELECT USING (
  created_by = auth.uid() 
  OR is_public = true 
  OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = boards.workspace_id AND wm.user_id = auth.uid())
);

CREATE POLICY "policy_insert_boards" ON boards FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "policy_update_boards" ON boards FOR UPDATE USING (
  created_by = auth.uid() 
  OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = boards.workspace_id AND wm.user_id = auth.uid())
);

CREATE POLICY "policy_delete_boards" ON boards FOR DELETE USING (
  created_by = auth.uid() 
);


-- LISTS
CREATE POLICY "policy_all_lists" ON lists FOR ALL USING (
  EXISTS (
    SELECT 1 FROM boards b 
    WHERE b.id = lists.board_id 
    AND (
      b.created_by = auth.uid() 
      OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = b.workspace_id AND wm.user_id = auth.uid())
    )
  )
);

CREATE POLICY "policy_view_lists" ON lists FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM boards b 
    WHERE b.id = lists.board_id 
    AND (
      b.created_by = auth.uid() 
      OR b.is_public = true
      OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = b.workspace_id AND wm.user_id = auth.uid())
    )
  )
);


-- CARDS
CREATE POLICY "policy_all_cards" ON cards FOR ALL USING (
  EXISTS (
    SELECT 1 FROM lists l
    JOIN boards b ON l.board_id = b.id
    WHERE l.id = cards.list_id
    AND (
      b.created_by = auth.uid() 
      OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = b.workspace_id AND wm.user_id = auth.uid())
    )
  )
);

CREATE POLICY "policy_view_cards" ON cards FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM lists l
    JOIN boards b ON l.board_id = b.id
    WHERE l.id = cards.list_id
    AND (
      b.created_by = auth.uid() 
      OR b.is_public = true
      OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = b.workspace_id AND wm.user_id = auth.uid())
    )
  )
);
