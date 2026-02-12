"use client";

import { useState, useEffect } from "react";
import { templateService } from "@/lib/services/templates";
import { PageTemplate } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Edit, Trash2, Layout, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import styles from "./TemplateList.module.css";

export default function AdminTemplateList() {
    const [templates, setTemplates] = useState<PageTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const data = await templateService.getTemplates();
            setTemplates(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this template? This will remove all block configurations associated with it.")) {
            await templateService.deleteTemplate(id);
            fetchTemplates();
        }
    };

    if (loading) return <div>Loading Templates...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Page Builder</h1>
                    <p className={styles.subtitle}>Manage layout templates for your site</p>
                </div>
                <Link href="/admin/templates/new">
                    <Button className={styles.addBtn}>
                        <Plus size={18} />
                        <span>New Template</span>
                    </Button>
                </Link>
            </header>

            <div className={styles.grid}>
                {templates.map((template) => (
                    <div key={template.id} className={styles.card}>
                        <div className={styles.cardMain}>
                            <div className={styles.iconWrapper}>
                                <Layout size={24} />
                            </div>
                            <div className={styles.info}>
                                <div className={styles.nameRow}>
                                    <h3 className={styles.name}>{template.name}</h3>
                                    {template.isActive && <CheckCircle2 size={16} className={styles.activeIcon} />}
                                </div>
                                <p className={styles.type}>{template.pageType.toUpperCase()} PAGE</p>
                                <p className={styles.date}>Updated {formatDate(template.updatedAt)}</p>
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <Link href={`/admin/templates/edit/${template.id}`} className={styles.edit}>
                                <Edit size={16} />
                                <span>Edit Layout</span>
                            </Link>
                            <button onClick={() => handleDelete(template.id)} className={styles.delete}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {templates.length === 0 && (
                    <div className={styles.empty}>
                        <p>No templates created yet. Start by building your first layout.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
