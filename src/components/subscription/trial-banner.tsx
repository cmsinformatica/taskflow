"use client";

import { X, Crown, Clock } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useSubscription } from "@/hooks/use-subscription";

export function TrialBanner() {
    const { isTrialing, trialDaysLeft } = useSubscription();
    const [dismissed, setDismissed] = useState(false);

    if (!isTrialing || dismissed) return null;

    const urgency = trialDaysLeft <= 3;

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-center gap-4 ${urgency
                    ? "bg-gradient-to-r from-[#E76F51] to-[#F4A261] text-white"
                    : "bg-gradient-to-r from-[#2A9D8F] to-[#264653] text-white"
                }`}
        >
            <div className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                <span className="font-medium">
                    {urgency ? "⚠️ " : "🎉 "}
                    Seu trial Pro expira em{" "}
                    <strong>
                        {trialDaysLeft} {trialDaysLeft === 1 ? "dia" : "dias"}
                    </strong>
                </span>
            </div>

            <Link
                href="/pricing"
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${urgency
                        ? "bg-white text-[#E76F51] hover:bg-white/90"
                        : "bg-white/20 hover:bg-white/30"
                    }`}
            >
                Assinar agora - R$9,90/mês
            </Link>

            <button
                onClick={() => setDismissed(true)}
                className="absolute right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// Compact version for sidebar
export function TrialBadge() {
    const { isTrialing, trialDaysLeft } = useSubscription();

    if (!isTrialing) return null;

    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#2A9D8F]/10 rounded-xl text-sm">
            <Clock className="w-4 h-4 text-[#2A9D8F]" />
            <span className="text-[#2A9D8F]">
                Trial: {trialDaysLeft} {trialDaysLeft === 1 ? "dia" : "dias"}
            </span>
        </div>
    );
}
