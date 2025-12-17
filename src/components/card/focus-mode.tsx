"use client";

import { X, CheckSquare, FileText, Timer, Play, Focus } from "lucide-react";
import { Card } from "@/types";
import { useBoardStore } from "@/store/board-store";
import { PomodoroTimer } from "./pomodoro-timer";

export function FocusMode() {
    const {
        focusedCardId,
        focusedListId,
        setFocusMode,
        lists,
        updateCard,
        startTimer,
        stopTimer,
    } = useBoardStore();

    if (!focusedCardId || !focusedListId) return null;

    const list = lists.find((l) => l.id === focusedListId);
    const card = list?.cards?.find((c) => c.id === focusedCardId);

    if (!card) return null;

    const checklists = card.checklists || [];
    const totalItems = checklists.reduce(
        (acc, cl) => acc + (cl.items?.length || 0),
        0
    );
    const completedItems = checklists.reduce(
        (acc, cl) => acc + (cl.items?.filter((i) => i.is_completed).length || 0),
        0
    );
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    const handleClose = () => {
        setFocusMode(null, null);
    };

    const handleToggleItem = (checklistId: string, itemId: string, completed: boolean) => {
        const updatedChecklists = checklists.map((cl) =>
            cl.id === checklistId
                ? {
                    ...cl,
                    items: cl.items?.map((item) =>
                        item.id === itemId ? { ...item, is_completed: completed } : item
                    ),
                }
                : cl
        );
        updateCard(focusedListId, focusedCardId, { checklists: updatedChecklists });
    };

    const handlePomodoroComplete = () => {
        const currentCount = card.timer?.pomodoroCount || 0;
        updateCard(focusedListId, focusedCardId, {
            timer: {
                ...card.timer,
                pomodoroCount: currentCount + 1,
                isRunning: false,
                totalSeconds: (card.timer?.totalSeconds || 0) + 25 * 60,
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 animate-fade-in">
            {/* Dark overlay */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Focus content */}
            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
                <div className="relative w-full max-w-2xl bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden animate-scale-in">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-[#E0E0E0] dark:border-[#334155]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#2A9D8F]/10 flex items-center justify-center">
                                <Focus className="w-5 h-5 text-[#2A9D8F]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-[#264653] dark:text-white">
                                    Modo Foco
                                </h2>
                                <p className="text-sm text-[#6B7280]">
                                    Concentre-se nesta tarefa
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-xl hover:bg-[#F5F7F8] dark:hover:bg-[#334155] transition-colors"
                        >
                            <X className="w-5 h-5 text-[#6B7280]" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
                        {/* Card Title */}
                        <h1 className="text-2xl font-bold text-[#264653] dark:text-white mb-6">
                            {card.title}
                        </h1>

                        {/* Progress Bar */}
                        {totalItems > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-[#6B7280]">Progresso</span>
                                    <span className="text-sm font-medium text-[#2A9D8F]">
                                        {completedItems}/{totalItems} ({Math.round(progress)}%)
                                    </span>
                                </div>
                                <div className="h-3 bg-[#E0E0E0] dark:bg-[#334155] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#2A9D8F] to-[#264653] transition-all duration-500 rounded-full"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Checklists */}
                            <div>
                                {checklists.length > 0 ? (
                                    <div className="space-y-4">
                                        {checklists.map((checklist) => (
                                            <div key={checklist.id}>
                                                <h3 className="flex items-center gap-2 font-medium text-[#264653] dark:text-white mb-3">
                                                    <CheckSquare className="w-4 h-4 text-[#2A9D8F]" />
                                                    {checklist.title}
                                                </h3>
                                                <div className="space-y-2">
                                                    {checklist.items?.map((item) => (
                                                        <label
                                                            key={item.id}
                                                            className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F7F8] dark:bg-[#0f172a] hover:bg-[#E0E0E0] dark:hover:bg-[#334155] transition-colors cursor-pointer"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={item.is_completed}
                                                                onChange={(e) =>
                                                                    handleToggleItem(
                                                                        checklist.id,
                                                                        item.id,
                                                                        e.target.checked
                                                                    )
                                                                }
                                                                className="w-5 h-5 mt-0.5 rounded border-[#E0E0E0] text-[#2A9D8F] focus:ring-[#2A9D8F]"
                                                            />
                                                            <span
                                                                className={`flex-1 ${item.is_completed
                                                                        ? "line-through text-[#6B7280]"
                                                                        : "text-[#2B2B2B] dark:text-white"
                                                                    }`}
                                                            >
                                                                {item.title}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-[#6B7280]">
                                        <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>Nenhum checklist nesta tarefa</p>
                                    </div>
                                )}

                                {/* Description */}
                                {card.description && (
                                    <div className="mt-6">
                                        <h3 className="flex items-center gap-2 font-medium text-[#264653] dark:text-white mb-3">
                                            <FileText className="w-4 h-4 text-[#2A9D8F]" />
                                            Notas
                                        </h3>
                                        <div className="p-4 rounded-xl bg-[#F5F7F8] dark:bg-[#0f172a] text-[#2B2B2B] dark:text-white whitespace-pre-wrap">
                                            {card.description}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pomodoro Timer */}
                            <div>
                                <PomodoroTimer
                                    isRunning={card.timer?.isRunning || false}
                                    totalSeconds={card.timer?.totalSeconds || 0}
                                    pomodoroCount={card.timer?.pomodoroCount || 0}
                                    onStart={() => startTimer(focusedListId, focusedCardId)}
                                    onStop={() => stopTimer(focusedListId, focusedCardId)}
                                    onComplete={handlePomodoroComplete}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
