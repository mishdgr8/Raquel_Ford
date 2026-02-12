"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Category } from "@/lib/types";
import styles from "./CategoryBar.module.css";
import { clsx } from "clsx";

interface CategoryBarProps {
    categories: Category[];
}

export function CategoryBar({ categories }: CategoryBarProps) {
    const pathname = usePathname();

    return (
        <div className={styles.categoryBar}>
            <div className={clsx("container", styles.container)}>
                {categories.map((cat) => {
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
            </div>
        </div>
    );
}
