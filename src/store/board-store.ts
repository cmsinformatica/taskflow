import { create } from "zustand";
import type { Board, List, Card, Workspace } from "@/types";

interface BoardState {
    // Current workspace
    currentWorkspace: Workspace | null;
    setCurrentWorkspace: (workspace: Workspace | null) => void;

    // Current board
    currentBoard: Board | null;
    setCurrentBoard: (board: Board | null) => void;

    // Lists
    lists: List[];
    setLists: (lists: List[]) => void;
    addList: (list: List) => void;
    updateList: (id: string, updates: Partial<List>) => void;
    deleteList: (id: string) => void;
    reorderLists: (lists: List[]) => void;

    // Cards
    addCard: (listId: string, card: Card) => void;
    updateCard: (listId: string, cardId: string, updates: Partial<Card>) => void;
    deleteCard: (listId: string, cardId: string) => void;
    moveCard: (
        fromListId: string,
        toListId: string,
        cardId: string,
        newPosition: number
    ) => void;

    // Modal state
    selectedCard: Card | null;
    setSelectedCard: (card: Card | null) => void;
    isCardModalOpen: boolean;
    setCardModalOpen: (open: boolean) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
    currentWorkspace: null,
    setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

    currentBoard: null,
    setCurrentBoard: (board) => set({ currentBoard: board }),

    lists: [],
    setLists: (lists) => set({ lists }),

    addList: (list) => set((state) => ({ lists: [...state.lists, list] })),

    updateList: (id, updates) =>
        set((state) => ({
            lists: state.lists.map((list) =>
                list.id === id ? { ...list, ...updates } : list
            ),
        })),

    deleteList: (id) =>
        set((state) => ({
            lists: state.lists.filter((list) => list.id !== id),
        })),

    reorderLists: (lists) => set({ lists }),

    addCard: (listId, card) =>
        set((state) => ({
            lists: state.lists.map((list) =>
                list.id === listId
                    ? { ...list, cards: [...(list.cards || []), card] }
                    : list
            ),
        })),

    updateCard: (listId, cardId, updates) =>
        set((state) => ({
            lists: state.lists.map((list) =>
                list.id === listId
                    ? {
                        ...list,
                        cards: list.cards?.map((card) =>
                            card.id === cardId ? { ...card, ...updates } : card
                        ),
                    }
                    : list
            ),
        })),

    deleteCard: (listId, cardId) =>
        set((state) => ({
            lists: state.lists.map((list) =>
                list.id === listId
                    ? {
                        ...list,
                        cards: list.cards?.filter((card) => card.id !== cardId),
                    }
                    : list
            ),
        })),

    moveCard: (fromListId, toListId, cardId, newPosition) => {
        const { lists } = get();
        const fromList = lists.find((l) => l.id === fromListId);
        const card = fromList?.cards?.find((c) => c.id === cardId);

        if (!card) return;

        set((state) => ({
            lists: state.lists.map((list) => {
                if (list.id === fromListId) {
                    return {
                        ...list,
                        cards: list.cards?.filter((c) => c.id !== cardId),
                    };
                }
                if (list.id === toListId) {
                    const cards = [...(list.cards || [])];
                    cards.splice(newPosition, 0, { ...card, list_id: toListId });
                    return { ...list, cards };
                }
                return list;
            }),
        }));
    },

    selectedCard: null,
    setSelectedCard: (card) => set({ selectedCard: card }),

    isCardModalOpen: false,
    setCardModalOpen: (open) => set({ isCardModalOpen: open }),
}));
