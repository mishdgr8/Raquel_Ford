"use client";

import { useState } from "react";
import styles from "./NewsletterSignup.module.css";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { newsletterService } from "@/lib/services/newsletter";

interface NewsletterSignupProps {
    config: {
        title?: string;
        description?: string;
    };
}

export function NewsletterSignup({ config }: NewsletterSignupProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');
        try {
            await newsletterService.subscribe(email);
            setStatus('success');
            setEmail("");
        } catch (err) {
            console.error(err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <h2 className={styles.title}>{config.title || "JOINT THE NEWSLETTER"}</h2>
                    <p className={styles.description}>
                        {config.description || "Stay ahead of the curve with our weekly curated stories."}
                    </p>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                        />
                        <Button type="submit" loading={loading} className={styles.button}>
                            SUBSCRIBE
                        </Button>
                    </form>

                    {status === 'success' && <p className={styles.success}>Thanks for subscribing!</p>}
                    {status === 'error' && <p className={styles.error}>Something went wrong. Please try again.</p>}
                </div>
            </div>
        </section>
    );
}
