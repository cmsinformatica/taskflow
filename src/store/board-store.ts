import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Board, List, Card, Workspace, DailyAchievement } from "@/types";

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

    // Focus Mode (Zen Mode)
    focusedCardId: string | null;
    focusedListId: string | null;
    setFocusMode: (cardId: string | null, listId: string | null) => void;

    // Timer actions
    startTimer: (listId: string, cardId: string) => void;
    stopTimer: (listId: string, cardId: string) => void;
    updateTimerSeconds: (listId: string, cardId: string, seconds: number) => void;

    // Daily achievements
    dailyAchievements: DailyAchievement[];
    addAchievement: (cardTitle: string, boardName: string) => void;
    getTodayAchievements: () => DailyAchievement | undefined;

    // Complete card (move to done + track achievement)
    completeCard: (listId: string, cardId: string) => void;
}

const getTodayDate = () => new Date().toISOString().split("T")[0];

export const useBoardStore = create<BoardState>()(
    persist(
        (set, get) => ({
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

            // Focus Mode
            focusedCardId: null,
            focusedListId: null,
            setFocusMode: (cardId, listId) =>
                set({ focusedCardId: cardId, focusedListId: listId }),

            // Timer
            startTimer: (listId, cardId) =>
                set((state) => ({
                    lists: state.lists.map((list) =>
                        list.id === listId
                            ? {
                                ...list,
                                cards: list.cards?.map((card) =>
                                    card.id === cardId
                                        ? {
                                            ...card,
                                            timer: {
                                                isRunning: true,
                                                startedAt: new Date().toISOString(),
                                                totalSeconds: card.timer?.totalSeconds || 0,
                                                pomodoroCount: card.timer?.pomodoroCount || 0,
                                            },
                                        }
                                        : card
                                ),
                            }
                            : list
                    ),
                })),

            stopTimer: (listId, cardId) => {
                const { lists } = get();
                const list = lists.find((l) => l.id === listId);
                const card = list?.cards?.find((c) => c.id === cardId);
                const timer = card?.timer;

                if (!timer?.startedAt) return;

                const elapsed = Math.floor(
                    (Date.now() - new Date(timer.startedAt).getTime()) / 1000
                );

                set((state) => ({
                    lists: state.lists.map((list) =>
                        list.id === listId
                            ? {
                                ...list,
                                cards: list.cards?.map((card) =>
                                    card.id === cardId
                                        ? {
                                            ...card,
                                            timer: {
                                                isRunning: false,
                                                totalSeconds: (card.timer?.totalSeconds || 0) + elapsed,
                                                pomodoroCount: card.timer?.pomodoroCount || 0,
                                            },
                                        }
                                        : card
                                ),
                            }
                            : list
                    ),
                }));
            },

            updateTimerSeconds: (listId, cardId, seconds) =>
                set((state) => ({
                    lists: state.lists.map((list) =>
                        list.id === listId
                            ? {
                                ...list,
                                cards: list.cards?.map((card) =>
                                    card.id === cardId
                                        ? {
                                            ...card,
                                            timer: {
                                                ...card.timer,
                                                totalSeconds: seconds,
                                                isRunning: card.timer?.isRunning || false,
                                                pomodoroCount: card.timer?.pomodoroCount || 0,
                                            },
                                        }
                                        : card
                                ),
                            }
                            : list
                    ),
                })),

            // Daily achievements
            dailyAchievements: [],

            addAchievement: (cardTitle, boardName) => {
                const today = getTodayDate();
                set((state) => {
                    const existing = state.dailyAchievements.find((a) => a.date === today);
                    if (existing) {
                        return {
                            dailyAchievements: state.dailyAchievements.map((a) =>
                                a.date === today
                                    ? {
                                        ...a,
                                        completedCards: [
                                            ...a.completedCards,
                                            {
                                                id: crypto.randomUUID(),
                                                title: cardTitle,
                                                boardName,
                                                completedAt: new Date().toISOString(),
                                            },
                                        ],
                                    }
                                    : a
                            ),
                        };
                    }
                    return {
                        dailyAchievements: [
                            ...state.dailyAchievements,
                            {
                                date: today,
                                completedCards: [
                                    {
                                        id: crypto.randomUUID(),
                                        title: cardTitle,
                                        boardName,
                                        completedAt: new Date().toISOString(),
                                    },
                                ],
                                totalPomodoros: 0,
                            },
                        ],
                    };
                });
            },

            getTodayAchievements: () => {
                const today = getTodayDate();
                return get().dailyAchievements.find((a) => a.date === today);
            },

            completeCard: (listId, cardId) => {
                const { lists, currentBoard, addAchievement } = get();
                const list = lists.find((l) => l.id === listId);
                const card = list?.cards?.find((c) => c.id === cardId);

                if (card && currentBoard) {
                    addAchievement(card.title, currentBoard.name);
                }

                set((state) => ({
                    lists: state.lists.map((list) =>
                        list.id === listId
                            ? {
                                ...list,
                                cards: list.cards?.map((card) =>
                                    card.id === cardId
                                        ? { ...card, completedAt: new Date().toISOString() }
                                        : card
                                ),
                            }
                            : list
                    ),
                }));
            },
        }),
        {
            name: "boardzen-store",
            partialize: (state) => ({
                dailyAchievements: state.dailyAchievements,
            }),
        }
    )
);
