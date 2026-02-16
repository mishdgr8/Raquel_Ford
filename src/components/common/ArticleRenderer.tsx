import { ContentBlock } from "@/lib/types";
import styles from "./ArticleRenderer.module.css";

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
                                <img src={block.data.url} alt={block.data.caption || ""} />
                                {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
                            </figure>
                        );
                    case 'divider':
                        return <hr key={block.id} className={styles.divider} />;
                    default:
                        return null;
                }
            })}
        </div>
    );
}
