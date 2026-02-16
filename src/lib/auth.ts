import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export const authService = {
    async signIn(email: string, pass: string) {
        return signInWithEmailAndPassword(auth, email, pass);
    },
    async signUp(email: string, pass: string) {
        return createUserWithEmailAndPassword(auth, email, pass);
    },
    async signOut() {
        return firebaseSignOut(auth);
    }
};

import { useState, useEffect } from "react";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                // Fetch admin status
                try {
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                    if (userDoc.exists()) {
                        setIsAdmin(userDoc.data().isAdmin === true);
                    } else {
                        setIsAdmin(false);
                    }
                } catch (err) {
                    console.error("Error fetching admin status:", err);
                    setIsAdmin(false);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    return { user, isAdmin, loading };
}
