import { createClient } from "@/lib/supabase/client";
import type { Board, List, Card, Label, Checklist, ChecklistItem, Comment } from "@/types";
import type { Subscription } from "@/types/subscription";

function getSupabase() {
    return createClient();
}

// ============================================
// BOARDS
// ============================================

export async function getBoards(): Promise<Board[]> {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("boards")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching boards:", error);
        return [];
    }

    return (data || []).map((board: Record<string, unknown>) => ({
        id: board.id as string,
        workspace_id: (board.workspace_id as string) || "",
        name: board.name as string,
        background: (board.background as string) || "#264653",
        is_public: (board.is_public as boolean) || false,
        created_by: (board.created_by as string) || "",
        created_at: board.created_at as string,
        updated_at: board.updated_at as string,
    }));
}

export async function createBoard(name: string, background: string): Promise<Board | null> {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("boards")
        .insert({
            name,
            background,
            created_by: user.id,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating board:", error);
        return null;
    }

    return {
        id: data.id,
        workspace_id: data.workspace_id || "",
        name: data.name,
        background: data.background,
        is_public: data.is_public,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
    };
}

export async function updateBoard(id: string, updates: Partial<Board>): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase
        .from("boards")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) {
        console.error("Error updating board:", error);
        return false;
    }
    return true;
}

export async function deleteBoard(id: string): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase.from("boards").delete().eq("id", id);
    if (error) {
        console.error("Error deleting board:", error);
        return false;
    }
    return true;
}

// ============================================
// LISTS
// ============================================

export async function getLists(boardId: string): Promise<List[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from("lists")
        .select(`
      *,
      cards (
        *,
        checklists (
          *,
          checklist_items (*)
        ),
        comments (*),
        card_labels (
          label_id,
          labels (*)
        )
      )
    `)
        .eq("board_id", boardId)
        .eq("is_archived", false)
        .order("position");

    if (error) {
        console.error("Error fetching lists:", error);
        return [];
    }

    return (data || []).map((list: Record<string, unknown>) => ({
        id: list.id as string,
        board_id: list.board_id as string,
        name: list.name as string,
        position: list.position as number,
        is_archived: list.is_archived as boolean,
        created_at: list.created_at as string,
        wipLimit: list.wip_limit as number | undefined,
        cards: ((list.cards as Record<string, unknown>[]) || [])
            .filter((c) => !c.is_archived)
            .sort((a, b) => (a.position as number) - (b.position as number))
            .map((card) => ({
                id: card.id as string,
                list_id: card.list_id as string,
                title: card.title as string,
                description: card.description as string | undefined,
                position: card.position as number,
                due_date: card.due_date as string | undefined,
                is_archived: card.is_archived as boolean,
                created_by: card.created_by as string,
                created_at: card.created_at as string,
                updated_at: card.updated_at as string,
                labels: ((card.card_labels as { labels: Label }[]) || []).map((cl) => cl.labels),
                checklists: (card.checklists as Checklist[]) || [],
                comments: (card.comments as Comment[]) || [],
            })),
    }));
}

export async function createList(boardId: string, name: string, position: number): Promise<List | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from("lists")
        .insert({
            board_id: boardId,
            name,
            position,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating list:", error);
        return null;
    }

    return {
        id: data.id,
        board_id: data.board_id,
        name: data.name,
        position: data.position,
        is_archived: data.is_archived,
        created_at: data.created_at,
        cards: [],
    };
}

export async function updateList(id: string, updates: Partial<List>): Promise<boolean> {
    const supabase = getSupabase();
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.position !== undefined) dbUpdates.position = updates.position;
    if (updates.wipLimit !== undefined) dbUpdates.wip_limit = updates.wipLimit;
    if (updates.is_archived !== undefined) dbUpdates.is_archived = updates.is_archived;

    const { error } = await supabase.from("lists").update(dbUpdates).eq("id", id);
    if (error) {
        console.error("Error updating list:", error);
        return false;
    }
    return true;
}

export async function deleteList(id: string): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase.from("lists").delete().eq("id", id);
    if (error) {
        console.error("Error deleting list:", error);
        return false;
    }
    return true;
}

// ============================================
// CARDS
// ============================================

export async function createCard(listId: string, title: string, position: number): Promise<Card | null> {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from("cards")
        .insert({
            list_id: listId,
            title,
            position,
            created_by: user?.id,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating card:", error);
        return null;
    }

    return {
        id: data.id,
        list_id: data.list_id,
        title: data.title,
        description: data.description,
        position: data.position,
        due_date: data.due_date,
        is_archived: data.is_archived,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
    };
}

export async function updateCard(id: string, updates: Partial<Card>): Promise<boolean> {
    const supabase = getSupabase();
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.position !== undefined) dbUpdates.position = updates.position;
    if (updates.due_date !== undefined) dbUpdates.due_date = updates.due_date;
    if (updates.list_id !== undefined) dbUpdates.list_id = updates.list_id;
    if (updates.is_archived !== undefined) dbUpdates.is_archived = updates.is_archived;

    const { error } = await supabase.from("cards").update(dbUpdates).eq("id", id);
    if (error) {
        console.error("Error updating card:", error);
        return false;
    }
    return true;
}

export async function deleteCard(id: string): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (error) {
        console.error("Error deleting card:", error);
        return false;
    }
    return true;
}

export async function moveCard(cardId: string, newListId: string, newPosition: number): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase
        .from("cards")
        .update({
            list_id: newListId,
            position: newPosition,
            updated_at: new Date().toISOString(),
        })
        .eq("id", cardId);

    if (error) {
        console.error("Error moving card:", error);
        return false;
    }
    return true;
}

// ============================================
// LABELS
// ============================================

export async function createLabel(boardId: string, name: string, color: string): Promise<Label | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from("labels")
        .insert({ board_id: boardId, name, color })
        .select()
        .single();

    if (error) {
        console.error("Error creating label:", error);
        return null;
    }

    return data;
}

export async function addLabelToCard(cardId: string, labelId: string): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase
        .from("card_labels")
        .insert({ card_id: cardId, label_id: labelId });

    if (error) {
        console.error("Error adding label to card:", error);
        return false;
    }
    return true;
}

export async function removeLabelFromCard(cardId: string, labelId: string): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase
        .from("card_labels")
        .delete()
        .eq("card_id", cardId)
        .eq("label_id", labelId);

    if (error) {
        console.error("Error removing label from card:", error);
        return false;
    }
    return true;
}

// ============================================
// CHECKLISTS
// ============================================

export async function createChecklist(cardId: string, title: string, position: number): Promise<Checklist | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from("checklists")
        .insert({ card_id: cardId, title, position })
        .select()
        .single();

    if (error) {
        console.error("Error creating checklist:", error);
        return null;
    }

    return { ...data, items: [] };
}

export async function deleteChecklist(id: string): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase.from("checklists").delete().eq("id", id);
    if (error) {
        console.error("Error deleting checklist:", error);
        return false;
    }
    return true;
}

export async function createChecklistItem(
    checklistId: string,
    title: string,
    position: number
): Promise<ChecklistItem | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from("checklist_items")
        .insert({ checklist_id: checklistId, title, position })
        .select()
        .single();

    if (error) {
        console.error("Error creating checklist item:", error);
        return null;
    }

    return data;
}

export async function updateChecklistItem(id: string, isCompleted: boolean): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase
        .from("checklist_items")
        .update({ is_completed: isCompleted })
        .eq("id", id);

    if (error) {
        console.error("Error updating checklist item:", error);
        return false;
    }
    return true;
}

// ============================================
// COMMENTS
// ============================================

export async function createComment(cardId: string, content: string): Promise<Comment | null> {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("comments")
        .insert({ card_id: cardId, user_id: user.id, content })
        .select()
        .single();

    if (error) {
        console.error("Error creating comment:", error);
        return null;
    }

    return data;
}

export async function deleteComment(id: string): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) {
        console.error("Error deleting comment:", error);
        return false;
    }
    return true;
}

// ============================================
// SUBSCRIPTIONS
// ============================================

export async function getSubscription(): Promise<Subscription | null> {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("profiles")
        .select("subscription_status, stripe_customer_id, stripe_subscription_id, trial_end")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error("Error fetching subscription:", error);
        return null;
    }

    // Map profiles data to Subscription object
    // Default to 'free'/null if data is missing
    const status = data.subscription_status || "free";
    const isPro = status === "active" || status === "trialing";

    return {
        userId: user.id,
        plan: isPro ? "pro" : "free",
        status: status as any,
        trialEndsAt: data.trial_end,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        currentPeriodEnd: null, // Not stored in profiles currently
        createdAt: new Date().toISOString(), // Placeholder
    };
}

export async function updateSubscription(updates: Partial<Subscription>): Promise<boolean> {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.plan !== undefined) dbUpdates.plan = updates.plan;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.stripeCustomerId !== undefined) dbUpdates.stripe_customer_id = updates.stripeCustomerId;
    if (updates.stripeSubscriptionId !== undefined) dbUpdates.stripe_subscription_id = updates.stripeSubscriptionId;
    if (updates.currentPeriodEnd !== undefined) dbUpdates.current_period_end = updates.currentPeriodEnd;

    const { error } = await supabase
        .from("subscriptions")
        .update(dbUpdates)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error updating subscription:", error);
        return false;
    }
    return true;
}
