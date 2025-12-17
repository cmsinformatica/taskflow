"use client";

import { Lock, Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";

interface UpgradePromptProps {
    feature: string;
    description?: string;
    compact?: boolean;
}

export function UpgradePrompt({
    feature,
    description,
    compact = false,
}: UpgradePromptProps) {
    if (compact) {
        return (
            <Link
                href="/pricing"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#2A9D8F]/10 to-[#264653]/10 hover:from-[#2A9D8F]/20 hover:to-[#264653]/20 transition-all group"
            >
                <Crown className="w-4 h-4 text-[#2A9D8F]" />
                <span className="text-sm text-[#264653] dark:text-white">
                    <strong>Pro:</strong> {feature}
                </span>
                <Sparkles className="w-3 h-3 text-[#E9C46A] opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#F5F7F8] to-white dark:from-[#0f172a] dark:to-[#1e293b] rounded-2xl border border-[#E0E0E0] dark:border-[#334155] text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2A9D8F] to-[#264653] flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-xl font-semibold text-[#264653] dark:text-white mb-2">
                {feature}
            </h3>

            <p className="text-[#6B7280] mb-6 max-w-sm">
                {description ||
                    "Esta funcionalidade está disponível no plano Pro. Faça upgrade para desbloquear."}
            </p>

            <Link href="/pricing">
                <Button className="bg-gradient-to-r from-[#2A9D8F] to-[#264653] hover:from-[#238b80] hover:to-[#1e3a47] rounded-xl px-6">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade para Pro - R$9,90/mês
                </Button>
            </Link>

            <p className="text-xs text-[#6B7280] mt-4">
                ✨ Trial de 15 dias grátis para novos usuários
            </p>
        </div>
    );
}
