"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";

interface PomodoroTimerProps {
    isRunning: boolean;
    totalSeconds: number;
    pomodoroCount: number;
    onStart: () => void;
    onStop: () => void;
    onComplete: () => void;
}

const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

export function PomodoroTimer({
    isRunning,
    totalSeconds,
    pomodoroCount,
    onStart,
    onStop,
    onComplete,
}: PomodoroTimerProps) {
    const [currentSeconds, setCurrentSeconds] = useState(0);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning) {
            interval = setInterval(() => {
                setCurrentSeconds((prev) => {
                    const next = prev + 1;
                    if (next >= POMODORO_DURATION) {
                        onStop();
                        onComplete();
                        setShowNotification(true);
                        // Request notification permission and show
                        if ("Notification" in window && Notification.permission === "granted") {
                            new Notification("🍅 Pomodoro concluído!", {
                                body: "Hora de fazer uma pausa!",
                                icon: "/icons/icon.svg",
                            });
                        }
                        return 0;
                    }
                    return next;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isRunning, onStop, onComplete]);

    useEffect(() => {
        // Request notification permission on mount
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const formatTotalTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const progress = (currentSeconds / POMODORO_DURATION) * 100;
    const remaining = POMODORO_DURATION - currentSeconds;

    const handleReset = () => {
        if (isRunning) onStop();
        setCurrentSeconds(0);
    };

    return (
        <div className="bg-[#F5F7F8] dark:bg-[#1e293b] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-[#2A9D8F]" />
                    <span className="text-sm font-medium text-[#264653] dark:text-white">
                        Pomodoro
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {[...Array(pomodoroCount)].map((_, i) => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-full bg-[#E76F51]"
                            title="Pomodoro concluído"
                        />
                    ))}
                </div>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-4">
                <div className="text-3xl font-mono font-bold text-[#264653] dark:text-white">
                    {isRunning ? formatTime(remaining) : "25:00"}
                </div>
                {totalSeconds > 0 && (
                    <div className="text-xs text-[#6B7280] mt-1">
                        Total: {formatTotalTime(totalSeconds)}
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-[#E0E0E0] dark:bg-[#334155] rounded-full mb-4 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-[#2A9D8F] to-[#264653] transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
                <button
                    onClick={handleReset}
                    className="p-2 rounded-lg hover:bg-[#E0E0E0] dark:hover:bg-[#334155] transition-colors"
                    title="Reiniciar"
                >
                    <RotateCcw className="w-5 h-5 text-[#6B7280]" />
                </button>
                <button
                    onClick={isRunning ? onStop : onStart}
                    className={`p-4 rounded-full transition-all ${isRunning
                            ? "bg-[#E76F51] hover:bg-[#d65a3a]"
                            : "bg-[#2A9D8F] hover:bg-[#238b80]"
                        } text-white shadow-md hover:shadow-lg`}
                >
                    {isRunning ? (
                        <Pause className="w-6 h-6" />
                    ) : (
                        <Play className="w-6 h-6 ml-0.5" />
                    )}
                </button>
                <div className="w-9" /> {/* Spacer for balance */}
            </div>

            {/* Notification */}
            {showNotification && (
                <div className="mt-4 p-3 bg-[#2A9D8F]/10 rounded-lg text-center animate-fade-in">
                    <p className="text-sm text-[#2A9D8F] font-medium">
                        🍅 Pomodoro concluído! Faça uma pausa.
                    </p>
                    <button
                        onClick={() => setShowNotification(false)}
                        className="text-xs text-[#6B7280] mt-1 hover:underline"
                    >
                        Fechar
                    </button>
                </div>
            )}
        </div>
    );
}

// Mini timer for card item
export function MiniTimer({
    isRunning,
    totalSeconds,
}: {
    isRunning: boolean;
    totalSeconds: number;
}) {
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    if (!isRunning && totalSeconds === 0) return null;

    return (
        <div
            className={`flex items-center gap-1 text-xs ${isRunning ? "text-[#2A9D8F]" : "text-[#6B7280]"
                }`}
        >
            <Timer className="w-3 h-3" />
            <span>{formatTime(totalSeconds)}</span>
            {isRunning && (
                <span className="w-2 h-2 rounded-full bg-[#2A9D8F] animate-pulse" />
            )}
        </div>
    );
}
