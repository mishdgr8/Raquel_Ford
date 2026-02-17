import { ContentBlock } from "@/lib/types";
import Image from "next/image";
import styles from "./ArticleRenderer.module.css";
import { GalleryBlock } from "./GalleryBlock";

interface ArticleRendererProps {
    blocks?: ContentBlock[];
    html?: string;
}

export function ArticleRenderer({ blocks, html }: ArticleRendererProps) {
    // New format: render HTML directly
    if (html) {
        return (
            <div
                className={styles.container}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    }

    // Legacy format: render blocks
    if (!blocks || blocks.length === 0) return null;

    return (
        <div className={styles.container}>
            {blocks.map((block) => {
                switch (block.type) {
                    case 'text':
                        return (
                            <div
                                key={block.id}
                                className={styles.text}
                                dangerouslySetInnerHTML={{ __html: block.data.text || block.data.html }}
                            />
                        );
                    case 'image':
                        return (
                            <figure key={block.id} className={styles.imageWrapper}>
                                <Image
                                    src={block.data.url}
                                    alt={block.data.caption || ""}
                                    width={800}
                                    height={500}
                                    sizes="(max-width: 768px) 100vw, 700px"
                                    style={{ width: '100%', height: 'auto' }}
                                />
                                {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
                            </figure>
                        );
                    case 'gallery':
                        if (block.data.images && block.data.images.length > 0) {
                            return (
                                <div key={block.id} style={{ margin: '2rem 0' }}>
                                    <GalleryBlock
                                        images={block.data.images}
                                        columns={block.data.columns || 3}
                                    />
                                </div>
                            );
                        }
                        return null;
                    case 'divider':
                        return <hr key={block.id} className={styles.divider} />;
                    case 'embed':
                        if (block.data.embedType === 'youtube' && block.data.embedId) {
                            return (
                                <div key={block.id} style={{
                                    position: 'relative', paddingBottom: '56.25%',
                                    height: 0, overflow: 'hidden', maxWidth: '100%',
                                    margin: '2rem 0', borderRadius: '0.5rem',
                                }}>
                                    <iframe
                                        src={`https://www.youtube-nocookie.com/embed/${block.data.embedId}`}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        title="YouTube video"
                                    />
                                </div>
                            );
                        }
                        if (block.data.embedType === 'instagram' && block.data.embedId) {
                            return (
                                <div key={block.id} style={{ margin: '2rem 0', textAlign: 'center' }}>
                                    <iframe
                                        src={`https://www.instagram.com/p/${block.data.embedId}/embed`}
                                        style={{ width: '100%', maxWidth: '540px', height: '600px', border: 0 }}
                                        scrolling="no"
                                        loading="lazy"
                                        title="Instagram embed"
                                    />
                                </div>
                            );
                        }
                        return null;
                    default:
                        return null;
                }
            })}
        </div>
    );
}
