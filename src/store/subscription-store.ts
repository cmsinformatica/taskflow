import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
    Subscription,
    PlanType,
    SubscriptionStatus,
    PlanFeatures,
    FREE_FEATURES,
    PRO_FEATURES,
    TRIAL_DAYS,
} from "@/types/subscription";

interface SubscriptionStore {
    subscription: Subscription | null;
    setSubscription: (sub: Subscription | null) => void;
    initTrial: (userId: string) => void;
    getCurrentPlan: () => PlanType;
    getFeatures: () => PlanFeatures;
    isTrialing: () => boolean;
    getTrialDaysLeft: () => number;
    isPro: () => boolean;
    canUseFeature: (feature: keyof PlanFeatures) => boolean;
}

export const useSubscriptionStore = create<SubscriptionStore>()(
    persist(
        (set, get) => ({
            subscription: null,

            setSubscription: (sub) => set({ subscription: sub }),

            initTrial: (userId: string) => {
                const trialEndsAt = new Date();
                trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

                const newSub: Subscription = {
                    userId,
                    plan: "pro",
                    status: "trialing",
                    trialEndsAt: trialEndsAt.toISOString(),
                    stripeCustomerId: null,
                    stripeSubscriptionId: null,
                    currentPeriodEnd: null,
                    createdAt: new Date().toISOString(),
                };

                set({ subscription: newSub });
            },

            getCurrentPlan: () => {
                const { subscription } = get();
                if (!subscription) return "free";

                // Check if trial is active
                if (subscription.status === "trialing" && subscription.trialEndsAt) {
                    const trialEnd = new Date(subscription.trialEndsAt);
                    if (trialEnd > new Date()) {
                        return "pro";
                    }
                }

                // Check if active subscription
                if (
                    subscription.status === "active" &&
                    subscription.stripeSubscriptionId
                ) {
                    return "pro";
                }

                return "free";
            },

            getFeatures: () => {
                const plan = get().getCurrentPlan();
                return plan === "pro" ? PRO_FEATURES : FREE_FEATURES;
            },

            isTrialing: () => {
                const { subscription } = get();
                if (!subscription) return false;

                if (subscription.status === "trialing" && subscription.trialEndsAt) {
                    const trialEnd = new Date(subscription.trialEndsAt);
                    return trialEnd > new Date();
                }

                return false;
            },

            getTrialDaysLeft: () => {
                const { subscription } = get();
                if (!subscription?.trialEndsAt) return 0;

                const trialEnd = new Date(subscription.trialEndsAt);
                const now = new Date();
                const diff = trialEnd.getTime() - now.getTime();
                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

                return Math.max(0, days);
            },

            isPro: () => {
                return get().getCurrentPlan() === "pro";
            },

            canUseFeature: (feature: keyof PlanFeatures) => {
                const features = get().getFeatures();
                const value = features[feature];

                if (typeof value === "boolean") return value;
                if (typeof value === "number") return value > 0;
                return false;
            },
        }),
        {
            name: "boardzen-subscription",
        }
    )
);
