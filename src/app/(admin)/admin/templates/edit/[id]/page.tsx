import { templateService } from "@/lib/services/templates";
import { TemplateEditor } from "@/components/admin/TemplateEditor";
import { notFound } from "next/navigation";
import { serializeFirestoreData } from "@/lib/utils";

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
