import { templateService } from "@/lib/services/templates";
import { TemplateEditor } from "@/components/admin/TemplateEditor";
import { notFound } from "next/navigation";

interface EditTemplatePageProps {
    params: { id: string };
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
    const template = await templateService.getTemplateById(params.id);

    if (!template) {
        return notFound();
    }

    return (
        <div style={{ padding: '0 2rem' }}>
            <TemplateEditor templateId={params.id} initialData={template} />
        </div>
    );
}
