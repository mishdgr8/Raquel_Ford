"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";
import styles from "./Header.module.css";
import { clsx } from "clsx";
import { Category } from "@/lib/types";
import { categoryService } from "@/lib/services/categories";

import { CategoryBar } from "./CategoryBar";

interface HeaderProps {
    initialCategories?: Category[];
}

export function Header({ initialCategories = [] }: HeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (categories.length === 0 && initialCategories.length > 0) {
            setCategories(initialCategories);
        }

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [initialCategories, categories.length]);

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
                                aria-label={isSearchOpen ? "Close search" : "Open search"}
                            >
                                {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                            </button>
                        </div>

                        <button
                            className={styles.mobileToggle}
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label={isOpen ? "Close menu" : "Open menu"}
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            <CategoryBar categories={categories} />

            {/* Mobile Nav Overlay */}
            <div className={clsx(styles.mobileNav, isOpen && styles.mobileNavOpen)}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const q = formData.get('q');
                        if (q) {
                            window.location.href = `/search?q=${encodeURIComponent(q.toString())}`;
                            setIsOpen(false);
                        }
                    }}
                    className={styles.mobileSearchForm}
                >
                    <input
                        name="q"
                        placeholder="SEARCH..."
                        className={styles.mobileSearchInput}
                        aria-label="Search articles"
                    />
                    <button type="submit" className={styles.mobileSearchButton} aria-label="Submit search">
                        <Search size={20} />
                    </button>
                </form>

                <Link
                    href="/"
                    className={styles.mobileNavLink}
                    onClick={() => setIsOpen(false)}
                >
                    HOME
                </Link>

                <Link
                    href="/articles"
                    className={styles.mobileNavLink}
                    onClick={() => setIsOpen(false)}
                >
                    STORIES
                </Link>

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
