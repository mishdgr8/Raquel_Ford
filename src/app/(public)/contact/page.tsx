"use client";

import styles from "./contact.module.css";
import { Mail } from "lucide-react";

export default function ContactPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Contact Us</h1>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>General Inquiries</h2>
                <div className={styles.content}>
                    <p>
                        Have a question, feedback, or just want to say hello? We'd love to hear from you.
                        Raquel Ford Media is always open to connecting with our readers and community.
                    </p>
                    <a href="mailto:momentswithraquel@gmail.com" className={styles.ctaButton}>
                        Email Us
                    </a>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Collaborations & Promotions</h2>
                <div className={styles.content}>
                    <p>
                        Interested in partnering with <span className={styles.highlight}>Raquel Ford Media</span>?
                        We offer a variety of collaboration opportunities for brands and businesses looking to reach a stylish,
                        culturally engaged audience.
                    </p>
                    <p>
                        Whether it's <strong>sponsored content, brand features, advertising, or social media promotions</strong>,
                        we can tailor a package that fits your goals. Let's create something brilliant together.
                    </p>
                    <p>
                        For media kits and partnership rates, please reach out directly via email with the subject line
                        "Collaboration Inquiry".
                    </p>
                    <a href="mailto:momentswithraquel@gmail.com?subject=Collaboration%20Inquiry" className={styles.ctaButton}>
                        Partner With Us
                    </a>
                </div>
            </div>
        </div>
    );
}
