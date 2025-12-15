import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        // Return a mock client for demo mode
        return {
            auth: {
                getUser: async () => ({ data: { user: null }, error: null }),
                signInWithPassword: async () => ({ error: { message: "Configure Supabase para autenticação" } }),
                signUp: async () => ({ error: { message: "Configure Supabase para autenticação" } }),
                signOut: async () => ({}),
                signInWithOAuth: async () => ({}),
            },
        } as ReturnType<typeof createBrowserClient>;
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
