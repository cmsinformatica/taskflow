import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Security Check 1: Must be logged in
        if (!user || notAdmin(user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const adminDb = createAdminClient();

        // 1. Total Users (Approximation from profiles)
        const { count: totalUsers } = await adminDb
            .from("profiles")
            .select("*", { count: "exact", head: true });

        // 2. Active Users (This is tricky without presence, distinct updates in last 15m?)
        // We'll use recently updated profiles or sessions if possible.
        // For now, let's look at profiles updated_at in last 24h as "Active Today"
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);

        const { count: activeUsers24h } = await adminDb
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .gt("updated_at", oneDayAgo.toISOString());

        // 3. Content Stats
        const { count: totalBoards } = await adminDb.from("boards").select("*", { count: "exact", head: true });
        const { count: totalLists } = await adminDb.from("lists").select("*", { count: "exact", head: true });
        const { count: totalCards } = await adminDb.from("cards").select("*", { count: "exact", head: true });

        // 4. Paid Users
        const { count: proUsers } = await adminDb
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .in("subscription_status", ["active", "trialing"]);

        return NextResponse.json({
            users: {
                total: totalUsers || 0,
                active24h: activeUsers24h || 0,
                pro: proUsers || 0
            },
            content: {
                boards: totalBoards || 0,
                lists: totalLists || 0,
                cards: totalCards || 0
            }
        });

    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function notAdmin(email: string | undefined) {
    const adminEmail = process.env.ADMIN_EMAIL;
    return !adminEmail || email !== adminEmail;
}
