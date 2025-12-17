"use client";

import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    horizontalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { useState } from "react";
import Link from "next/link";
import { useBoardStore } from "@/store/board-store";
import { ListContainer } from "@/components/list";
import { CardModal, FocusMode } from "@/components/card";
import { Button, Input } from "@/components/ui";
import { Plus, X, ArrowLeft, MoreHorizontal, LayoutGrid } from "lucide-react";
import { List, Card } from "@/types";

export function BoardView() {
    const {
        currentBoard,
        lists,
        setLists,
        addList,
        moveCard,
        reorderLists,
    } = useBoardStore();

    const [isAddingList, setIsAddingList] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<"list" | "card" | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 8,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const handleAddList = () => {
        if (!newListName.trim()) return;

        const newList: List = {
            id: crypto.randomUUID(),
            board_id: currentBoard?.id || "",
            name: newListName.trim(),
            position: lists.length + 1,
            is_archived: false,
            created_at: new Date().toISOString(),
            cards: [],
        };

        addList(newList);
        setNewListName("");
        setIsAddingList(false);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const type = active.data.current?.type;
        setActiveId(active.id as string);
        setActiveType(type);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeType = active.data.current?.type;
        const overType = over.data.current?.type;

        if (activeType !== "card") return;

        const activeCard = active.data.current?.card as Card;
        const activeListId = active.data.current?.listId as string;

        let overListId: string;

        if (overType === "card") {
            overListId = over.data.current?.listId as string;
        } else if (overType === "list") {
            overListId = (over.data.current?.list as List).id;
        } else {
            return;
        }

        if (activeListId !== overListId) {
            const overList = lists.find((l) => l.id === overListId);
            const overCards = overList?.cards || [];

            let newPosition = 0;
            if (overType === "card") {
                const overCard = over.data.current?.card as Card;
                const overIndex = overCards.findIndex((c) => c.id === overCard.id);
                newPosition = overIndex;
            } else {
                newPosition = overCards.length;
            }

            moveCard(activeListId, overListId, activeCard.id, newPosition);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveType(null);

        if (!over) return;

        const activeType = active.data.current?.type;

        if (activeType === "list") {
            const oldIndex = lists.findIndex((l) => `list-${l.id}` === active.id);
            const newIndex = lists.findIndex((l) => `list-${l.id}` === over.id);

            if (oldIndex !== newIndex) {
                const newLists = arrayMove(lists, oldIndex, newIndex);
                reorderLists(newLists);
            }
        }

        if (activeType === "card") {
            const activeCardId = active.id as string;
            const activeListId = active.data.current?.listId as string;
            const overType = over.data.current?.type;

            if (overType === "card") {
                const overCardId = over.id as string;
                const overListId = over.data.current?.listId as string;

                if (activeListId === overListId) {
                    const list = lists.find((l) => l.id === activeListId);
                    const cards = list?.cards || [];
                    const oldIndex = cards.findIndex((c) => c.id === activeCardId);
                    const newIndex = cards.findIndex((c) => c.id === overCardId);

                    if (oldIndex !== newIndex) {
                        const newCards = arrayMove(cards, oldIndex, newIndex);
                        setLists(
                            lists.map((l) =>
                                l.id === activeListId ? { ...l, cards: newCards } : l
                            )
                        );
                    }
                }
            }
        }
    };

    const listIds = lists.map((list) => `list-${list.id}`);

    return (
        <div
            className="h-screen flex flex-col"
            style={{
                background: currentBoard?.background || "#264653",
            }}
        >
            {/* Board Header */}
            <header className="px-4 sm:px-6 py-3 sm:py-4 bg-black/10 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link
                            href="/dashboard"
                            className="p-2 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex w-8 h-8 rounded-lg bg-white/20 items-center justify-center">
                                <LayoutGrid className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="text-lg sm:text-xl font-semibold text-white truncate max-w-[180px] sm:max-w-none">
                                {currentBoard?.name || "Meu Quadro"}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Board Content */}
            <main className="flex-1 overflow-x-auto overflow-y-hidden p-4 sm:p-6">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-4 items-start h-full pb-4">
                        <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
                            {lists.map((list) => (
                                <ListContainer key={list.id} list={list} />
                            ))}
                        </SortableContext>

                        {/* Add List */}
                        {isAddingList ? (
                            <div className="w-72 flex-shrink-0 bg-white rounded-2xl p-4 shadow-sm">
                                <Input
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    placeholder="Nome da lista..."
                                    className="border-[#E0E0E0] rounded-xl mb-3"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAddList();
                                        if (e.key === "Escape") {
                                            setIsAddingList(false);
                                            setNewListName("");
                                        }
                                    }}
                                />
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={handleAddList}
                                        size="sm"
                                        className="bg-[#264653] hover:bg-[#1d3640] rounded-xl"
                                    >
                                        Adicionar lista
                                    </Button>
                                    <button
                                        onClick={() => {
                                            setIsAddingList(false);
                                            setNewListName("");
                                        }}
                                        className="p-2 rounded-xl hover:bg-[#F5F7F8] transition-colors"
                                    >
                                        <X className="w-5 h-5 text-[#6B7280]" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAddingList(true)}
                                className="w-72 flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-medium transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Adicionar lista</span>
                            </button>
                        )}
                    </div>

                    <DragOverlay>
                        {activeId && activeType === "list" && (
                            <div className="w-72 bg-white rounded-2xl p-4 shadow-lg rotate-2">
                                <div className="font-semibold text-[#264653]">
                                    {lists.find((l) => `list-${l.id}` === activeId)?.name}
                                </div>
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            </main>

            <CardModal />
            <FocusMode />
        </div>
    );
}
