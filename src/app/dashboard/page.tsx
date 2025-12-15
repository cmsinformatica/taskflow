"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BoardCard } from "@/components/board";
import { Button, Input, Modal } from "@/components/ui";
import {
    Plus,
    Search,
    LayoutGrid,
    Star,
    Clock,
    LogOut,
    User,
    Settings,
} from "lucide-react";
import { Board } from "@/types";

const BOARD_BACKGROUNDS = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "#0079bf",
    "#d29034",
    "#519839",
    "#b04632",
    "#89609e",
    "#cd5a91",
];

export default function DashboardPage() {
    const router = useRouter();
    const supabase = createClient();

    const [boards, setBoards] = useState<Board[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newBoardName, setNewBoardName] = useState("");
    const [selectedBackground, setSelectedBackground] = useState(
        BOARD_BACKGROUNDS[0]
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data.user) {
                setUser({
                    email: data.user.email,
                    full_name: data.user.user_metadata?.full_name,
                });
            }
        };
        getUser();

        // Load boards from localStorage for demo
        const savedBoards = localStorage.getItem("taskflow-boards");
        if (savedBoards) {
            setBoards(JSON.parse(savedBoards));
        }
    }, [supabase.auth]);

    const handleCreateBoard = () => {
        if (!newBoardName.trim()) return;

        const newBoard: Board = {
            id: crypto.randomUUID(),
            workspace_id: "",
            name: newBoardName.trim(),
            background: selectedBackground,
            is_public: false,
            created_by: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const updatedBoards = [...boards, newBoard];
        setBoards(updatedBoards);
        localStorage.setItem("taskflow-boards", JSON.stringify(updatedBoards));

        setNewBoardName("");
        setSelectedBackground(BOARD_BACKGROUNDS[0]);
        setIsCreateModalOpen(false);

        router.push(`/boards/${newBoard.id}`);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    const filteredBoards = boards.filter((board) =>
        board.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <LayoutGrid className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                        TaskFlow
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    <a
                        href="#"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                    >
                        <LayoutGrid className="w-5 h-5" />
                        Quadros
                    </a>
                    <a
                        href="#"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <Star className="w-5 h-5" />
                        Favoritos
                    </a>
                    <a
                        href="#"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <Clock className="w-5 h-5" />
                        Recentes
                    </a>
                    <a
                        href="#"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <Settings className="w-5 h-5" />
                        Configurações
                    </a>
                </nav>

                {/* User */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-medium">
                            {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user?.full_name || "Usuário"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user?.email || ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Meus Quadros
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Organize seus projetos e tarefas
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar quadros..."
                                className="pl-10 w-64"
                            />
                        </div>
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Quadro
                        </Button>
                    </div>
                </div>

                {/* Boards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* Create New Board Card */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                    >
                        <Plus className="w-8 h-8" />
                        <span className="font-medium">Criar novo quadro</span>
                    </button>

                    {/* Board Cards */}
                    {filteredBoards.map((board) => (
                        <BoardCard key={board.id} board={board} />
                    ))}
                </div>

                {filteredBoards.length === 0 && boards.length > 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            Nenhum quadro encontrado para sua busca.
                        </p>
                    </div>
                )}
            </main>

            {/* Create Board Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Criar novo quadro"
                size="md"
            >
                <div className="space-y-6">
                    {/* Preview */}
                    <div
                        className="h-32 rounded-xl flex items-end p-4"
                        style={{ background: selectedBackground }}
                    >
                        <h3 className="text-white font-bold text-lg drop-shadow-md">
                            {newBoardName || "Nome do quadro"}
                        </h3>
                    </div>

                    {/* Board Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Título do quadro
                        </label>
                        <Input
                            value={newBoardName}
                            onChange={(e) => setNewBoardName(e.target.value)}
                            placeholder="Ex: Meu Projeto Incrível"
                            onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
                        />
                    </div>

                    {/* Background Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Plano de fundo
                        </label>
                        <div className="grid grid-cols-6 gap-2">
                            {BOARD_BACKGROUNDS.map((bg) => (
                                <button
                                    key={bg}
                                    onClick={() => setSelectedBackground(bg)}
                                    className={`h-10 rounded-lg transition-all ${selectedBackground === bg
                                            ? "ring-2 ring-blue-500 ring-offset-2"
                                            : "hover:opacity-80"
                                        }`}
                                    style={{ background: bg }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateBoard} disabled={!newBoardName.trim()}>
                            Criar quadro
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
