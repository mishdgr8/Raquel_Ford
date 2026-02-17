"use client";

import dynamic from "next/dynamic";

const TemplateEditor = dynamic(
    () => import("@/components/admin/TemplateEditor").then(m => ({ default: m.TemplateEditor })),
    { ssr: false, loading: () => <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading editor...</div> }
);

export default function NewTemplatePage() {
    return (
        <div style={{ padding: '0 2rem' }}>
            <TemplateEditor />
        </div>
    );
}
