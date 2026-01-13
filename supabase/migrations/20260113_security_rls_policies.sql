-- =============================================
-- Security Fix: Complete RLS Policies
-- Run this in Supabase SQL Editor
-- =============================================

-- Labels policies
CREATE POLICY "Users can view labels in accessible boards" ON labels
  FOR SELECT USING (
    board_id IN (SELECT id FROM boards WHERE created_by = auth.uid() OR is_public = true)
  );

CREATE POLICY "Users can manage labels in their boards" ON labels
  FOR ALL USING (
    board_id IN (SELECT id FROM boards WHERE created_by = auth.uid())
  );

-- Card Labels policies
CREATE POLICY "Users can view card labels in accessible cards" ON card_labels
  FOR SELECT USING (
    card_id IN (
      SELECT c.id FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE b.created_by = auth.uid() OR b.is_public = true
    )
  );

CREATE POLICY "Users can manage card labels in their boards" ON card_labels
  FOR ALL USING (
    card_id IN (
      SELECT c.id FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE b.created_by = auth.uid()
    )
  );

-- Card Members policies
CREATE POLICY "Users can view card members in accessible cards" ON card_members
  FOR SELECT USING (
    card_id IN (
      SELECT c.id FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE b.created_by = auth.uid() OR b.is_public = true
    )
  );

CREATE POLICY "Users can manage card members in their boards" ON card_members
  FOR ALL USING (
    card_id IN (
      SELECT c.id FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE b.created_by = auth.uid()
    )
  );

-- Checklists policies
CREATE POLICY "Users can view checklists in accessible cards" ON checklists
  FOR SELECT USING (
    card_id IN (
      SELECT c.id FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE b.created_by = auth.uid() OR b.is_public = true
    )
  );

CREATE POLICY "Users can manage checklists in their boards" ON checklists
  FOR ALL USING (
    card_id IN (
      SELECT c.id FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE b.created_by = auth.uid()
    )
  );

-- Checklist Items policies
CREATE POLICY "Users can view checklist items in accessible checklists" ON checklist_items
  FOR SELECT USING (
    checklist_id IN (
      SELECT ch.id FROM checklists ch
      JOIN cards c ON ch.card_id = c.id
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE b.created_by = auth.uid() OR b.is_public = true
    )
  );

CREATE POLICY "Users can manage checklist items in their boards" ON checklist_items
  FOR ALL USING (
    checklist_id IN (
      SELECT ch.id FROM checklists ch
      JOIN cards c ON ch.card_id = c.id
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE b.created_by = auth.uid()
    )
  );

-- Comments policies
CREATE POLICY "Users can view comments in accessible cards" ON comments
  FOR SELECT USING (
    card_id IN (
      SELECT c.id FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE b.created_by = auth.uid() OR b.is_public = true
    )
  );

CREATE POLICY "Users can create comments in accessible cards" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    card_id IN (
      SELECT c.id FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE b.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Activities policies (audit log - read-only for board owners)
CREATE POLICY "Users can view activities in their boards" ON activities
  FOR SELECT USING (
    board_id IN (SELECT id FROM boards WHERE created_by = auth.uid())
  );

CREATE POLICY "System can insert activities" ON activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
