"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, authService } from "@/lib/auth";
import {
    LayoutDashboard,
    FileText,
    FolderTree,
    Image as ImageIcon,
    Mail,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
    X,
    Palette,
    BarChart3,
    MessageCircle
} from "lucide-react";
import clsx from "clsx";
import styles from "./AdminLayout.module.css";

const sidebarLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/articles", label: "Articles", icon: FileText },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/media", label: "Media Library", icon: ImageIcon },
    { href: "/admin/comments", label: "Comments", icon: MessageCircle },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/templates", label: "Page Builder", icon: Palette },
    { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
    { href: "/admin/settings", label: "Site Settings", icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Protection
    useEffect(() => {
        if (!loading) {
            const isPublicAdminPage = pathname === "/admin/login" || pathname === "/admin/signup";

            if (!user && !isPublicAdminPage) {
                router.push("/admin/login");
            }
        }
    }, [user, loading, pathname, router]);

    const handleLogout = async () => {
        try {
            await authService.signOut();
            router.push("/admin/login");
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className={styles.loading}>Loading Shield...</div>;

    // Don't show sidebar on login or signup pages
    if (pathname === "/admin/login" || pathname === "/admin/signup") {
        return <>{children}</>;
    }

    if (!user) return null;

    if (!isAdmin) {
        return (
            <div className={styles.loading}>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <h1 style={{ marginBottom: '1rem' }}>Access Denied</h1>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                        Your account ({user.email}) does not have administrative privileges.
                    </p>
                    <button
                        onClick={handleLogout}
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: '#1a1a1a', color: '#fff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={clsx(styles.sidebar, mobileMenuOpen && styles.sidebarOpen)}>
                <div className={styles.sidebarHeader}>
                    <Link href="/" className={styles.logo}>
                        RF <span>ADMIN</span>
                    </Link>
                    <button className={styles.mobileClose} onClick={() => setMobileMenuOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={clsx(styles.navLink, isActive && styles.navLinkActive)}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Icon size={18} />
                                <span>{link.label}</span>
                                {isActive && <ChevronRight size={14} className={styles.activeIndicator} />}
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.sidebarFooter}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                <header className={styles.topHeader}>
                    <button className={styles.mobileOpen} onClick={() => setMobileMenuOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <div className={styles.userSection}>
                        <span className={styles.userEmail}>{user.email}</span>
                        <div className={styles.avatar}>{user.email?.[0].toUpperCase()}</div>
                    </div>
                </header>
                <div className={styles.content}>{children}</div>
            </main>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div className={styles.overlay} onClick={() => setMobileMenuOpen(false)} />
            )}
        </div>
    );
}
