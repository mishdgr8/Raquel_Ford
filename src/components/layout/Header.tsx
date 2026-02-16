"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";
import styles from "./Header.module.css";
import { clsx } from "clsx";
import { Category } from "@/lib/types";
import { categoryService } from "@/lib/services/categories";

import { CategoryBar } from "./CategoryBar";

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        categoryService.getCategories().then((data) => {
            setCategories(data);
        });

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={clsx(styles.header, scrolled && styles.scrolled)}>
            <div className={clsx("container", styles.container)}>
                <Link href="/" className={styles.logo}>
                    RAQUEL FORD
                </Link>
                <Link href="/about" className={styles.navLink}>ABOUT</Link>
                <Link href="/articles" className={styles.navLink}>STORIES</Link>
                <Link href="/contact" className={styles.navLink}>CONTACT</Link>

                {/* Mobile Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className={styles.iconButton}>
                        <Search size={20} />
                    </button>
                    <button className={styles.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            <CategoryBar categories={categories} />

            {/* Mobile Nav Overlay */}
            <div className={clsx(styles.mobileNav, isOpen && styles.mobileNavOpen)}>
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className={styles.mobileNavLink}
                        onClick={() => setIsOpen(false)}
                    >
                        {cat.name}
                    </Link>
                ))}
            </div>
        </header>
    );
}
