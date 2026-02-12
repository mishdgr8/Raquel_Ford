import Link from "next/link";
import styles from "./Footer.module.css";
import { Instagram, Twitter, Facebook, Mail } from "lucide-react";

export function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.info}>
                        <h2 className={styles.brand}>RAQUEL FORD</h2>
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
                        <div className={styles.icons}>
                            <a href="#"><Instagram size={20} /></a>
                            <a href="#"><Twitter size={20} /></a>
                            <a href="#"><Facebook size={20} /></a>
                        </div>
                    </div>

                    <div className={styles.newsletter}>
                        <h3 className={styles.sectionTitle}>NEWSLETTER</h3>
                        <p>Subscribe to receive the latest stories and updates.</p>
                        <form className={styles.form}>
                            <input type="email" placeholder="Your email address" className={styles.input} />
                            <button type="submit" className={styles.button}>JOIN</button>
                        </form>
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
