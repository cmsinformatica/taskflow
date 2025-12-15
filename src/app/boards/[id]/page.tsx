"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useBoardStore } from "@/store/board-store";
import { BoardView } from "@/components/board";
import { Board, List } from "@/types";

// Demo data for initial board
const DEMO_LISTS: List[] = [
    {
        id: "list-1",
        board_id: "",
        name: "A Fazer",
        position: 1,
        is_archived: false,
        created_at: new Date().toISOString(),
        cards: [
            {
                id: "card-1",
                list_id: "list-1",
                title: "Implementar autenticação",
                description: "Configurar login com email e OAuth",
                position: 1,
                is_archived: false,
                created_by: "",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                labels: [{ id: "l1", board_id: "", name: "Backend", color: "#61bd4f" }],
            },
            {
                id: "card-2",
                list_id: "list-1",
                title: "Design do dashboard",
                position: 2,
                is_archived: false,
                created_by: "",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                labels: [{ id: "l2", board_id: "", name: "Design", color: "#f2d600" }],
            },
        ],
    },
    {
        id: "list-2",
        board_id: "",
        name: "Em Progresso",
        position: 2,
        is_archived: false,
        created_at: new Date().toISOString(),
        cards: [
            {
                id: "card-3",
                list_id: "list-2",
                title: "Componentes de UI",
                description: "Criar botões, inputs e modais",
                position: 1,
                is_archived: false,
                created_by: "",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                labels: [{ id: "l3", board_id: "", name: "Frontend", color: "#0079bf" }],
                due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ],
    },
    {
        id: "list-3",
        board_id: "",
        name: "Concluído",
        position: 3,
        is_archived: false,
        created_at: new Date().toISOString(),
        cards: [
            {
                id: "card-4",
                list_id: "list-3",
                title: "Setup do projeto",
                description: "Configurar Next.js com TypeScript e Tailwind",
                position: 1,
                is_archived: false,
                created_by: "",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ],
    },
];

export default function BoardPage() {
    const params = useParams();
    const boardId = params.id as string;
    const { currentBoard, setCurrentBoard, setLists, lists } = useBoardStore();

    // Update page title when board changes
    useEffect(() => {
        if (currentBoard?.name) {
            document.title = `${currentBoard.name} | TaskFlow`;
        } else {
            document.title = "TaskFlow";
        }
    }, [currentBoard]);

    useEffect(() => {
        // Load board from localStorage
        const savedBoards = localStorage.getItem("taskflow-boards");
        if (savedBoards) {
            const boards: Board[] = JSON.parse(savedBoards);
            const board = boards.find((b) => b.id === boardId);
            if (board) {
                setCurrentBoard(board);
            }
        }

        // Load lists from localStorage or use demo data
        const savedLists = localStorage.getItem(`taskflow-lists-${boardId}`);
        if (savedLists) {
            setLists(JSON.parse(savedLists));
        } else {
            setLists(DEMO_LISTS);
        }
    }, [boardId, setCurrentBoard, setLists]);

    // Save lists to localStorage when they change
    useEffect(() => {
        if (lists.length > 0) {
            localStorage.setItem(`taskflow-lists-${boardId}`, JSON.stringify(lists));
        }
    }, [lists, boardId]);

    return <BoardView />;
}
