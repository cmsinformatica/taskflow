"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    Settings,
    Menu,
    X,
} from "lucide-react";
import { Board } from "@/types";

const BOARD_BACKGROUNDS = [
    "#264653",
    "#2A9D8F",
    "#E9C46A",
    "#F4A261",
    "#E76F51",
    "#8ECAE6",
    "#219EBC",
    "#023047",
    "#FFB703",
    "#FB8500",
    "#606C38",
    "#283618",
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data.user) {
                setUser({
                    email: data.user.email,
                    full_name: data.user.user_metadata?.full_name,
                });
            } else {
                // Check demo user
                const demoUser = localStorage.getItem("taskflow-demo-user");
                if (demoUser) {
                    setUser(JSON.parse(demoUser));
                }
            }
        };
        getUser();

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
        localStorage.removeItem("taskflow-demo-user");
        router.push("/login");
        router.refresh();
    };

    const filteredBoards = boards.filter((board) =>
        board.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="min-h-screen bg-[#F5F7F8]">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E0E0E0] flex items-center justify-between px-4 z-40">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 rounded-xl hover:bg-[#F5F7F8] transition-colors"
                >
                    <Menu className="w-6 h-6 text-[#264653]" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#264653] flex items-center justify-center">
                        <LayoutGrid className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-[#264653]">Boardzen</span>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="p-2 rounded-xl bg-[#264653] text-white hover:bg-[#1d3640] transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </header>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/30 z-40 transition-opacity"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 bottom-0 w-64 bg-white border-r border-[#E0E0E0] p-5 flex flex-col z-50 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
            >
                <button
                    onClick={closeSidebar}
                    className="lg:hidden absolute top-4 right-4 p-2 rounded-xl hover:bg-[#F5F7F8]"
                >
                    <X className="w-5 h-5 text-[#6B7280]" />
                </button>

                {/* Logo */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-[#264653] flex items-center justify-center">
                        <LayoutGrid className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-semibold text-[#264653]">Boardzen</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    <a
                        href="#"
                        onClick={closeSidebar}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#264653]/5 text-[#264653] font-medium"
                    >
                        <LayoutGrid className="w-5 h-5" />
                        Meus Quadros
                    </a>
                    <a
                        href="#"
                        onClick={closeSidebar}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#6B7280] hover:bg-[#F5F7F8] transition-colors"
                    >
                        <Star className="w-5 h-5" />
                        Favoritos
                    </a>
                    <a
                        href="#"
                        onClick={closeSidebar}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#6B7280] hover:bg-[#F5F7F8] transition-colors"
                    >
                        <Clock className="w-5 h-5" />
                        Recentes
                    </a>
                    <Link
                        href="/preferences"
                        onClick={closeSidebar}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#6B7280] hover:bg-[#F5F7F8] transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                        Preferências
                    </Link>
                </nav>

                {/* User */}
                <div className="pt-5 border-t border-[#E0E0E0]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[#2A9D8F] flex items-center justify-center text-white font-medium shrink-0">
                            {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#2B2B2B] truncate">
                                {user?.full_name || "Usuário"}
                            </p>
                            <p className="text-xs text-[#6B7280] truncate">
                                {user?.email || ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-[#E76F51] hover:bg-[#E76F51]/5 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pt-20 lg:pt-0 lg:ml-64 p-5 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#264653]">
                            Visão Geral
                        </h1>
                        <p className="text-[#6B7280] mt-1">
                            Seus quadros e projetos
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar quadros..."
                                className="pl-10 w-full sm:w-56 bg-white border-[#E0E0E0] rounded-xl"
                            />
                        </div>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="hidden sm:flex bg-[#264653] hover:bg-[#1d3640] rounded-xl"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Quadro
                        </Button>
                    </div>
                </div>

                {/* Empty State */}
                {boards.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                        <div className="w-20 h-20 rounded-2xl bg-[#2A9D8F]/10 flex items-center justify-center mb-6">
                            <LayoutGrid className="w-10 h-10 text-[#2A9D8F]" />
                        </div>
                        <h2 className="text-2xl font-semibold text-[#264653] mb-3">
                            Tudo começa com um quadro
                        </h2>
                        <p className="text-[#6B7280] max-w-md mb-8 leading-relaxed">
                            Crie seu primeiro quadro e organize suas ideias com tranquilidade.
                            Sem pressa, no seu ritmo.
                        </p>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-[#2A9D8F] hover:bg-[#238b80] rounded-xl px-6 py-3"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Criar meu primeiro quadro
                        </Button>
                    </div>
                )}

                {/* Boards Grid */}
                {boards.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="h-28 lg:h-32 rounded-2xl border-2 border-dashed border-[#E0E0E0] flex flex-col items-center justify-center gap-2 text-[#6B7280] hover:border-[#2A9D8F] hover:text-[#2A9D8F] transition-all"
                        >
                            <Plus className="w-6 h-6" />
                            <span className="font-medium">Novo quadro</span>
                        </button>

                        {filteredBoards.map((board) => (
                            <BoardCard key={board.id} board={board} />
                        ))}
                    </div>
                )}

                {filteredBoards.length === 0 && boards.length > 0 && (
                    <div className="text-center py-12">
                        <p className="text-[#6B7280]">
                            Nenhum quadro encontrado para "{searchQuery}"
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
                    <div
                        className="h-28 rounded-2xl flex items-end p-4 transition-all"
                        style={{ background: selectedBackground }}
                    >
                        <h3 className="text-white font-semibold text-lg drop-shadow-md">
                            {newBoardName || "Nome do quadro"}
                        </h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#2B2B2B] mb-2">
                            Nome do quadro
                        </label>
                        <Input
                            value={newBoardName}
                            onChange={(e) => setNewBoardName(e.target.value)}
                            placeholder="Ex: Projeto Website"
                            className="border-[#E0E0E0] rounded-xl"
                            onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#2B2B2B] mb-3">
                            Cor do quadro
                        </label>
                        <div className="grid grid-cols-6 gap-2">
                            {BOARD_BACKGROUNDS.map((bg) => (
                                <button
                                    key={bg}
                                    onClick={() => setSelectedBackground(bg)}
                                    className={`h-10 rounded-xl transition-all ${selectedBackground === bg
                                        ? "ring-2 ring-[#264653] ring-offset-2"
                                        : "hover:scale-105"
                                        }`}
                                    style={{ background: bg }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="rounded-xl border-[#E0E0E0]"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateBoard}
                            disabled={!newBoardName.trim()}
                            className="bg-[#264653] hover:bg-[#1d3640] rounded-xl"
                        >
                            Criar quadro
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
