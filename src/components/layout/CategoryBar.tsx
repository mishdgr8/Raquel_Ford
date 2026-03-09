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

    const targetOrder = ['beauty', 'entertainment', 'events', 'fashion', 'food', 'living'];

    const allMainCategories = targetOrder
        .map(name => categories.find(cat => cat.name.toLowerCase() === name))
        .filter((cat): cat is Category => cat !== undefined);

    const visibleCount = isMobile ? 3 : 6;
    const visibleCategories = allMainCategories.slice(0, visibleCount);
    const hiddenMainCategories = allMainCategories.slice(visibleCount);

    const otherCategories = categories
        .filter(cat => !targetOrder.includes(cat.name.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    const dropdownCategories = [...hiddenMainCategories, ...otherCategories];

    return (
        <div className={styles.categoryBar} role="navigation" aria-label="Category navigation">
            <div className={clsx("container", styles.container)}>
                {visibleCategories.map((cat) => {
                    const href = `/category/${cat.slug}`;
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={cat.id}
                            href={href}
                            className={clsx(styles.link, isActive && styles.active)}
                            aria-current={isActive ? 'page' : undefined}
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
                    >
                        <button
                            className={clsx(styles.link, styles.dropdownTrigger)}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-expanded={isMenuOpen}
                            aria-haspopup="true"
                            aria-label="More categories"
                        >
                            MORE <ChevronDown size={14} className={clsx(styles.icon, isMenuOpen && styles.iconActive)} />
                        </button>

                        {isMenuOpen && (
                            <div className={styles.dropdownMenu} role="menu">
                                {dropdownCategories.map((cat) => {
                                    const href = `/category/${cat.slug}`;
                                    const isActive = pathname === href;
                                    return (
                                        <Link
                                            key={cat.id}
                                            href={href}
                                            className={clsx(styles.dropdownLink, isActive && styles.active)}
                                            role="menuitem"
                                            aria-current={isActive ? 'page' : undefined}
                                            onClick={() => setIsMenuOpen(false)}
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
