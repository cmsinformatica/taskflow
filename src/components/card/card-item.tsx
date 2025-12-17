"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/types";
import { cn } from "@/lib/utils";
import {
    Calendar,
    CheckSquare,
    MessageSquare,
    Timer,
    Focus,
    Repeat,
} from "lucide-react";
import { useBoardStore } from "@/store/board-store";
import { MiniTimer } from "./pomodoro-timer";

interface CardItemProps {
    card: Card;
    listId: string;
}

export function CardItem({ card, listId }: CardItemProps) {
    const { setSelectedCard, setCardModalOpen, setFocusMode } = useBoardStore();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: card.id,
        data: {
            type: "card",
            card,
            listId,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleClick = () => {
        setSelectedCard(card);
        setCardModalOpen(true);
    };

    const handleFocusMode = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFocusMode(card.id, listId);
    };

    const hasLabels = card.labels && card.labels.length > 0;
    const hasChecklists = card.checklists && card.checklists.length > 0;
    const hasComments = card.comments && card.comments.length > 0;
    const hasDueDate = card.due_date;
    const hasRecurring = card.recurring?.type;
    const hasTimer = card.timer && (card.timer.isRunning || card.timer.totalSeconds > 0);

    // Calculate checklist progress
    const totalItems = card.checklists?.reduce(
        (acc, cl) => acc + (cl.items?.length || 0),
        0
    ) || 0;
    const completedItems = card.checklists?.reduce(
        (acc, cl) => acc + (cl.items?.filter((i) => i.is_completed).length || 0),
        0
    ) || 0;
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={handleClick}
            className={cn(
                "group bg-white dark:bg-[#1e293b] rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-[#E0E0E0] dark:border-[#334155]",
                {
                    "opacity-50 shadow-lg ring-2 ring-[#2A9D8F]": isDragging,
                }
            )}
        >
            {/* Progress Bar - visible without opening card */}
            {hasChecklists && totalItems > 0 && (
                <div className="mb-2">
                    <div className="h-1.5 bg-[#E0E0E0] dark:bg-[#334155] rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-500 rounded-full",
                                progress === 100
                                    ? "bg-[#2A9D8F]"
                                    : "bg-gradient-to-r from-[#2A9D8F]/50 to-[#2A9D8F]"
                            )}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Labels */}
            {hasLabels && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {card.labels?.slice(0, 4).map((label) => (
                        <span
                            key={label.id}
                            className="h-2 w-10 rounded-full"
                            style={{ backgroundColor: label.color }}
                        />
                    ))}
                </div>
            )}

            {/* Title */}
            <p className="text-sm font-medium text-[#2B2B2B] dark:text-white mb-2">
                {card.title}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                {hasDueDate && (
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(card.due_date!).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                        })}
                    </span>
                )}

                {hasChecklists && (
                    <span
                        className={cn("flex items-center gap-1", {
                            "text-[#2A9D8F]": progress === 100,
                        })}
                    >
                        <CheckSquare className="w-3.5 h-3.5" />
                        {completedItems}/{totalItems}
                    </span>
                )}

                {hasComments && (
                    <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {card.comments?.length}
                    </span>
                )}

                {hasRecurring && (
                    <span className="flex items-center gap-1 text-[#E9C46A]" title="Tarefa recorrente">
                        <Repeat className="w-3.5 h-3.5" />
                    </span>
                )}

                {hasTimer && (
                    <MiniTimer
                        isRunning={card.timer?.isRunning || false}
                        totalSeconds={card.timer?.totalSeconds || 0}
                    />
                )}
            </div>

            {/* Focus Mode Button - appears on hover */}
            <button
                onClick={handleFocusMode}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#2A9D8F] text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-[#238b80]"
                title="Modo Foco"
            >
                <Focus className="w-4 h-4" />
            </button>
        </div>
    );
}
