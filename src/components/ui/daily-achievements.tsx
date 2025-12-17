"use client";

import { Trophy, CheckCircle, Timer, ChevronRight, X } from "lucide-react";
import { useBoardStore } from "@/store/board-store";
import { useState } from "react";

export function DailyAchievements() {
    const { getTodayAchievements, dailyAchievements } = useBoardStore();
    const [isExpanded, setIsExpanded] = useState(false);

    const today = getTodayAchievements();
    const completedCount = today?.completedCards.length || 0;

    if (completedCount === 0) {
        return null;
    }

    return (
        <div className="mb-6">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[#2A9D8F]/10 to-[#264653]/10 dark:from-[#2A9D8F]/20 dark:to-[#264653]/20 rounded-2xl border border-[#2A9D8F]/20 hover:border-[#2A9D8F]/40 transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2A9D8F] flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-[#264653] dark:text-white">
                            Conquistas de Hoje
                        </h3>
                        <p className="text-sm text-[#6B7280]">
                            {completedCount} {completedCount === 1 ? "tarefa concluída" : "tarefas concluídas"}
                        </p>
                    </div>
                </div>
                <ChevronRight
                    className={`w-5 h-5 text-[#6B7280] transition-transform ${isExpanded ? "rotate-90" : ""
                        }`}
                />
            </button>

            {isExpanded && today && (
                <div className="mt-3 p-4 bg-white dark:bg-[#1e293b] rounded-2xl border border-[#E0E0E0] dark:border-[#334155] animate-fade-in">
                    <div className="space-y-3">
                        {today.completedCards.map((card) => (
                            <div
                                key={card.id}
                                className="flex items-center gap-3 p-3 bg-[#F5F7F8] dark:bg-[#0f172a] rounded-xl"
                            >
                                <CheckCircle className="w-5 h-5 text-[#2A9D8F] flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-[#2B2B2B] dark:text-white truncate">
                                        {card.title}
                                    </p>
                                    <p className="text-xs text-[#6B7280]">
                                        {card.boardName} •{" "}
                                        {new Date(card.completedAt).toLocaleTimeString("pt-BR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {today.totalPomodoros > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#E0E0E0] dark:border-[#334155] flex items-center gap-2 text-sm text-[#6B7280]">
                            <Timer className="w-4 h-4" />
                            <span>
                                {today.totalPomodoros}{" "}
                                {today.totalPomodoros === 1 ? "pomodoro" : "pomodoros"} concluídos
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Compact badge for sidebar
export function AchievementBadge() {
    const { getTodayAchievements } = useBoardStore();
    const today = getTodayAchievements();
    const count = today?.completedCards.length || 0;

    if (count === 0) return null;

    return (
        <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-[#2A9D8F] text-white rounded-full">
            {count}
        </span>
    );
}
