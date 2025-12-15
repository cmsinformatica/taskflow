"use client";

import Link from "next/link";
import { Board } from "@/types";
import { cn } from "@/lib/utils";

interface BoardCardProps {
    board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
    const isGradient = board.background.startsWith("linear-gradient");

    return (
        <Link href={`/boards/${board.id}`}>
            <div
                className={cn(
                    "relative group h-32 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                )}
                style={{
                    background: board.background,
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

                {/* Content */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    <h3 className="text-white font-bold text-lg drop-shadow-md">
                        {board.name}
                    </h3>
                </div>

                {/* Hover effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </div>
        </Link>
    );
}
