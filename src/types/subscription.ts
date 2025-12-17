export type PlanType = "free" | "pro";
export type SubscriptionStatus = "trialing" | "active" | "canceled" | "expired";

export interface Subscription {
    userId: string;
    plan: PlanType;
    status: SubscriptionStatus;
    trialEndsAt: string | null; // ISO date
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    currentPeriodEnd: string | null;
    createdAt: string;
}

export interface PlanFeatures {
    maxBoards: number;
    maxMembersPerBoard: number;
    focusMode: boolean;
    pomodoroTimer: boolean;
    wipLimits: boolean;
    richEditor: boolean;
    recurringTasks: boolean;
    dailyAchievements: boolean;
    exportData: boolean;
}

export const FREE_FEATURES: PlanFeatures = {
    maxBoards: 5,
    maxMembersPerBoard: 3,
    focusMode: false,
    pomodoroTimer: false,
    wipLimits: false,
    richEditor: false,
    recurringTasks: false,
    dailyAchievements: false,
    exportData: false,
};

export const PRO_FEATURES: PlanFeatures = {
    maxBoards: Infinity,
    maxMembersPerBoard: Infinity,
    focusMode: true,
    pomodoroTimer: true,
    wipLimits: true,
    richEditor: true,
    recurringTasks: true,
    dailyAchievements: true,
    exportData: true,
};

export const TRIAL_DAYS = 15;
export const PRO_PRICE = 9.90; // R$
