-- =============================================
-- CORREÇÃO DE PERMISSÕES (RLS) - "V2"
-- Execute isso no SQL Editor do Supabase
-- =============================================

-- 1. Permissões de Cartões (CARDS)
-- Removemos as políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Users can manage cards in their boards" ON cards;
DROP POLICY IF EXISTS "Workspace members can manage cards" ON cards;
DROP POLICY IF EXISTS "Manage cards" ON cards;

-- Criamos uma política robusta que permite criar/editar se você for DONO ou MEMBRO
CREATE POLICY "Manage cards" ON cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = cards.list_id
      AND (
          b.created_by = auth.uid() -- Você é o dono do quadro
          OR 
          EXISTS ( -- OU você é membro do workspace do quadro
              SELECT 1 FROM workspace_members wm 
              WHERE wm.workspace_id = b.workspace_id 
              AND wm.user_id = auth.uid()
          )
      )
    )
  );

-- Garantir leitura (Visualização)
DROP POLICY IF EXISTS "Users can view cards in accessible lists" ON cards;
CREATE POLICY "View cards" ON cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = cards.list_id
      AND (
          b.created_by = auth.uid() 
          OR b.is_public = true
          OR EXISTS (
              SELECT 1 FROM workspace_members wm 
              WHERE wm.workspace_id = b.workspace_id 
              AND wm.user_id = auth.uid()
          )
      )
    )
  );

-- 2. Permissões de Listas (LISTS)
DROP POLICY IF EXISTS "Users can manage lists in their boards" ON lists;
DROP POLICY IF EXISTS "Workspace members can manage lists" ON lists;

CREATE POLICY "Manage lists" ON lists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM boards b
      WHERE b.id = lists.board_id
      AND (
          b.created_by = auth.uid()
          OR 
          EXISTS (
              SELECT 1 FROM workspace_members wm 
              WHERE wm.workspace_id = b.workspace_id 
              AND wm.user_id = auth.uid()
          )
      )
    )
  );

-- 3. Permissões de Quadros (BOARDS)
-- Garante que membros consigam ver e editar boards
DROP POLICY IF EXISTS "Users can view boards in their workspaces" ON boards;
CREATE POLICY "View boards" ON boards
  FOR SELECT USING (
      created_by = auth.uid()
      OR is_public = true
      OR EXISTS (
          SELECT 1 FROM workspace_members wm 
          WHERE wm.workspace_id = boards.workspace_id 
          AND wm.user_id = auth.uid()
      )
  );

DROP POLICY IF EXISTS "Board owners can update" ON boards;
DROP POLICY IF EXISTS "Workspace members can update boards" ON boards;
CREATE POLICY "Update boards" ON boards
  FOR UPDATE USING (
      created_by = auth.uid()
      OR EXISTS (
          SELECT 1 FROM workspace_members wm 
          WHERE wm.workspace_id = boards.workspace_id 
          AND wm.user_id = auth.uid()
      )
  );
