"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Mail, Lock, User, ArrowRight, Crown } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useSubscriptionStore } from "@/store/subscription-store";

const isSupabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RegisterPage() {
    const router = useRouter();
    const { initTrial } = useSubscriptionStore();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            setIsLoading(false);
            return;
        }

        if (!isSupabaseConfigured) {
            const demoUser = {
                id: crypto.randomUUID(),
                email,
                full_name: name,
                created_at: new Date().toISOString(),
            };
            localStorage.setItem("taskflow-demo-user", JSON.stringify(demoUser));
            // Initialize 15-day Pro trial
            initTrial(demoUser.id);
            router.push("/dashboard");
            return;
        }

        try {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    },
                },
            });

            if (error) {
                setError("Algo não saiu como esperado. Tente novamente.");
            } else if (data.user && !data.session) {
                setError("Conta criada! Por favor, verifique seu email para confirmar o cadastro.");
                // Opcional: Impedir novas tentativas ou mudar visual
            } else {
                // Initialize 15-day Pro trial for new user
                initTrial(email);
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
                    <p className="text-[#6B7280]">Crie sua conta e comece a organizar</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E0E0E0]">
                    <h1 className="text-xl font-semibold text-[#264653] mb-6">Criar conta</h1>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-[#E76F51]/10 text-[#E76F51] text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[#2B2B2B] mb-2">
                                Nome
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Seu nome"
                                    className="pl-12 border-[#E0E0E0] rounded-xl"
                                    required
                                />
                            </div>
                        </div>

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

                        <div>
                            <label className="block text-sm font-medium text-[#2B2B2B] mb-2">
                                Confirmar senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-12 border-[#E0E0E0] rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#2A9D8F] hover:bg-[#238b80] rounded-xl py-3"
                        >
                            {isLoading ? "Criando conta..." : "Criar conta"}
                            {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </form>
                </div>

                <p className="text-center mt-6 text-[#6B7280]">
                    Já tem uma conta?{" "}
                    <Link href="/login" className="text-[#2A9D8F] font-medium hover:underline">
                        Entrar
                    </Link>
                </p>
            </div>
        </div>
    );
}
