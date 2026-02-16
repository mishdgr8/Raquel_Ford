"use client";

import { useState } from "react";
import { authService } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import styles from "../login/LoginPage.module.css";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminSignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        setLoading(true);
        setError("");
        try {
            const userCredential = await authService.signUp(email, password);
            const user = userCredential.user;

            // Automatically grant admin rights to new signups for now to unblock
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                isAdmin: true,
                createdAt: serverTimestamp()
            });

            setSuccess(true);
            setTimeout(() => {
                router.push("/admin/login");
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Admin Sign Up</h1>
                    <p className={styles.subtitle}>Create an account to manage the blog</p>
                </div>

                {success ? (
                    <div className={styles.success}>
                        Account created successfully! Redirecting to login...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}
                        <div className={styles.fields}>
                            <Input
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="admin@raquelford.com"
                            />
                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        <Button type="submit" className={styles.button} disabled={loading}>
                            {loading ? "Creating account..." : "Sign Up"}
                        </Button>
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <Link href="/admin/login" className={styles.link}>
                                Already have an account? Sign In
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
