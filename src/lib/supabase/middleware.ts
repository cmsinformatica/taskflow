import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function updateSession(request: NextRequest): Promise<{ response: NextResponse; user: User | null; isAdmin: boolean }> {
    // Skip Supabase if not configured (demo mode)
    if (!supabaseUrl || !supabaseAnonKey) {
        return { response: NextResponse.next({ request }), user: null, isAdmin: false };
    }

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                );
                supabaseResponse = NextResponse.next({
                    request,
                });
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                );
            },
        },
    });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protected routes
    if (
        !user &&
        !request.nextUrl.pathname.startsWith("/login") &&
        !request.nextUrl.pathname.startsWith("/register") &&
        request.nextUrl.pathname !== "/"
    ) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return { response: NextResponse.redirect(url), user: null, isAdmin: false };
    }

    // Check admin status from database
    let isAdmin = false;
    if (user) {
        // First check env var (fast path)
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail && user.email === adminEmail) {
            isAdmin = true;
        } else {
            // Check database is_admin column
            const { data: profile } = await supabase
                .from("profiles")
                .select("is_admin")
                .eq("id", user.id)
                .single();

            isAdmin = profile?.is_admin === true;
        }
    }

    return { response: supabaseResponse, user, isAdmin };
}

// Legacy function for backward compatibility
export function checkAdminEmail(email: string | undefined): boolean {
    const adminEmail = process.env.ADMIN_EMAIL;
    return !!adminEmail && email === adminEmail;
}
