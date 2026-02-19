"use client";

import styles from "./about.module.css";
import { Instagram, Twitter, Facebook, Mail, Linkedin, Youtube } from "lucide-react";

// Custom Icon Components for those missing in standard lucide set or specific preference
const TikTokIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

const ThreadsIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12.783 14.536c-1.284-.15-2.298-.838-2.298-2.247 0-1.282 1.05-2.222 2.47-2.222 1.22 0 2.218.84 2.218 2.222 0 1.95-1.468 2.883-3.692 2.883-2.618 0-4.524-1.638-4.524-4.542 0-2.99 2.115-5.228 5.418-5.228 3.018 0 4.965 1.888 5.348 4.38h3.048c-.435-4.304-3.575-7.14-8.396-7.14C6.262 2.64 2.5 6.758 2.5 12.36c0 5.432 3.635 9 8.243 9 3.085 0 5.343-1.48 6.452-3.83h-3.14c-.663 1.05-1.87 1.545-3.312 1.545-2.583 0-4.352-1.89-4.352-4.502 0-3.328 2.102-5.74 5.093-5.74 1.157 0 1.782.553 1.782 1.483 0 .74-.537 1.12-1.393 1.22zm0 0" />
    </svg>
);

export default function AboutPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Welcome to Raquel Ford!!!</h1>

            <div className={styles.content}>
                <p>
                    A digital magazine made for the moment. Raquel Ford Media covers pop culture, fashion, lifestyle and everything in between: smart, stylish, and always one step ahead.
                </p>
                <p>
                    From red carpet recaps to industry deep dives, trend reports to cultural commentary, we keep our finger on the pulse so you don’t have to. Expect bold stories, brilliant visuals and a voice that’s fresh, fearless and impossible to ignore.
                </p>
                <div className={styles.cta}>
                    Read the blog. Watch the stories. Join the conversation.
                </div>
            </div>

            <div className={styles.socialParams}>
                <a href="mailto:momentswithraquel@gmail.com" className={styles.socialLink}>
                    <Mail size={20} /> Email
                </a>
                <a href="https://www.instagram.com/raquelfordmedia/" target="_blank" rel="noreferrer" className={styles.socialLink}>
                    <Instagram size={20} /> Instagram
                </a>
                <a href="https://x.com/raquelfordmedia" target="_blank" rel="noreferrer" className={styles.socialLink}>
                    <Twitter size={20} /> X (Twitter)
                </a>
                <a href="https://www.facebook.com/profile.php?id=61565446950545" target="_blank" rel="noreferrer" className={styles.socialLink}>
                    <Facebook size={20} /> Facebook
                </a>
                <a href="https://www.tiktok.com/@raquelfordmedia" target="_blank" rel="noreferrer" className={styles.socialLink}>
                    <TikTokIcon size={20} /> TikTok
                </a>
                <a href="https://www.linkedin.com/company/raquel-ford-media/" target="_blank" rel="noreferrer" className={styles.socialLink}>
                    <Linkedin size={20} /> LinkedIn
                </a>
                <a href="https://www.youtube.com/@raquelfordmedia" target="_blank" rel="noreferrer" className={styles.socialLink}>
                    <Youtube size={20} /> YouTube
                </a>
                <a href="https://www.threads.com/@raquelfordmedia" target="_blank" rel="noreferrer" className={styles.socialLink}>
                    <ThreadsIcon size={20} /> Threads
                </a>
            </div>
        </div>
    );
}
