import { articleService } from "@/lib/services/articles";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { notFound } from "next/navigation";
import { serializeFirestoreData } from "@/lib/utils";

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
