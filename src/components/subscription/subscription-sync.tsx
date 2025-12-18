"use client";

import { useEffect } from "react";
import { useSubscriptionStore } from "@/store/subscription-store";
import { createClient } from "@/lib/supabase/client";
import { Subscription } from "@/types/subscription";

export function SubscriptionSync() {
    const { setSubscription } = useSubscriptionStore();
    const supabase = createClient();

    useEffect(() => {
        const syncSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Fetch subscription from API or via server action bridge
                // Since we can't import server actions directly in client component easily without invalidating cache sometimes,
                // we'll use a pragmatic approach: call an API or use the library if adapted.
                // For simplicity, we'll try to use the database function if it was an action, 
                // but since getSubscription is server-side, we should probably fetch from an API route.

                // Let's call the API (we need to create a simple verify endpoint or assume we can invoke server action)
                // Actually, let's keep it simple: we created getSubscription in @/lib/supabase/database
                // We can't run that on client.

                // Better approach: verify on layout server component and pass to client?
                // Or create a simple API route /api/me/subscription
            }
        };

        // Re-implementing correctly: We will fetching user profile directly via Supabase Client
        // The profiles table has RLS allowing users to read their own profile.

        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("profiles")
                .select("subscription_status, stripe_customer_id, stripe_subscription_id, trial_end")
                .eq("id", user.id)
                .single();

            if (data && !error) {
                const status = data.subscription_status || "free";
                const isPro = status === "active" || status === "trialing";

                const subscription: Subscription = {
                    userId: user.id,
                    plan: isPro ? "pro" : "free",
                    status: status as any,
                    trialEndsAt: data.trial_end,
                    stripeCustomerId: data.stripe_customer_id,
                    stripeSubscriptionId: data.stripe_subscription_id,
                    currentPeriodEnd: null,
                    createdAt: new Date().toISOString(),
                };

                console.log("🔄 Synced subscription:", subscription);
                setSubscription(subscription);
            }
        };

        fetchProfile();
    }, [setSubscription, supabase]);

    return null;
}
