import Link from "next/link";
import styles from "./Footer.module.css";
import { Instagram, Twitter, Facebook, Mail } from "lucide-react";

export function Footer() {
    return (
        <footer className={styles.footer} aria-labelledby="footer-brand">
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.info}>
                        <h2 id="footer-brand" className={styles.brand}>RAQUEL FORD</h2>
                        <p className={styles.description}>
                            A content-driven blog and magazine dedicated to sharing stories
                            across food, fashion, entertainment, and lifestyle.
                        </p>
                    </div>

                    <div className={styles.links}>
                        <h3 className={styles.sectionTitle}>EXPLORE</h3>
                        <Link href="/category/food">Food</Link>
                        <Link href="/category/fashion">Fashion</Link>
                        <Link href="/category/entertainment">Entertainment</Link>
                        <Link href="/category/lifestyle">Lifestyle</Link>
                    </div>

                    <div className={styles.social}>
                        <h3 className={styles.sectionTitle}>FOLLOW US</h3>
                        <div className={styles.icons} style={{ flexWrap: 'wrap' }}>
                            <a href="https://www.instagram.com/raquelfordmedia/" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram"><Instagram size={20} /></a>
                            <a href="https://x.com/raquelfordmedia" target="_blank" rel="noopener noreferrer" aria-label="Follow us on X (Twitter)"><Twitter size={20} /></a>
                            <a href="https://www.facebook.com/profile.php?id=61565446950545" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook"><Facebook size={20} /></a>
                            {/* TikTok */}
                            <a href="https://www.tiktok.com/@raquelfordmedia" target="_blank" rel="noopener noreferrer" aria-label="Follow us on TikTok">
                                <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </a>
                            {/* LinkedIn */}
                            <a href="https://www.linkedin.com/company/raquel-ford-media/" target="_blank" rel="noopener noreferrer" aria-label="Follow us on LinkedIn">
                                <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                    <rect x="2" y="9" width="4" height="12" />
                                    <circle cx="4" cy="4" r="2" />
                                </svg>
                            </a>
                            {/* YouTube */}
                            <a href="https://www.youtube.com/@raquelfordmedia" target="_blank" rel="noopener noreferrer" aria-label="Follow us on YouTube">
                                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29.07 29.07 0 0 0 1 11.75a29.07 29.07 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29.07 29.07 0 0 0 .46-5.33 29.07 29.07 0 0 0-.46-5.33z" />
                                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
                                </svg>
                            </a>
                            {/* Threads */}
                            <a href="https://www.threads.com/@raquelfordmedia" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Threads">
                                <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.783 14.536c-1.284-.15-2.298-.838-2.298-2.247 0-1.282 1.05-2.222 2.47-2.222 1.22 0 2.218.84 2.218 2.222 0 1.95-1.468 2.883-3.692 2.883-2.618 0-4.524-1.638-4.524-4.542 0-2.99 2.115-5.228 5.418-5.228 3.018 0 4.965 1.888 5.348 4.38h3.048c-.435-4.304-3.575-7.14-8.396-7.14C6.262 2.64 2.5 6.758 2.5 12.36c0 5.432 3.635 9 8.243 9 3.085 0 5.343-1.48 6.452-3.83h-3.14c-.663 1.05-1.87 1.545-3.312 1.545-2.583 0-4.352-1.89-4.352-4.502 0-3.328 2.102-5.74 5.093-5.74 1.157 0 1.782.553 1.782 1.483 0 .74-.537 1.12-1.393 1.22zm0 0" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className={styles.newsletter}>
                        <h3 className={styles.sectionTitle}>NEWSLETTER</h3>
                        <p>Subscribe to receive the latest stories and updates.</p>
                        <form className={styles.form}>
                            <input
                                type="email"
                                placeholder="Your email address"
                                className={styles.input}
                                aria-label="Email address for newsletter"
                                required
                            />
                            <button type="submit" className={styles.button} aria-label="Subscribe to newsletter">JOIN</button>
                        </form>

                        <div className={styles.supportArea}>
                            <h3 className={styles.sectionTitle}>SUPPORT US</h3>
                            <a href="mailto:momentswithraquel@gmail.com?subject=Support%20Media" className={styles.supportButton} aria-label="Donate to support our media">
                                DONATE
                            </a>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; {new Date().getFullYear()} Raquel Ford. All rights reserved.</p>
                    <div className={styles.legal}>
                        <Link href="/privacy">Privacy Policy</Link>
                        <Link href="/terms">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
