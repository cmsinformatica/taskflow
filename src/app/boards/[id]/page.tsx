"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBoardStore } from "@/store/board-store";
import { BoardView } from "@/components/board";
import { Board, List } from "@/types";
import { createClient } from "@/lib/supabase/client";

// Demo data for initial board (when not authenticated)
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
    const router = useRouter();
    const boardId = params.id as string;
    const { currentBoard, setCurrentBoard, setLists, lists } = useBoardStore();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const supabase = createClient();

    // Update page title when board changes
    useEffect(() => {
        if (currentBoard?.name) {
            // Sanitize board name to prevent XSS
            const safeTitle = currentBoard.name.replace(/[<>]/g, "");
            document.title = `${safeTitle} | Boardzen`;
        } else {
            document.title = "Boardzen";
        }
    }, [currentBoard]);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsAuthenticated(!!user);

            if (user) {
                // User is logged in - load from database with authorization check
                const { getLists } = await import("@/lib/supabase/database");

                // Fetch board - RLS will only return if user owns it
                const { data: boardData, error: boardError } = await supabase
                    .from("boards")
                    .select("*")
                    .eq("id", boardId)
                    .single();

                // SECURITY: If board not found or not authorized, redirect
                if (boardError || !boardData) {
                    console.error("Board not found or access denied:", boardError);
                    setIsAuthorized(false);
                    router.push("/dashboard");
                    return;
                }

                setIsAuthorized(true);
                setCurrentBoard({
                    id: boardData.id,
                    workspace_id: boardData.workspace_id || "",
                    name: boardData.name,
                    background: boardData.background,
                    is_public: boardData.is_public,
                    created_by: boardData.created_by,
                    created_at: boardData.created_at,
                    updated_at: boardData.updated_at,
                });

                const dbLists = await getLists(boardId);
                if (dbLists.length > 0) {
                    setLists(dbLists);
                } else {
                    setLists([]);
                }
            } else {
                // Demo mode - use localStorage
                const savedBoards = localStorage.getItem("taskflow-boards");
                if (savedBoards) {
                    try {
                        const boards: Board[] = JSON.parse(savedBoards);
                        const board = boards.find((b) => b.id === boardId);
                        if (board) {
                            setCurrentBoard(board);
                        }
                    } catch (e) {
                        console.error("Error parsing boards:", e);
                    }
                }

                const savedLists = localStorage.getItem(`taskflow-lists-${boardId}`);
                if (savedLists) {
                    try {
                        setLists(JSON.parse(savedLists));
                    } catch (e) {
                        console.error("Error parsing lists:", e);
                        setLists(DEMO_LISTS);
                    }
                } else {
                    setLists(DEMO_LISTS);
                }
                setIsAuthorized(true); // Demo mode always authorized
            }
        };

        loadData();
    }, [boardId, setCurrentBoard, setLists, supabase, router]);

    // Save lists to localStorage when they change (demo mode only)
    useEffect(() => {
        if (isAuthenticated === false && lists.length > 0 && boardId) {
            const dataToSave = JSON.stringify(lists);
            localStorage.setItem(`taskflow-lists-${boardId}`, dataToSave);
        }
    }, [lists, boardId, isAuthenticated]);

    // Show loading while checking authorization
    if (isAuthorized === null) {
        return (
            <div className="min-h-screen bg-[#F5F7F8] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#264653]"></div>
            </div>
        );
    }

    // Don't render if not authorized (should have redirected, but safety check)
    if (!isAuthorized) {
        return null;
    }

    return <BoardView />;
}

