"use client";

import { useState } from "react";
import styles from "./SocialShare.module.css";
import { Share2, Twitter, Facebook, Link as LinkIcon, Check } from "lucide-react";
import { analyticsService } from "@/lib/services/analytics";

interface SocialShareProps {
    articleId: string;
    title: string;
    slug: string;
    excerpt?: string;
}

export function SocialShare({ articleId, title, slug, excerpt }: SocialShareProps) {
    const [copied, setCopied] = useState(false);
    const url = typeof window !== 'undefined'
        ? `${window.location.origin}/articles/${slug}`
        : `/articles/${slug}`;

    const handleShare = async (platform: string) => {
        analyticsService.trackShare(articleId);

        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);
        const encodedExcerpt = encodeURIComponent(excerpt || '');

        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, '_blank', 'width=600,height=400');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=400');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'width=600,height=400');
                break;
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            analyticsService.trackShare(articleId);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className={styles.shareBar}>
            <span className={styles.shareLabel}>
                <Share2 size={14} />
                Share
            </span>
            <div className={styles.shareButtons}>
                <button
                    className={`${styles.shareBtn} ${styles.twitter}`}
                    onClick={() => handleShare('twitter')}
                    aria-label="Share on Twitter"
                    title="Share on X (Twitter)"
                >
                    <Twitter size={16} />
                </button>
                <button
                    className={`${styles.shareBtn} ${styles.facebook}`}
                    onClick={() => handleShare('facebook')}
                    aria-label="Share on Facebook"
                    title="Share on Facebook"
                >
                    <Facebook size={16} />
                </button>
                <button
                    className={`${styles.shareBtn} ${styles.copyLink}`}
                    onClick={handleCopyLink}
                    aria-label="Copy link"
                    title={copied ? "Copied!" : "Copy Link"}
                >
                    {copied ? <Check size={16} /> : <LinkIcon size={16} />}
                </button>
            </div>
        </div>
    );
}
