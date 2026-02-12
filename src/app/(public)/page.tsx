"use client";

import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { templateService } from "@/lib/services/templates";
import { useEffect, useState } from "react";
import { PageTemplate } from "@/lib/types";

export default function HomePage() {
    const [template, setTemplate] = useState<PageTemplate | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        templateService.getActiveTemplate('home')
            .then((data) => {
                setTemplate(data);
            })
            .catch((err) => {
                console.error("Error loading home template:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="container">Loading...</div>;

    if (!template || !template.blocks || template.blocks.length === 0) {
        return (
            <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', marginBottom: '1.5rem' }}>
                    Welcome to Raquel Ford
                </h1>
                <p style={{ color: 'var(--muted-foreground)', maxWidth: '600px', margin: '0 auto' }}>
                    We're currently setting up our digital magazine. Please check back soon or log in to the admin panel to configure the home page layout.
                </p>
            </div>
        );
    }

    return <BlockRenderer blocks={template.blocks} />;
}
