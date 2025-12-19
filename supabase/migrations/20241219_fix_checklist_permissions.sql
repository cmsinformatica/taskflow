-- =======================================================
-- FIX PERMISSIONS FOR AUXILIARY TABLES
-- (Checklists, Items, Comments, Labels)
-- =======================================================

-- 1. CHECKLISTS
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "policy_all_checklists_owner" ON checklists;
DROP POLICY IF EXISTS "policy_all_checklists_member" ON checklists;

CREATE POLICY "policy_all_checklists" ON checklists FOR ALL USING (
  EXISTS (
    SELECT 1 FROM cards c
    JOIN lists l ON c.list_id = l.id
    JOIN boards b ON l.board_id = b.id
    WHERE c.id = checklists.card_id
    AND (
      b.created_by = auth.uid() 
      OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = b.workspace_id AND wm.user_id = auth.uid())
    )
  )
);

-- 2. CHECKLIST ITEMS
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "policy_all_checklist_items" ON checklist_items;

CREATE POLICY "policy_all_checklist_items" ON checklist_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM checklists cl
    JOIN cards c ON cl.card_id = c.id
    JOIN lists l ON c.list_id = l.id
    JOIN boards b ON l.board_id = b.id
    WHERE cl.id = checklist_items.checklist_id
    AND (
      b.created_by = auth.uid() 
      OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = b.workspace_id AND wm.user_id = auth.uid())
    )
  )
);

-- 3. COMMENTS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "policy_all_comments" ON comments;

CREATE POLICY "policy_all_comments" ON comments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM cards c
    JOIN lists l ON c.list_id = l.id
    JOIN boards b ON l.board_id = b.id
    WHERE c.id = comments.card_id
    AND (
      b.created_by = auth.uid() 
      OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = b.workspace_id AND wm.user_id = auth.uid())
    )
  )
);

-- 4. LABELS (Board level)
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "policy_all_labels" ON labels;

CREATE POLICY "policy_all_labels" ON labels FOR ALL USING (
  EXISTS (
    SELECT 1 FROM boards b
    WHERE b.id = labels.board_id
    AND (
      b.created_by = auth.uid() 
      OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = b.workspace_id AND wm.user_id = auth.uid())
    )
  )
);

-- 5. CARD LABELS (Junction)
ALTER TABLE card_labels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "policy_all_card_labels" ON card_labels;

CREATE POLICY "policy_all_card_labels" ON card_labels FOR ALL USING (
  EXISTS (
    SELECT 1 FROM cards c
    JOIN lists l ON c.list_id = l.id
    JOIN boards b ON l.board_id = b.id
    WHERE c.id = card_labels.card_id
    AND (
      b.created_by = auth.uid() 
      OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = b.workspace_id AND wm.user_id = auth.uid())
    )
  )
);
