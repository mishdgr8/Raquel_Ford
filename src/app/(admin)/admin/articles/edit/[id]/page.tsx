import { articleService } from "@/lib/services/articles";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { serializeFirestoreData } from "@/lib/utils";

const ArticleEditor = dynamic(
    () => import("@/components/admin/ArticleEditor").then(m => ({ default: m.ArticleEditor })),
    { loading: () => <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading editor...</div> }
);

interface EditArticlePageProps {
    params: { id: string };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
    const { id } = await params;
    const article = await articleService.getArticleById(id);

    if (!article) {
        return notFound();
    }

    const serializedArticle = serializeFirestoreData(article);

    return (
        <div style={{ padding: '0 2rem' }}>
            <ArticleEditor articleId={id} initialData={serializedArticle} />
        </div>
    );
}
