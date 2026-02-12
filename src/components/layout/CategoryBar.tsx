"use client";

import { useState } from "react";
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

    // Filter and sort main categories alphabetically
    const mainCategories = categories
        .filter(cat => cat.isMain)
        .sort((a, b) => a.name.localeCompare(b.name));

    // Filter and sort secondary categories alphabetically
    const secondaryCategories = categories
        .filter(cat => !cat.isMain)
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className={styles.categoryBar}>
            <div className={clsx("container", styles.container)}>
                {mainCategories.map((cat) => {
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

                {secondaryCategories.length > 0 && (
                    <div
                        className={styles.dropdown}
                        onMouseEnter={() => setIsMenuOpen(true)}
                        onMouseLeave={() => setIsMenuOpen(false)}
                    >
                        <button className={clsx(styles.link, styles.dropdownTrigger)}>
                            MORE <ChevronDown size={14} className={clsx(styles.icon, isMenuOpen && styles.iconActive)} />
                        </button>

                        {isMenuOpen && (
                            <div className={styles.dropdownMenu}>
                                {secondaryCategories.map((cat) => {
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
