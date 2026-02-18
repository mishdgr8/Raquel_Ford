"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./HeroCarousel.module.css";
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

const HERO_IMAGES: Record<string, string> = {
    'fashion': 'https://firebasestorage.googleapis.com/v0/b/raquel-ford-blog-cms.firebasestorage.app/o/uploads%2F1771422242914_fashion.png?alt=media&token=98e8a617-d7b9-41de-be33-7665bcdbd12d',
    'food': 'https://firebasestorage.googleapis.com/v0/b/raquel-ford-blog-cms.firebasestorage.app/o/uploads%2F1771420467268_food.png?alt=media&token=1f8d4cee-82a9-40a0-b5fd-f24a7baa238a',
    'living': 'https://firebasestorage.googleapis.com/v0/b/raquel-ford-blog-cms.firebasestorage.app/o/uploads%2F1771420421988_living.jpg?alt=media&token=3425673a-2bb9-4842-8b1e-9356f301f8a4',
    'entertainment': 'https://firebasestorage.googleapis.com/v0/b/raquel-ford-blog-cms.firebasestorage.app/o/uploads%2F1771345483671_Zendaya_entertainment.jpg?alt=media&token=18abe3a5-4d7a-4bfd-89ed-857630645a22',
    'events': 'https://firebasestorage.googleapis.com/v0/b/raquel-ford-blog-cms.firebasestorage.app/o/uploads%2F1771423579552_Screenshot%202026-02-18%20at%2015.03.34.jpg?alt=media&token=52486cc4-2e58-4337-8a6b-50b570a90ae5'
};

export function HeroCarousel({ config }: HeroCarouselProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        categoryService.getCategories().then((data) => {
            // Filter for specific main categories in the requested order
            const targetNames = ['beauty', 'entertainment', 'events', 'fashion', 'food', 'living'];

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
    const displayImage = HERO_IMAGES[current.name.toLowerCase()] || current.image;

    return (
        <section className={styles.hero}>
            <div className={styles.slide}>
                <div className={styles.overlay} />
                {displayImage ? (
                    <Image
                        src={displayImage}
                        alt={current.name}
                        fill
                        priority
                        unoptimized
                        sizes="100vw"
                        className={styles.heroImage}
                    />
                ) : (
                    <div className={styles.imagePlaceholder} />
                )}

                <div className={clsx("container", styles.content)}>
                    <span className={styles.category}>EXPLORE CATEGORY</span>
                    <h1 className={styles.title}>{current.name}</h1>
                    <Link href={`/category/${current.slug}`} className={styles.cta}>
                        VIEW STORIES
                    </Link>
                </div>
            </div>
        </section>
    );
}
