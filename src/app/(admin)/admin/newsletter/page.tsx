"use client";

import { useState, useEffect } from "react";
import { newsletterService } from "@/lib/services/newsletter";
import { NewsletterSubscriber } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Download, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import styles from "./NewsletterAdmin.module.css";

export default function NewsletterAdminPage() {
    const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        newsletterService.getSubscribers().then((data) => {
            setSubscribers(data);
            setLoading(false);
        });
    }, []);

    const handleExport = () => {
        const csv = [
            ["Email", "Created At"],
            ...subscribers.map(s => [s.email, formatDate(s.createdAt)])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Newsletter Subscribers</h1>
                <Button onClick={handleExport} variant="outline">
                    <Download size={18} />
                    <span>Export CSV</span>
                </Button>
            </header>

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><Users size={24} /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Subscribers</span>
                        <span className={styles.statValue}>{subscribers.length}</span>
                    </div>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Email Address</th>
                            <th>Joined Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscribers.map((sub) => (
                            <tr key={sub.id}>
                                <td>{sub.email}</td>
                                <td>{formatDate(sub.createdAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
