"use client";

import { ReactNode } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { UpgradePrompt } from "./upgrade-prompt";
import { PlanFeatures } from "@/types/subscription";

interface FeatureGateProps {
    feature: keyof PlanFeatures;
    featureName: string;
    description?: string;
    children: ReactNode;
    fallback?: ReactNode;
}

export function FeatureGate({
    feature,
    featureName,
    description,
    children,
    fallback,
}: FeatureGateProps) {
    const { canUseFeature } = useSubscription();

    if (canUseFeature(feature)) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return <UpgradePrompt feature={featureName} description={description} />;
}

// Simple wrapper that just hides content for free users
interface ProOnlyProps {
    children: ReactNode;
    showBadge?: boolean;
}

export function ProOnly({ children, showBadge = false }: ProOnlyProps) {
    const { isPro } = useSubscription();

    if (isPro) {
        return <>{children}</>;
    }

    if (showBadge) {
        return (
            <div className="relative opacity-50 pointer-events-none">
                {children}
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 rounded-xl">
                    <span className="px-2 py-1 bg-[#264653] text-white text-xs rounded-full">
                        Pro
                    </span>
                </div>
            </div>
        );
    }

    return null;
}
