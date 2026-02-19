"use client";

import dynamic from "next/dynamic";

const ArticleEditor = dynamic(
    () => import("@/components/admin/ArticleEditor").then(m => ({ default: m.ArticleEditor })),
    { ssr: false, loading: () => <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading editor...</div> }
);

export default function NewArticlePage() {
    return (
        <div style={{ padding: '0 2rem' }}>
            <ArticleEditor />
        </div>
    );
}
