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
                    <h2 className={styles.title}>
                        WE EMPOWER OUR,<br />
                        AUDIENCE TO LIVE<br />
                        THEIR BEST LIVE
                    </h2>

                    <div className={styles.divider} />

                    <p className={styles.description}>
                        Sign up for our newsletter to see more of<br />
                        Black Women's Boundlessness
                    </p>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.inputWrapper}>
                            <input
                                type="email"
                                placeholder="Email Address*"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                        <Button type="submit" loading={loading} className={styles.button}>
                            SUBSCRIBE NOW
                        </Button>
                    </form>

                    <div className={styles.terms}>
                        <input type="checkbox" required id="newsletter-terms" className={styles.checkbox} />
                        <label htmlFor="newsletter-terms">
                            By clicking Subscribe Now, you agree to our <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
                        </label>
                    </div>

                    {status === 'success' && <p className={styles.success}>Thanks for subscribing!</p>}
                    {status === 'error' && <p className={styles.error}>Something went wrong. Please try again.</p>}
                </div>
            </div>
        </section>
    );
}
