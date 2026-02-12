"use client";

import { useState, useEffect } from "react";
import { settingsService } from "@/lib/services/settings";
import { SiteSettings } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./SettingsPage.module.css";

export default function SettingsPage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        settingsService.getSettings().then(data => {
            setSettings(data);
            setLoading(false);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        setSaving(true);
        try {
            await settingsService.updateSettings(settings);
            alert("Settings saved successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const updateField = (section: keyof SiteSettings, field: string, value: string) => {
        if (!settings) return;
        setSettings({
            ...settings,
            [section]: {
                ...(settings[section] as any),
                [field]: value
            }
        });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Site Settings</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                <section className={styles.section}>
                    <h2>General Branding</h2>
                    <div className={styles.grid}>
                        <Input
                            label="Site Name"
                            value={settings?.general.siteName || ""}
                            onChange={(e) => updateField('general', 'siteName', e.target.value)}
                        />
                        <Input
                            label="Tagline"
                            value={settings?.general.tagline || ""}
                            onChange={(e) => updateField('general', 'tagline', e.target.value)}
                        />
                    </div>
                </section>

                <section className={styles.section}>
                    <h2>SEO Defaults</h2>
                    <div className={styles.grid}>
                        <Input
                            label="Default Description"
                            value={settings?.seo.defaultDescription || ""}
                            onChange={(e) => updateField('seo', 'defaultDescription', e.target.value)}
                        />
                    </div>
                </section>

                <div className={styles.footer}>
                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
