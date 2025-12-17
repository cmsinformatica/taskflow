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
import { MoreHorizontal, Plus, X, AlertTriangle, Settings2 } from "lucide-react";
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
    const [isSettingWip, setIsSettingWip] = useState(false);
    const [wipLimit, setWipLimit] = useState<string>(list.wipLimit?.toString() || "");

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

    const cards = list.cards || [];
    const cardCount = cards.length;
    const isOverLimit = list.wipLimit && cardCount > list.wipLimit;
    const isAtLimit = list.wipLimit && cardCount === list.wipLimit;

    const handleAddCard = () => {
        if (!newCardTitle.trim()) return;

        // Check WIP limit
        if (list.wipLimit && cardCount >= list.wipLimit) {
            alert(`Esta lista tem um limite de ${list.wipLimit} cartões. Mova ou conclua um cartão antes de adicionar.`);
            return;
        }

        const newCard: Card = {
            id: crypto.randomUUID(),
            list_id: list.id,
            title: newCardTitle.trim(),
            position: cardCount + 1,
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

    const handleSaveWipLimit = () => {
        const limit = wipLimit ? parseInt(wipLimit) : null;
        updateList(list.id, { wipLimit: limit });
        setIsSettingWip(false);
        setShowMenu(false);
    };

    const handleDeleteList = () => {
        if (confirm("Tem certeza que deseja excluir esta lista?")) {
            deleteList(list.id);
        }
        setShowMenu(false);
    };

    const cardIds = cards.map((card) => card.id);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "w-72 flex-shrink-0 rounded-2xl p-4 max-h-[calc(100vh-160px)] flex flex-col shadow-sm transition-all duration-300",
                {
                    "opacity-50": isDragging,
                    "bg-white dark:bg-[#1e293b]": !isOverLimit,
                    "bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800": isOverLimit,
                    "bg-amber-50 dark:bg-amber-900/10 border border-amber-300 dark:border-amber-800": isAtLimit && !isOverLimit,
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
                    <div className="flex items-center gap-2">
                        <h3
                            onClick={() => setIsEditingTitle(true)}
                            className="font-semibold text-[#264653] dark:text-white px-2 py-1 hover:bg-[#F5F7F8] dark:hover:bg-[#334155] rounded-lg cursor-pointer transition-colors"
                        >
                            {list.name}
                        </h3>
                        {/* Card count with WIP indicator */}
                        <span
                            className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                isOverLimit
                                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                    : isAtLimit
                                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                        : "bg-[#F5F7F8] text-[#6B7280] dark:bg-[#334155]"
                            )}
                        >
                            {cardCount}
                            {list.wipLimit && `/${list.wipLimit}`}
                        </span>
                        {isOverLimit && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                    </div>
                )}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1.5 rounded-lg hover:bg-[#F5F7F8] dark:hover:bg-[#334155] transition-colors"
                    >
                        <MoreHorizontal className="w-5 h-5 text-[#6B7280]" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-[#1e293b] rounded-xl shadow-lg border border-[#E0E0E0] dark:border-[#334155] py-2 min-w-[180px] z-10 animate-fade-in">
                            <button
                                onClick={() => setIsSettingWip(true)}
                                className="w-full px-4 py-2 text-left text-sm text-[#2B2B2B] dark:text-white hover:bg-[#F5F7F8] dark:hover:bg-[#334155] transition-colors flex items-center gap-2"
                            >
                                <Settings2 className="w-4 h-4" />
                                Limite WIP
                            </button>
                            <hr className="my-2 border-[#E0E0E0] dark:border-[#334155]" />
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

            {/* WIP Limit Settings */}
            {isSettingWip && (
                <div className="mb-4 p-3 bg-[#F5F7F8] dark:bg-[#0f172a] rounded-xl animate-fade-in">
                    <label className="text-xs font-medium text-[#6B7280] mb-2 block">
                        Limite de cartões (WIP)
                    </label>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            value={wipLimit}
                            onChange={(e) => setWipLimit(e.target.value)}
                            placeholder="Ex: 3"
                            className="flex-1 text-sm"
                            min={0}
                        />
                        <Button
                            size="sm"
                            onClick={handleSaveWipLimit}
                            className="bg-[#2A9D8F] hover:bg-[#238b80] rounded-lg"
                        >
                            Salvar
                        </Button>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-2">
                        Deixe vazio para sem limite
                    </p>
                </div>
            )}

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
                        className="w-full p-3 rounded-xl border border-[#E0E0E0] dark:border-[#334155] bg-white dark:bg-[#0f172a] text-[#2B2B2B] dark:text-white placeholder:text-[#6B7280] focus:border-[#2A9D8F] focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/20 resize-none text-sm transition-all"
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
                            className="p-2 rounded-xl hover:bg-[#F5F7F8] dark:hover:bg-[#334155] transition-colors"
                        >
                            <X className="w-5 h-5 text-[#6B7280]" />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAddingCard(true)}
                    disabled={list.wipLimit && cardCount >= list.wipLimit ? true : false}
                    className={cn(
                        "mt-4 w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors",
                        list.wipLimit && cardCount >= list.wipLimit
                            ? "text-[#6B7280] cursor-not-allowed opacity-50"
                            : "text-[#6B7280] hover:bg-[#F5F7F8] dark:hover:bg-[#334155] hover:text-[#2A9D8F]"
                    )}
                >
                    <Plus className="w-4 h-4" />
                    Adicionar cartão
                </button>
            )}
        </div>
    );
}
