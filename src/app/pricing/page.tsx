"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Check,
    Crown,
    Sparkles,
    ArrowLeft,
    Zap,
    Focus,
    Timer,
    AlertCircle,
    FileText,
    Repeat,
    Trophy,
    Download,
    LayoutGrid,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import { PRO_PRICE } from "@/types/subscription";

const FREE_FEATURES = [
    { icon: LayoutGrid, text: "5 quadros" },
    { icon: Users, text: "3 membros por quadro" },
    { icon: Check, text: "Checklists" },
    { icon: Check, text: "Etiquetas" },
    { icon: Check, text: "Data de entrega" },
    { icon: Check, text: "Comentários" },
    { icon: Check, text: "Tema escuro" },
];

const PRO_FEATURES = [
    { icon: LayoutGrid, text: "Quadros ilimitados", highlight: true },
    { icon: Users, text: "Membros ilimitados", highlight: true },
    { icon: Focus, text: "Modo Foco (Zen)", highlight: true },
    { icon: Timer, text: "Pomodoro integrado", highlight: true },
    { icon: AlertCircle, text: "Limites WIP", highlight: true },
    { icon: FileText, text: "Editor Rico", highlight: true },
    { icon: Repeat, text: "Tarefas Recorrentes", highlight: true },
    { icon: Trophy, text: "Conquistas do Dia", highlight: true },
    { icon: Download, text: "Exportar dados" },
    { icon: Zap, text: "Suporte por email" },
];

export default function PricingPage() {
    const { isPro, isTrialing, trialDaysLeft } = useSubscription();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async () => {
        setIsLoading(true);

        try {
            // Get user from Supabase
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Redirect to login if not authenticated
                window.location.href = "/login?redirectTo=/pricing";
                return;
            }

            // DEBUG: Confirmação visual do email
            alert(`Iniciando checkout para: ${user.email}`);

            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user.id,
                    email: user.email,
                }),
            });

            const data = await response.json();

            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                alert("Erro ao criar sessão de pagamento. Tente novamente.");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Erro ao processar. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F7F8] via-white to-[#F5F7F8] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a]">
            {/* Header */}
            <header className="px-6 py-4">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#264653] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao dashboard
                </Link>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2A9D8F]/10 rounded-full text-[#2A9D8F] text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        Simples e transparente
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-[#264653] dark:text-white mb-4">
                        Escolha seu plano
                    </h1>

                    <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
                        Comece grátis com 15 dias de trial Pro. Cancele quando quiser.
                    </p>
                </div>

                {/* Trial Status */}
                {isTrialing && (
                    <div className="mb-8 p-4 bg-gradient-to-r from-[#2A9D8F]/10 to-[#264653]/10 rounded-2xl flex items-center justify-center gap-3 text-[#264653] dark:text-white">
                        <Crown className="w-5 h-5 text-[#2A9D8F]" />
                        <span>
                            Você está no trial Pro!{" "}
                            <strong>
                                {trialDaysLeft} {trialDaysLeft === 1 ? "dia" : "dias"} restantes
                            </strong>
                        </span>
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Free Plan */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-8 border border-[#E0E0E0] dark:border-[#334155] shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-[#264653] dark:text-white mb-2">
                                Free
                            </h2>
                            <p className="text-[#6B7280]">
                                Perfeito para começar a organizar suas tarefas
                            </p>
                        </div>

                        <div className="mb-8">
                            <span className="text-4xl font-bold text-[#264653] dark:text-white">
                                R$0
                            </span>
                            <span className="text-[#6B7280]">/mês</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {FREE_FEATURES.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#F5F7F8] dark:bg-[#334155] flex items-center justify-center">
                                        <feature.icon className="w-3 h-3 text-[#6B7280]" />
                                    </div>
                                    <span className="text-[#2B2B2B] dark:text-white">
                                        {feature.text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <Button
                            variant="outline"
                            className="w-full rounded-xl border-[#E0E0E0] text-[#6B7280]"
                            disabled
                        >
                            Plano atual
                        </Button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-gradient-to-br from-[#264653] to-[#1e3a47] rounded-3xl p-8 text-white relative overflow-hidden">
                        {/* Popular badge */}
                        <div className="absolute top-4 right-4 px-3 py-1 bg-[#E9C46A] text-[#264653] text-xs font-bold rounded-full">
                            POPULAR
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Crown className="w-6 h-6 text-[#E9C46A]" />
                                <h2 className="text-2xl font-bold">Pro</h2>
                            </div>
                            <p className="text-white/70">
                                Todas as ferramentas para produtividade zen
                            </p>
                        </div>

                        <div className="mb-8">
                            <span className="text-4xl font-bold">
                                R${PRO_PRICE.toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-white/70">/mês</span>
                            <p className="text-sm text-[#2A9D8F] mt-1">
                                ✨ 15 dias grátis para testar
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {PRO_FEATURES.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div
                                        className={`w-5 h-5 rounded-full flex items-center justify-center ${feature.highlight
                                            ? "bg-[#2A9D8F]"
                                            : "bg-white/20"
                                            }`}
                                    >
                                        <feature.icon
                                            className={`w-3 h-3 ${feature.highlight ? "text-white" : "text-white/70"
                                                }`}
                                        />
                                    </div>
                                    <span
                                        className={
                                            feature.highlight ? "font-medium" : "text-white/80"
                                        }
                                    >
                                        {feature.text}
                                    </span>
                                    {feature.highlight && (
                                        <span className="text-xs bg-[#2A9D8F]/30 px-2 py-0.5 rounded-full">
                                            Exclusivo
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>

                        <Button
                            onClick={handleSubscribe}
                            disabled={isLoading || isPro}
                            className="w-full bg-[#2A9D8F] hover:bg-[#238b80] rounded-xl text-white font-medium"
                        >
                            {isPro && !isTrialing
                                ? "Você já é Pro!"
                                : isTrialing
                                    ? "Assinar agora"
                                    : "Começar trial grátis"}
                        </Button>
                    </div>
                </div>

                {/* FAQ */}
                <div className="mt-16 text-center">
                    <h3 className="text-xl font-semibold text-[#264653] dark:text-white mb-4">
                        Perguntas frequentes
                    </h3>
                    <div className="max-w-2xl mx-auto space-y-4 text-left">
                        <div className="p-4 bg-white dark:bg-[#1e293b] rounded-xl border border-[#E0E0E0] dark:border-[#334155]">
                            <p className="font-medium text-[#264653] dark:text-white mb-1">
                                Posso cancelar a qualquer momento?
                            </p>
                            <p className="text-sm text-[#6B7280]">
                                Sim! Você pode cancelar quando quiser sem taxa adicional.
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-[#1e293b] rounded-xl border border-[#E0E0E0] dark:border-[#334155]">
                            <p className="font-medium text-[#264653] dark:text-white mb-1">
                                O que acontece quando o trial acaba?
                            </p>
                            <p className="text-sm text-[#6B7280]">
                                Seu plano muda para Free automaticamente. Você não perde seus dados.
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-[#1e293b] rounded-xl border border-[#E0E0E0] dark:border-[#334155]">
                            <p className="font-medium text-[#264653] dark:text-white mb-1">
                                Quais formas de pagamento são aceitas?
                            </p>
                            <p className="text-sm text-[#6B7280]">
                                Cartão de crédito, débito e Pix via Stripe.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
