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
    const [showMenu, setShowMenu] = useState(false);

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
        if (confirm("Tem certeza que deseja excluir esta lista?")) {
            deleteList(list.id);
        }
        setShowMenu(false);
    };

    const cards = list.cards || [];
    const cardIds = cards.map((card) => card.id);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "w-72 flex-shrink-0 bg-white rounded-2xl p-4 max-h-[calc(100vh-160px)] flex flex-col shadow-sm",
                {
                    "opacity-50": isDragging,
                }
            )}
        >
            {/* Header */}
            <div
                {...attributes}
                {...listeners}
                className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing"
            >
                {isEditingTitle ? (
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleSaveTitle}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                        className="font-semibold border-[#E0E0E0] rounded-xl"
                        autoFocus
                    />
                ) : (
                    <h3
                        onClick={() => setIsEditingTitle(true)}
                        className="font-semibold text-[#264653] px-2 py-1 hover:bg-[#F5F7F8] rounded-lg cursor-pointer transition-colors"
                    >
                        {list.name}
                    </h3>
                )}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1.5 rounded-lg hover:bg-[#F5F7F8] transition-colors"
                    >
                        <MoreHorizontal className="w-5 h-5 text-[#6B7280]" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-[#E0E0E0] py-2 min-w-[150px] z-10 animate-fade-in">
                            <button
                                onClick={handleDeleteList}
                                className="w-full px-4 py-2 text-left text-sm text-[#E76F51] hover:bg-[#E76F51]/5 transition-colors"
                            >
                                Excluir lista
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Cards */}
            <div
                ref={setDroppableRef}
                className="flex-1 overflow-y-auto space-y-3 min-h-[60px] scrollbar-thin"
            >
                <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                    {cards.map((card) => (
                        <CardItem key={card.id} card={card} listId={list.id} />
                    ))}
                </SortableContext>
            </div>

            {/* Add Card */}
            {isAddingCard ? (
                <div className="mt-4 space-y-3">
                    <textarea
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        placeholder="O que você precisa fazer?"
                        className="w-full p-3 rounded-xl border border-[#E0E0E0] bg-white text-[#2B2B2B] placeholder:text-[#6B7280] focus:border-[#2A9D8F] focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/20 resize-none text-sm transition-all"
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
                        <Button
                            onClick={handleAddCard}
                            size="sm"
                            className="bg-[#2A9D8F] hover:bg-[#238b80] rounded-xl"
                        >
                            Adicionar
                        </Button>
                        <button
                            onClick={() => {
                                setIsAddingCard(false);
                                setNewCardTitle("");
                            }}
                            className="p-2 rounded-xl hover:bg-[#F5F7F8] transition-colors"
                        >
                            <X className="w-5 h-5 text-[#6B7280]" />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAddingCard(true)}
                    className="mt-4 w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[#6B7280] hover:bg-[#F5F7F8] hover:text-[#2A9D8F] transition-colors text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Adicionar cartão
                </button>
            )}
        </div>
    );
}
