export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    created_at: string;
}

export interface Workspace {
    id: string;
    name: string;
    description?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface Board {
    id: string;
    workspace_id: string;
    name: string;
    background: string;
    is_public: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface List {
    id: string;
    board_id: string;
    name: string;
    position: number;
    is_archived: boolean;
    created_at: string;
    cards?: Card[];
}

export interface Card {
    id: string;
    list_id: string;
    title: string;
    description?: string;
    position: number;
    due_date?: string;
    is_archived: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
    labels?: Label[];
    members?: User[];
    checklists?: Checklist[];
    comments?: Comment[];
}

export interface Label {
    id: string;
    board_id: string;
    name?: string;
    color: string;
}

export interface Checklist {
    id: string;
    card_id: string;
    title: string;
    position: number;
    items?: ChecklistItem[];
}

export interface ChecklistItem {
    id: string;
    checklist_id: string;
    title: string;
    is_completed: boolean;
    position: number;
}

export interface Comment {
    id: string;
    card_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    user?: User;
}

export interface Activity {
    id: string;
    board_id: string;
    user_id: string;
    action: string;
    entity_type?: string;
    entity_id?: string;
    metadata?: Record<string, unknown>;
    created_at: string;
    user?: User;
}
