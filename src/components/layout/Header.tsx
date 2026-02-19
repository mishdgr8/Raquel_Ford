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
    const [isSearchOpen, setIsSearchOpen] = useState(false);
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

                <div className={styles.navGroup}>
                    {/* Desktop Nav */}
                    <nav className={styles.desktopNav}>
                        <Link href="/about" className={styles.navLink}>ABOUT</Link>
                        <Link href="/articles" className={styles.navLink}>STORIES</Link>
                        <Link href="/contact" className={styles.navLink}>CONTACT</Link>
                    </nav>

                    {/* Search & Mobile Toggle */}
                    <div className={styles.actions}>
                        <div className={clsx(styles.searchWrapper, isSearchOpen && styles.searchOpen)}>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const q = formData.get('q');
                                    if (q) window.location.href = `/search?q=${encodeURIComponent(q.toString())}`;
                                }}
                            >
                                <input
                                    name="q"
                                    placeholder="SEARCH..."
                                    className={styles.searchInput}
                                    autoFocus={isSearchOpen}
                                />
                            </form>
                            <button
                                className={styles.iconButton}
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                type="button"
                            >
                                {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                            </button>
                        </div>

                        <button className={styles.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
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
