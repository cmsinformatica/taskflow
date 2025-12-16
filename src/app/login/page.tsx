"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Mail, Lock, ArrowRight } from "lucide-react";
import { Button, Input } from "@/components/ui";

const isSupabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!isSupabaseConfigured) {
            const savedUser = localStorage.getItem("taskflow-demo-user");
            if (savedUser) {
                const user = JSON.parse(savedUser);
                if (user.email === email) {
                    router.push("/dashboard");
                    return;
                }
            }
            const demoUser = {
                id: crypto.randomUUID(),
                email,
                full_name: email.split("@")[0],
                created_at: new Date().toISOString(),
            };
            localStorage.setItem("taskflow-demo-user", JSON.stringify(demoUser));
            router.push("/dashboard");
            return;
        }

        try {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError("Email ou senha incorretos. Tente novamente.");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("Algo não saiu como esperado. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F7F8] flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#264653] flex items-center justify-center">
                            <LayoutGrid className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-semibold text-[#264653]">Boardzen</span>
                    </Link>
                    <p className="text-[#6B7280]">Bem-vindo de volta</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E0E0E0]">
                    <h1 className="text-xl font-semibold text-[#264653] mb-6">Entrar</h1>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-[#E76F51]/10 text-[#E76F51] text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[#2B2B2B] mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="pl-12 border-[#E0E0E0] rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#2B2B2B] mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-12 border-[#E0E0E0] rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#264653] hover:bg-[#1d3640] rounded-xl py-3"
                        >
                            {isLoading ? "Entrando..." : "Entrar"}
                            {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </form>
                </div>

                <p className="text-center mt-6 text-[#6B7280]">
                    Não tem uma conta?{" "}
                    <Link href="/register" className="text-[#2A9D8F] font-medium hover:underline">
                        Criar conta
                    </Link>
                </p>
            </div>
        </div>
    );
}
