import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";

export async function POST(request: NextRequest) {
    try {
        const { userId, email } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Get or create customer
        let customerId: string;

        const customers = await stripe.customers.list({
            email: email,
            limit: 1,
        });

        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
        } else {
            const customer = await stripe.customers.create({
                email: email,
                metadata: {
                    userId: userId,
                },
            });
            customerId = customer.id;
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: process.env.STRIPE_PRO_PRICE_ID!,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?canceled=true`,
            subscription_data: {
                metadata: {
                    userId: userId,
                },
            },
            metadata: {
                userId: userId,
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error("Stripe checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
