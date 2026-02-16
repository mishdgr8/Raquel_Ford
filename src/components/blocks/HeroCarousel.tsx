"use client";

import { useState, useEffect } from "react";
import styles from "./HeroCarousel.module.css";
import { articleService } from "@/lib/services/articles";
import { Article } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface HeroCarouselProps {
    config: {
        manualPostIds?: string[];
        count?: number;
        autoplay?: boolean;
    };
}

import { categoryService } from "@/lib/services/categories";
import { Category } from "@/lib/types";

export function HeroCarousel({ config }: HeroCarouselProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        categoryService.getCategories().then((data) => {
            // Filter for specific main categories
            // We compare lowercased names to handle potential inconsistencies
            const targetNames = ['fashion', 'food', 'entertainment', 'events', 'health & wellness', 'health.wellness', 'living'];

            const main = data
                .filter(cat => targetNames.includes(cat.name.toLowerCase()))
                .sort((a, b) => {
                    const indexA = targetNames.indexOf(a.name.toLowerCase());
                    const indexB = targetNames.indexOf(b.name.toLowerCase());
                    return indexA - indexB;
                });
            setCategories(main);
        });
    }, []);

    // Auto-scroll logic
    useEffect(() => {
        if (categories.length === 0) return;

        const interval = setInterval(() => {
            setIndex((current) => (current + 1) % categories.length);
        }, 4000); // 4 seconds interval

        return () => clearInterval(interval);
    }, [categories.length]);

    if (categories.length === 0) return null;

    const next = () => setIndex((i) => (i + 1) % categories.length);
    const prev = () => setIndex((i) => (i - 1 + categories.length) % categories.length);

    const current = categories[index];

    return (
        <section className={styles.hero}>
            <div className={styles.slide}>
                <div className={styles.overlay} />
                {current.image ? (
                    <img
                        src={current.image}
                        alt={current.name}
                        className={styles.heroImage}
                    />
                ) : (
                    <div className={styles.imagePlaceholder} />
                )}

                <div className={clsx("container", styles.content)}>
                    <span className={styles.category}>EXPLORE CATEGORY</span>
                    <h1 className={styles.title}>{current.name}</h1>
                    <p className={styles.excerpt}>{current.description}</p>
                    <Link href={`/category/${current.slug}`} className={styles.cta}>
                        VIEW STORIES
                    </Link>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.dots}>
                    {categories.map((_, i) => (
                        <div
                            key={i}
                            className={clsx(styles.dot, i === index && styles.dotActive)}
                            onClick={() => setIndex(i)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
