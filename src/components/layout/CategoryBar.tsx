"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Category } from "@/lib/types";
import styles from "./CategoryBar.module.css";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

interface CategoryBarProps {
    categories: Category[];
}

export function CategoryBar({ categories }: CategoryBarProps) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Strictly ordered main categories as requested
    const targetOrder = ['beauty', 'entertainment', 'events', 'fashion', 'food', 'living'];

    const allMainCategories = targetOrder
        .map(name => categories.find(cat => cat.name.toLowerCase() === name))
        .filter((cat): cat is Category => cat !== undefined);

    // Determine how many to show based on device
    const visibleCount = isMobile ? 3 : 6;
    const visibleCategories = allMainCategories.slice(0, visibleCount);

    // Categories that are "main" but hidden on mobile go to dropdown
    const hiddenMainCategories = allMainCategories.slice(visibleCount);

    // Any other categories go to secondary
    const otherCategories = categories
        .filter(cat => !targetOrder.includes(cat.name.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    // Combined dropdown items
    const dropdownCategories = [...hiddenMainCategories, ...otherCategories];

    return (
        <div className={styles.categoryBar}>
            <div className={clsx("container", styles.container)}>
                {visibleCategories.map((cat) => {
                    const href = `/category/${cat.slug}`;
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={cat.id}
                            href={href}
                            className={clsx(styles.link, isActive && styles.active)}
                        >
                            {cat.name}
                        </Link>
                    );
                })}

                {dropdownCategories.length > 0 && (
                    <div
                        className={styles.dropdown}
                        onMouseEnter={() => setIsMenuOpen(true)}
                        onMouseLeave={() => setIsMenuOpen(false)}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <button className={clsx(styles.link, styles.dropdownTrigger)}>
                            MORE <ChevronDown size={14} className={clsx(styles.icon, isMenuOpen && styles.iconActive)} />
                        </button>

                        {isMenuOpen && (
                            <div className={styles.dropdownMenu}>
                                {dropdownCategories.map((cat) => {
                                    const href = `/category/${cat.slug}`;
                                    const isActive = pathname === href;
                                    return (
                                        <Link
                                            key={cat.id}
                                            href={href}
                                            className={clsx(styles.dropdownLink, isActive && styles.active)}
                                        >
                                            {cat.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
