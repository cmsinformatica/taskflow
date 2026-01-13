import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
    const { response, user, isAdmin } = await updateSession(request);

    // Admin Protection - Block route before page loads
    // Now checks is_admin column from database OR ADMIN_EMAIL env var
    if (request.nextUrl.pathname.startsWith("/admin")) {
        if (!user || !isAdmin) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
