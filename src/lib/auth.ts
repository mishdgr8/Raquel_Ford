import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export const authService = {
    async signIn(email: string, pass: string) {
        return supabase.auth.signInWithPassword({
            email,
            password: pass,
        });
    },
    async signUp(email: string, pass: string) {
        return supabase.auth.signUp({
            email,
            password: pass,
        });
    },
    async signOut() {
        return supabase.auth.signOut();
    }
};

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                setIsAdmin(session.user.app_metadata?.is_admin === true || session.user.user_metadata?.is_admin === true);
            }
            setLoading(false);
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setIsAdmin(currentUser?.app_metadata?.is_admin === true || currentUser?.user_metadata?.is_admin === true);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { user, isAdmin, loading };
}
