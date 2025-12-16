"use client";

import Link from "next/link";
import { Board } from "@/types";

interface BoardCardProps {
    board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
    return (
        <Link href={`/boards/${board.id}`}>
            <div
                className="group h-28 lg:h-32 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{
                    background: board.background,
                }}
            >
                {/* Content */}
                <div className="h-full p-4 flex flex-col justify-end bg-gradient-to-t from-black/30 to-transparent">
                    <h3 className="text-white font-semibold text-base lg:text-lg">
                        {board.name}
                    </h3>
                </div>
            </div>
        </Link>
    );
}
