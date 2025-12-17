import Stripe from "stripe";

// Lazy initialization to avoid build-time errors
let _stripe: Stripe | null = null;

export function getStripeServer(): Stripe {
    if (!_stripe) {
        const secretKey = process.env.STRIPE_SECRET_KEY;
        if (!secretKey) {
            throw new Error("STRIPE_SECRET_KEY is not configured");
        }
        _stripe = new Stripe(secretKey, {
            typescript: true,
        });
    }
    return _stripe;
}

// Export for convenience (will throw if used without key)
export const stripe = {
    get customers() {
        return getStripeServer().customers;
    },
    get checkout() {
        return getStripeServer().checkout;
    },
    get webhooks() {
        return getStripeServer().webhooks;
    },
};
