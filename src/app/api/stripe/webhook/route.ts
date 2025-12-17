import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
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

            console.log(`✅ Checkout completed for user ${userId}`);
            console.log(`   Subscription ID: ${subscriptionId}`);

            // In a full implementation, you would update your database here
            // For now, the client-side store handles the subscription state
            break;
        }

        case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const userId = subscription.metadata?.userId;

            console.log(`📝 Subscription updated for user ${userId}`);
            console.log(`   Status: ${subscription.status}`);
            break;
        }

        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const userId = subscription.metadata?.userId;

            console.log(`❌ Subscription canceled for user ${userId}`);
            break;
        }

        case "invoice.payment_succeeded": {
            const invoice = event.data.object as Stripe.Invoice;
            console.log(`💰 Payment succeeded for invoice ${invoice.id}`);
            break;
        }

        case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            console.log(`⚠️ Payment failed for invoice ${invoice.id}`);
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
