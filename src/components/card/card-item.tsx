"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/types";
import { cn } from "@/lib/utils";
import {
    Calendar,
    CheckSquare,
    MessageSquare,
    Paperclip,
    User,
} from "lucide-react";
import { useBoardStore } from "@/store/board-store";

interface CardItemProps {
    card: Card;
    listId: string;
}

export function CardItem({ card, listId }: CardItemProps) {
    const { setSelectedCard, setCardModalOpen } = useBoardStore();

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

    const hasLabels = card.labels && card.labels.length > 0;
    const hasMembers = card.members && card.members.length > 0;
    const hasChecklists = card.checklists && card.checklists.length > 0;
    const hasComments = card.comments && card.comments.length > 0;
    const hasDueDate = card.due_date;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={handleClick}
            className={cn(
                "group bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 dark:border-gray-700",
                {
                    "opacity-50 shadow-lg ring-2 ring-blue-500": isDragging,
                }
            )}
        >
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
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                {card.title}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
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
                    <span className="flex items-center gap-1">
                        <CheckSquare className="w-3.5 h-3.5" />
                        {card.checklists?.reduce(
                            (acc, cl) =>
                                acc + (cl.items?.filter((i) => i.is_completed).length || 0),
                            0
                        )}
                        /
                        {card.checklists?.reduce(
                            (acc, cl) => acc + (cl.items?.length || 0),
                            0
                        )}
                    </span>
                )}

                {hasComments && (
                    <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {card.comments?.length}
                    </span>
                )}
            </div>

            {/* Members */}
            {hasMembers && (
                <div className="flex -space-x-2 mt-2">
                    {card.members?.slice(0, 3).map((member) => (
                        <div
                            key={member.id}
                            className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-medium ring-2 ring-white dark:ring-gray-800"
                        >
                            {member.full_name?.[0] || member.email[0].toUpperCase()}
                        </div>
                    ))}
                    {card.members && card.members.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium ring-2 ring-white dark:ring-gray-800">
                            +{card.members.length - 3}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
