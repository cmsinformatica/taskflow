"use client";

import { useState } from "react";
import { Repeat, X, Check } from "lucide-react";
import { RecurringConfig, RecurringType } from "@/types";
import { Button } from "@/components/ui";

interface RecurringSelectorProps {
    value: RecurringConfig | undefined;
    onChange: (config: RecurringConfig | undefined) => void;
}

const RECURRING_OPTIONS: { type: RecurringType; label: string; icon: string }[] = [
    { type: "daily", label: "Diário", icon: "📅" },
    { type: "weekly", label: "Semanal", icon: "📆" },
    { type: "monthly", label: "Mensal", icon: "🗓️" },
];

const WEEKDAYS = [
    { value: 0, label: "Dom" },
    { value: 1, label: "Seg" },
    { value: 2, label: "Ter" },
    { value: 3, label: "Qua" },
    { value: 4, label: "Qui" },
    { value: 5, label: "Sex" },
    { value: 6, label: "Sáb" },
];

export function RecurringSelector({ value, onChange }: RecurringSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<RecurringType>(value?.type || null);
    const [selectedDays, setSelectedDays] = useState<number[]>(value?.daysOfWeek || [1, 2, 3, 4, 5]); // Default weekdays

    const handleSave = () => {
        if (!selectedType) {
            onChange(undefined);
        } else {
            onChange({
                type: selectedType,
                daysOfWeek: selectedType === "weekly" ? selectedDays : undefined,
                interval: 1,
            });
        }
        setIsOpen(false);
    };

    const handleRemove = () => {
        setSelectedType(null);
        onChange(undefined);
        setIsOpen(false);
    };

    const toggleDay = (day: number) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
        );
    };

    const getLabel = () => {
        if (!value?.type) return "Adicionar recorrência";
        switch (value.type) {
            case "daily":
                return "Repete diariamente";
            case "weekly":
                return `Repete semanalmente`;
            case "monthly":
                return "Repete mensalmente";
            default:
                return "Recorrente";
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${value?.type
                        ? "bg-[#E9C46A]/10 text-[#E9C46A] border border-[#E9C46A]/30"
                        : "bg-[#F5F7F8] dark:bg-[#334155] text-[#6B7280] hover:bg-[#E0E0E0] dark:hover:bg-[#475569]"
                    }`}
            >
                <Repeat className="w-4 h-4" />
                {getLabel()}
            </button>

            {isOpen && (
                <div className="absolute left-0 top-12 bg-white dark:bg-[#1e293b] rounded-xl shadow-lg border border-[#E0E0E0] dark:border-[#334155] p-4 min-w-[280px] z-20 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-[#264653] dark:text-white">
                            Repetir tarefa
                        </h4>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-lg hover:bg-[#F5F7F8] dark:hover:bg-[#334155]"
                        >
                            <X className="w-4 h-4 text-[#6B7280]" />
                        </button>
                    </div>

                    {/* Options */}
                    <div className="space-y-2 mb-4">
                        {RECURRING_OPTIONS.map((option) => (
                            <button
                                key={option.type}
                                onClick={() => setSelectedType(option.type)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${selectedType === option.type
                                        ? "bg-[#2A9D8F]/10 text-[#2A9D8F] border border-[#2A9D8F]"
                                        : "bg-[#F5F7F8] dark:bg-[#0f172a] text-[#2B2B2B] dark:text-white hover:bg-[#E0E0E0] dark:hover:bg-[#334155]"
                                    }`}
                            >
                                <span className="text-lg">{option.icon}</span>
                                <span className="flex-1">{option.label}</span>
                                {selectedType === option.type && (
                                    <Check className="w-4 h-4 text-[#2A9D8F]" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Weekly days selector */}
                    {selectedType === "weekly" && (
                        <div className="mb-4">
                            <p className="text-sm text-[#6B7280] mb-2">Repetir em:</p>
                            <div className="flex gap-1">
                                {WEEKDAYS.map((day) => (
                                    <button
                                        key={day.value}
                                        onClick={() => toggleDay(day.value)}
                                        className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${selectedDays.includes(day.value)
                                                ? "bg-[#2A9D8F] text-white"
                                                : "bg-[#F5F7F8] dark:bg-[#0f172a] text-[#6B7280] hover:bg-[#E0E0E0]"
                                            }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                        {value?.type && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRemove}
                                className="flex-1 border-[#E76F51] text-[#E76F51] hover:bg-[#E76F51]/5 rounded-xl"
                            >
                                Remover
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={handleSave}
                            className="flex-1 bg-[#2A9D8F] hover:bg-[#238b80] rounded-xl"
                        >
                            {selectedType ? "Salvar" : "Fechar"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Mini indicator for card
export function RecurringBadge({ config }: { config?: RecurringConfig }) {
    if (!config?.type) return null;

    const labels: Record<string, string> = {
        daily: "Diário",
        weekly: "Semanal",
        monthly: "Mensal",
    };

    return (
        <span
            className="flex items-center gap-1 text-xs text-[#E9C46A]"
            title={`Tarefa recorrente: ${labels[config.type]}`}
        >
            <Repeat className="w-3 h-3" />
        </span>
    );
}
