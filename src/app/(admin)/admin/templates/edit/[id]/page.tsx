import { templateService } from "@/lib/services/templates";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { serializeFirestoreData } from "@/lib/utils";

const TemplateEditor = dynamic(
    () => import("@/components/admin/TemplateEditor").then(m => ({ default: m.TemplateEditor })),
    { loading: () => <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading editor...</div> }
);

interface EditTemplatePageProps {
    params: { id: string };
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
    const { id } = await params;
    const template = await templateService.getTemplateById(id);

    if (!template || !template.id) {
        return notFound();
    }

    const serializedTemplate = serializeFirestoreData(template);

    return (
        <div style={{ padding: '0 2rem' }}>
            <TemplateEditor templateId={serializedTemplate.id} initialData={serializedTemplate} />
        </div>
    );
}
