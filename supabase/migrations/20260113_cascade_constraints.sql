-- =============================================
-- Security Fix: Add ON DELETE CASCADE to Foreign Keys
-- Run this in Supabase SQL Editor AFTER the RLS policies migration
-- =============================================

-- Activities: Cascade on board and user delete
ALTER TABLE activities 
  DROP CONSTRAINT IF EXISTS activities_board_id_fkey,
  ADD CONSTRAINT activities_board_id_fkey 
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE;

-- Labels: Cascade on board delete
ALTER TABLE labels 
  DROP CONSTRAINT IF EXISTS labels_board_id_fkey,
  ADD CONSTRAINT labels_board_id_fkey 
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE;

-- Cards: Cascade on list delete
ALTER TABLE cards 
  DROP CONSTRAINT IF EXISTS cards_list_id_fkey,
  ADD CONSTRAINT cards_list_id_fkey 
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE;

-- Checklists: Cascade on card delete
ALTER TABLE checklists 
  DROP CONSTRAINT IF EXISTS checklists_card_id_fkey,
  ADD CONSTRAINT checklists_card_id_fkey 
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE;

-- Checklist Items: Cascade on checklist delete
ALTER TABLE checklist_items 
  DROP CONSTRAINT IF EXISTS checklist_items_checklist_id_fkey,
  ADD CONSTRAINT checklist_items_checklist_id_fkey 
    FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE;

-- Comments: Cascade on card delete
ALTER TABLE comments 
  DROP CONSTRAINT IF EXISTS comments_card_id_fkey,
  ADD CONSTRAINT comments_card_id_fkey 
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE;

-- Card Labels: Already has CASCADE via cards and labels FKs
-- Card Members: Already has CASCADE via cards FK

-- =============================================
-- Note: We intentionally do NOT cascade user deletions
-- to preserve audit trail in activities table.
-- =============================================
