import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { templateService } from "@/lib/services/templates";

// Force dynamic rendering since we depend on database content
export const dynamic = 'force-dynamic';

export default async function HomePage() {
    const template = await templateService.getActiveTemplate('home');

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
