import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json(
            { error: "Missing stripe-signature header" },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 400 }
        );
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            const subscriptionId = session.subscription as string;
            const customerId = session.customer as string;

            if (userId) {
                const supabase = createAdminClient();
                await supabase
                    .from("profiles")
                    .update({
                        subscription_status: "active", // Or based on session logic
                        stripe_subscription_id: subscriptionId,
                        stripe_customer_id: customerId,
                    })
                    .eq("id", userId);

                console.log(`✅ Updated subscription for user ${userId}`);
            }
            break;
        }

        case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const userId = subscription.metadata?.userId; // Ensure metadata is passed to subscription object in checkout creation

            // Fallback: finding user if metadata is missing (depends on implementation)
            // Ideally we store stripe_customer_id in profile upon checkout, so we can search by that if needed.

            if (userId) {
                const supabase = createAdminClient();
                await supabase
                    .from("profiles")
                    .update({
                        subscription_status: subscription.status,
                    })
                    .eq("id", userId);
                console.log(`📝 Updated subscription status to ${subscription.status} for user ${userId}`);
            } else {
                // Try finding by customer ID
                const customerId = subscription.customer as string;
                const supabase = createAdminClient();
                await supabase
                    .from("profiles")
                    .update({
                        subscription_status: subscription.status,
                    })
                    .eq("stripe_customer_id", customerId);
                console.log(`📝 Updated subscription status (via customer_id) to ${subscription.status}`);
            }
            break;
        }

        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const userId = subscription.metadata?.userId;
            const customerId = subscription.customer as string;

            const supabase = createAdminClient();

            // Try updating by userId or customerId
            if (userId) {
                await supabase.from("profiles").update({ subscription_status: 'canceled' }).eq("id", userId);
            } else {
                await supabase.from("profiles").update({ subscription_status: 'canceled' }).eq("stripe_customer_id", customerId);
            }

            console.log(`❌ Subscription canceled for customer ${customerId}`);
            break;
        }

        case "invoice.payment_succeeded": {
            // Optional: Extend trial, unlock features, etc.
            const invoice = event.data.object as Stripe.Invoice;
            console.log(`💰 Payment succeeded for invoice ${invoice.id}`);
            break;
        }

        case "invoice.payment_failed": {
            // Optional: Mark as past_due
            const invoice = event.data.object as Stripe.Invoice;
            console.log(`⚠️ Payment failed for invoice ${invoice.id}`);
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
