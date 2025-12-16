"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { List, Card } from "@/types";
import { CardItem } from "@/components/card";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Plus, X } from "lucide-react";
import { useState } from "react";
import { useBoardStore } from "@/store/board-store";
import { Input, Button } from "@/components/ui";

interface ListContainerProps {
    list: List;
}

export function ListContainer({ list }: ListContainerProps) {
    const { addCard, updateList, deleteList } = useBoardStore();
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState("");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(list.name);

    const { setNodeRef: setDroppableRef } = useDroppable({
        id: `list-${list.id}`,
        data: {
            type: "list",
            list,
        },
    });

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `list-${list.id}`,
        data: {
            type: "list",
            list,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleAddCard = () => {
        if (!newCardTitle.trim()) return;

        const newCard: Card = {
            id: crypto.randomUUID(),
            list_id: list.id,
            title: newCardTitle.trim(),
            position: (list.cards?.length || 0) + 1,
            is_archived: false,
            created_by: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        addCard(list.id, newCard);
        setNewCardTitle("");
        setIsAddingCard(false);
    };

    const handleSaveTitle = () => {
        if (title.trim() && title !== list.name) {
            updateList(list.id, { name: title.trim() });
        }
        setIsEditingTitle(false);
    };

    const handleDeleteList = () => {
        if (confirm("Tem certeza que deseja excluir esta lista e todos os cards?")) {
            deleteList(list.id);
        }
    };

    const cards = list.cards || [];
    const cardIds = cards.map((card) => card.id);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "w-64 sm:w-72 flex-shrink-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-3 max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-200px)] flex flex-col",
                {
                    "opacity-50": isDragging,
                }
            )}
        >
            {/* Header */}
            <div
                {...attributes}
                {...listeners}
                className="flex items-center justify-between mb-3 cursor-grab active:cursor-grabbing"
            >
                {isEditingTitle ? (
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleSaveTitle}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                        className="font-semibold"
                        autoFocus
                    />
                ) : (
                    <h3
                        onClick={() => setIsEditingTitle(true)}
                        className="font-semibold text-gray-800 dark:text-gray-200 px-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer"
                    >
                        {list.name}
                    </h3>
                )}
                <button
                    onClick={handleDeleteList}
                    className="p-1 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50"
                >
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            {/* Cards */}
            <div
                ref={setDroppableRef}
                className="flex-1 overflow-y-auto space-y-2 min-h-[50px]"
            >
                <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                    {cards.map((card) => (
                        <CardItem key={card.id} card={card} listId={list.id} />
                    ))}
                </SortableContext>
            </div>

            {/* Add Card */}
            {isAddingCard ? (
                <div className="mt-3 space-y-2">
                    <textarea
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        placeholder="Insira um título para o card..."
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-sm"
                        rows={3}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAddCard();
                            }
                        }}
                    />
                    <div className="flex items-center gap-2">
                        <Button onClick={handleAddCard} size="sm">
                            Adicionar card
                        </Button>
                        <button
                            onClick={() => {
                                setIsAddingCard(false);
                                setNewCardTitle("");
                            }}
                            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAddingCard(true)}
                    className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Adicionar um card
                </button>
            )}
        </div>
    );
}
