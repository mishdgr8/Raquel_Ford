"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./SocialShare.module.css";
import { Share2, Twitter, Facebook, Link as LinkIcon, Check, Linkedin, Send, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analyticsService } from "@/lib/services/analytics";
import { clsx } from "clsx";

interface SocialShareProps {
    articleId: string;
    title: string;
    slug: string;
    excerpt?: string;
}

export function SocialShare({ articleId, title, slug, excerpt }: SocialShareProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const url = typeof window !== 'undefined'
        ? `${window.location.origin}/articles/${slug}`
        : `https://raquelford.com/articles/${slug}`;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleShare = (platform: string) => {
        analyticsService.trackShare(articleId);
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);

        let shareUrl = '';
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                break;
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
                break;
            case 'pinterest':
                shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=500');
            setIsOpen(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            analyticsService.trackShare(articleId);
            setTimeout(() => {
                setCopied(false);
                setIsOpen(false);
            }, 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const platforms = [
        { id: 'twitter', label: 'X (Twitter)', icon: Twitter, color: '#000000' },
        { id: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
        { id: 'whatsapp', label: 'WhatsApp', icon: Send, color: '#25D366' },
        { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
        { id: 'pinterest', label: 'Pinterest', icon: ExternalLink, color: '#BD081C' },
    ];

    return (
        <div className={styles.container} ref={menuRef}>
            <button
                className={clsx(styles.mainShareBtn, isOpen && styles.active)}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Share article"
            >
                <Share2 size={18} />
                <span>SHARE STORY</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, x: "-50%", scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                        exit={{ opacity: 0, y: 10, x: "-50%", scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={styles.menu}
                    >
                        <div className={styles.menuHeader}>
                            <span>SHARE THIS STORY</span>
                        </div>
                        <div className={styles.grid}>
                            {platforms.map((p) => (
                                <button
                                    key={p.id}
                                    className={styles.platformBtn}
                                    onClick={() => handleShare(p.id)}
                                >
                                    <div className={styles.iconWrapper} style={{ backgroundColor: p.color }}>
                                        <p.icon size={18} color="white" />
                                    </div>
                                    <span className={styles.platformLabel}>{p.label}</span>
                                </button>
                            ))}
                            <button
                                className={styles.platformBtn}
                                onClick={handleCopyLink}
                            >
                                <div className={clsx(styles.iconWrapper, copied && styles.copiedIcon)}>
                                    {copied ? <Check size={18} color="white" /> : <LinkIcon size={18} />}
                                </div>
                                <span className={styles.platformLabel}>
                                    {copied ? 'COPIED!' : 'COPY LINK'}
                                </span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
