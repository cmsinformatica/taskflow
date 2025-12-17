"use client";

import { useSubscriptionStore } from "@/store/subscription-store";
import { PlanFeatures } from "@/types/subscription";

export function useSubscription() {
    const {
        subscription,
        getCurrentPlan,
        getFeatures,
        isTrialing,
        getTrialDaysLeft,
        isPro,
        canUseFeature,
        initTrial,
    } = useSubscriptionStore();

    return {
        subscription,
        plan: getCurrentPlan(),
        features: getFeatures(),
        isTrialing: isTrialing(),
        trialDaysLeft: getTrialDaysLeft(),
        isPro: isPro(),
        isFree: !isPro(),
        canUseFeature,
        initTrial,
    };
}

// Quick check for specific features
export function useFeature(feature: keyof PlanFeatures) {
    const { canUseFeature } = useSubscriptionStore();
    return canUseFeature(feature);
}
