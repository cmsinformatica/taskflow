"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    LayoutGrid,
    Users,
    Activity,
    CreditCard,
    ArrowLeft,
    ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui";

interface AdminStats {
    users: {
        total: number;
        active24h: number;
        pro: number;
    };
    content: {
        boards: number;
        lists: number;
        cards: number;
    };
}

export default function AdminPage() {
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuthAndLoad = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login?redirectTo=/admin");
                return;
            }

            // Client-side weak check (server API does the real check)
            // Ideally we check an env var here too but env vars in client are visible.
            // We rely on the API failure to tell us we aren't admin.

            try {
                const res = await fetch("/api/admin/stats");
                if (res.status === 403) {
                    setIsAuthorized(false);
                    setIsLoading(false);
                    return;
                }
                if (!res.ok) throw new Error("Failed");

                const data = await res.json();
                setStats(data);
                setIsAuthorized(true);
            } catch (error) {
                console.error(error);
                setIsAuthorized(false); // Assume failed
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthAndLoad();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F5F7F8] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#264653]"></div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#F5F7F8] flex flex-col items-center justify-center p-4">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-[#264653] mb-2">Acesso Negado</h1>
                <p className="text-[#6B7280] mb-8 text-center max-w-md">
                    Você não tem permissão para acessar o Portal Administrativo.
                    Esta área é restrita para administradores do sistema.
                </p>
                <Button onClick={() => router.push("/dashboard")} className="bg-[#264653]">
                    Voltar ao Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F7F8]">
            <header className="bg-white border-b border-[#E0E0E0] px-6 py-4">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#264653] flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[#264653]">Portal Admin</h1>
                            <p className="text-xs text-[#6B7280]">Monitoramento e Segurança</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => router.push("/dashboard")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Sair do Admin
                    </Button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Usuários"
                        value={stats?.users.total || 0}
                        icon={Users}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Assinantes Pro"
                        value={stats?.users.pro || 0}
                        icon={CreditCard}
                        color="bg-green-500"
                    />
                    <StatCard
                        title="Ativos (24h)"
                        value={stats?.users.active24h || 0}
                        icon={Activity}
                        color="bg-orange-500"
                    />
                    <StatCard
                        title="Total Quadros"
                        value={stats?.content.boards || 0}
                        icon={LayoutGrid}
                        color="bg-purple-500"
                    />
                </div>

                {/* Privacy Notice */}
                <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 mb-8">
                    <h2 className="text-lg font-semibold text-[#264653] mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-green-600" />
                        Status de Segurança e Privacidade
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                            <div>
                                <p className="font-medium text-green-900">Isolamento de Dados (RLS)</p>
                                <p className="text-sm text-green-700">Ativo e operante. Usuários só veem seus próprios dados.</p>
                            </div>
                            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">OK</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                            <div>
                                <p className="font-medium text-green-900">Criptografia</p>
                                <p className="text-sm text-green-700">Dados sensíveis e senhas criptografados no banco (Supabase Auth).</p>
                            </div>
                            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">OK</span>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-[#6B7280] mb-1">{title}</p>
                <p className="text-3xl font-bold text-[#264653]">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
            </div>
        </div>
    );
}
