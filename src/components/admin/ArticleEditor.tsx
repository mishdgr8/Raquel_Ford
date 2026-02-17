"use client";

import { useState, useEffect, useRef } from "react";
import { Article, Category, ArticleStatus, ContentBlock } from "@/lib/types";
import { articleService } from "@/lib/services/articles";
import { categoryService } from "@/lib/services/categories";
import { mediaService } from "@/lib/services/media";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import Image from "next/image";
import styles from "./ArticleEditor.module.css";
import { slugify } from "@/lib/utils";
import { Save, ChevronLeft, Eye, Edit3, Upload, X } from "lucide-react";
import { BlockEditor } from "./BlockEditor";
import { ArticleRenderer } from "../common/ArticleRenderer";
import { clsx } from "clsx";

interface ArticleEditorProps {
    articleId?: string;
    initialData?: Partial<Article>;
}

export function ArticleEditor({ articleId, initialData }: ArticleEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [mode, setMode] = useState<'edit' | 'preview'>('edit');
    const [uploadingFeatured, setUploadingFeatured] = useState(false);
    const featuredInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState<Partial<Article>>({
        title: "",
        slug: "",
        excerpt: "",
        categoryId: "",
        status: "draft" as ArticleStatus,
        contentJson: { blocks: [] },
        tags: [],
        ...initialData
    });

    const [tagInput, setTagInput] = useState("");

    useEffect(() => {
        categoryService.getCategories().then(setCategories);
    }, []);

    const [createdId, setCreatedId] = useState<string | null>(null);

    const handleSave = async (newStatus: ArticleStatus) => {
        if (loading) return;
        setLoading(true);

        try {
            // Build HTML from blocks for contentHtml
            const html = (form.contentJson?.blocks || []).map(b => {
                if (b.type === 'text') return b.data.text || '';
                if (b.type === 'image' && b.data.url) return `<figure><img src="${b.data.url}" alt="${b.data.caption || ''}" />${b.data.caption ? `<figcaption>${b.data.caption}</figcaption>` : ''}</figure>`;
                if (b.type === 'divider') return '<hr />';
                return '';
            }).join('\n');

            // Ensure slug is never empty
            const finalSlug = form.slug || slugify(form.title || 'untitled');
            setForm(prev => ({ ...prev, slug: finalSlug }));

            const dataToSave: any = {
                title: form.title,
                slug: finalSlug,
                excerpt: form.excerpt,
                categoryId: form.categoryId,
                status: newStatus,
                featuredImage: form.featuredImage,
                isEditorsPick: form.isEditorsPick || false,
                contentHtml: html,
                contentJson: form.contentJson,
                tags: form.tags || [],
            };

            if (newStatus === 'published') {
                // If there's a manual date, use it. Otherwise, if it wasn't published before, set to now.
                if (form.publishedAt) {
                    dataToSave.publishedAt = form.publishedAt;
                } else if (!form.publishedAt && !articleId && !initialData?.publishedAt) {
                    // Only default to NOW if it's a new publish without a date
                    dataToSave.publishedAt = new Date();
                } else if (!dataToSave.publishedAt && !initialData?.publishedAt) {
                    // Fallback for existing articles being published for the first time without a date
                    dataToSave.publishedAt = new Date();
                }
            } else if (form.publishedAt) {
                // Allow saving a date even for drafts/scheduled
                dataToSave.publishedAt = form.publishedAt;
            }

            setForm(prev => ({ ...prev, status: newStatus }));

            const targetId = articleId || initialData?.id || createdId;

            if (targetId) {
                await articleService.updateArticle(targetId, dataToSave);
                setNotification({ type: 'success', message: `Article ${newStatus === 'published' ? 'posted' : 'saved'} successfully` });
                setTimeout(() => setNotification(null), 3000);
            } else {
                const id = await articleService.createArticle(dataToSave as Article);
                setCreatedId(id);
                router.push(`/admin/articles/edit/${id}`);
            }
        } catch (err) {
            console.error(err);
            setNotification({ type: 'error', message: "Error saving article" });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleFeaturedUpload = async (file: File) => {
        setUploadingFeatured(true);
        try {
            const result = await mediaService.uploadMedia(file, "featured");
            setForm(prev => ({ ...prev, featuredImage: result.url }));
        } catch (err) {
            console.error("Featured image upload failed:", err);
            setNotification({ type: 'error', message: "Failed to upload featured image" });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setUploadingFeatured(false);
        }
    };

    return (
        <div className={styles.container}>
            {notification && (
                <div className={styles.notification} data-type={notification.type}>
                    {notification.message}
                </div>
            )}

            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <button onClick={() => router.back()} className={styles.backBtn}>
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className={styles.title}>{articleId ? "Edit Article" : "New Article"}</h1>
                    {form.status && (
                        <span className={clsx(styles.badge, styles[form.status])}>
                            {form.status}
                        </span>
                    )}
                </div>
                <div className={styles.headerRight}>
                    {/* Preview / Edit toggle */}
                    <button
                        className={clsx(styles.modeToggle, mode === 'preview' && styles.modeActive)}
                        onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
                    >
                        {mode === 'edit' ? <><Eye size={16} /> Preview</> : <><Edit3 size={16} /> Edit</>}
                    </button>

                    <Button
                        variant="outline"
                        onClick={() => handleSave('draft')}
                        loading={loading}
                        disabled={loading}
                    >
                        <Save size={18} />
                        <span>Save Draft</span>
                    </Button>
                    <Button
                        onClick={() => handleSave('published')}
                        loading={loading}
                        disabled={loading}
                        style={{ backgroundColor: 'black', color: 'white' }}
                    >
                        <span>Post</span>
                    </Button>
                </div>
            </header>

            {mode === 'edit' ? (
                <div className={styles.layout}>
                    <div className={styles.main}>
                        <section className={styles.baseInfo}>
                            <Input
                                label="Article Title"
                                placeholder="Enter a compelling title..."
                                value={form.title}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setForm(prev => ({
                                        ...prev,
                                        title: val,
                                        slug: articleId ? prev.slug : slugify(val)
                                    }));
                                }}
                                className={styles.titleInput}
                            />

                            <div className={styles.slugRow}>
                                <span>raquelford.com/articles/</span>
                                <input
                                    value={form.slug}
                                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                                    className={styles.slugInput}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div className={styles.excerptSection} style={{ marginTop: 0 }}>
                                    <label>Excerpt / Summary</label>
                                    <textarea
                                        value={form.excerpt}
                                        onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                                        placeholder="A brief summary for cards and SEO..."
                                        style={{ height: '100px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                                        Published Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={(() => {
                                            if (!form.publishedAt) return '';
                                            const date = new Date(form.publishedAt);
                                            // Handle invalid dates
                                            if (isNaN(date.getTime())) return '';

                                            // Format to YYYY-MM-DDTHH:mm in local time
                                            const pad = (n: number) => n < 10 ? '0' + n : n;
                                            return date.getFullYear() +
                                                '-' + pad(date.getMonth() + 1) +
                                                '-' + pad(date.getDate()) +
                                                'T' + pad(date.getHours()) +
                                                ':' + pad(date.getMinutes());
                                        })()}
                                        onChange={(e) => {
                                            const date = e.target.value ? new Date(e.target.value) : undefined;
                                            setForm(prev => ({ ...prev, publishedAt: date }));
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius)',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                                        Leave blank to set to "Now" upon publishing.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Gutenberg-style Block Editor */}
                        <section className={styles.editorSection}>
                            <BlockEditor
                                blocks={form.contentJson?.blocks || []}
                                onChange={(blocks: ContentBlock[]) => setForm(prev => ({
                                    ...prev,
                                    contentJson: { blocks }
                                }))}
                            />
                        </section>
                    </div>

                    <aside className={styles.settings}>
                        <div className={styles.settingBlock}>
                            <h3>Options</h3>
                            <label className={styles.checkbox} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={form.isEditorsPick || false}
                                    onChange={(e) => setForm(prev => ({ ...prev, isEditorsPick: e.target.checked }))}
                                    style={{ width: 'auto' }}
                                />
                                <span>Editor's Pick</span>
                            </label>
                            <div style={{ marginTop: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.35rem' }}>
                                    Heading Style
                                </label>
                                <select
                                    value={form.headingStyle || 'none'}
                                    onChange={(e) => setForm(prev => ({ ...prev, headingStyle: e.target.value as any }))}
                                    style={{
                                        width: '100%', padding: '0.5rem', borderRadius: '0.375rem',
                                        border: '1px solid #e2e8f0', fontSize: '0.875rem', backgroundColor: '#fff'
                                    }}
                                >
                                    <option value="none">Default (No Transform)</option>
                                    <option value="uppercase">UPPERCASE</option>
                                    <option value="sentence">Sentence case</option>
                                    <option value="title">Title Case</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.settingBlock}>
                            <h3>Categories</h3>
                            <div className={styles.categorySelect}>
                                {categories.map(cat => (
                                    <label key={cat.id} className={styles.checkbox}>
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={form.categoryId === cat.id}
                                            onChange={() => setForm(prev => ({ ...prev, categoryId: cat.id }))}
                                        />
                                        <span>{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.settingBlock}>
                            <h3>Featured Image</h3>
                            <input
                                type="file"
                                ref={featuredInputRef}
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                    if (e.target.files?.[0]) handleFeaturedUpload(e.target.files[0]);
                                    e.target.value = "";
                                }}
                            />

                            {form.featuredImage ? (
                                <div className={styles.featuredPreview}>
                                    <Image
                                        src={form.featuredImage}
                                        alt="Featured"
                                        fill
                                        className={styles.featuredPreviewImage}
                                    />
                                    <div className={styles.featuredActions}>
                                        <button onClick={() => featuredInputRef.current?.click()}>
                                            <Upload size={14} /> Replace
                                        </button>
                                        <button onClick={() => setForm(prev => ({ ...prev, featuredImage: "" }))}>
                                            <X size={14} /> Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    className={styles.featuredUploadBtn}
                                    onClick={() => featuredInputRef.current?.click()}
                                    disabled={uploadingFeatured}
                                >
                                    <Upload size={20} />
                                    <span>{uploadingFeatured ? "Uploading..." : "Upload Image"}</span>
                                </button>
                            )}

                            <Input
                                placeholder="Or paste image URL..."
                                value={form.featuredImage || ""}
                                onChange={(e) => setForm(prev => ({ ...prev, featuredImage: e.target.value }))}
                                className={styles.featuredUrlInput}
                            />
                        </div>

                        <div className={styles.settingBlock}>
                            <h3>Tags & SEO</h3>
                            <div className={styles.tagInputWrapper}>
                                <div className={styles.tagsList}>
                                    {(form.tags || []).map((tag, i) => (
                                        <span key={i} className={styles.tagItem}>
                                            {tag}
                                            <button
                                                className={styles.tagRemove}
                                                onClick={() => {
                                                    const newTags = [...(form.tags || [])];
                                                    newTags.splice(i, 1);
                                                    setForm(prev => ({ ...prev, tags: newTags }));
                                                }}
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    className={styles.tagInput}
                                    placeholder="Add tag (press Enter or comma)"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ',') {
                                            e.preventDefault();
                                            const tag = tagInput.trim().replace(/,$/, '');
                                            if (tag && !(form.tags || []).includes(tag)) {
                                                setForm(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }));
                                                setTagInput("");
                                            }
                                        }
                                    }}
                                />
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                    Tags help categorize your content and improve SEO ranking.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            ) : (
                /* ─── Preview Mode ───────────────────── */
                <div className={styles.previewMode}>
                    <div className={styles.previewChrome}>
                        <div className={styles.previewHeader}>
                            <span className={styles.previewLabel}>PREVIEW</span>
                            <span className={styles.previewUrl}>raquelford.com/articles/{form.slug || "..."}</span>
                        </div>
                        <article className={styles.previewArticle}>
                            <header className={styles.previewArticleHeader}>
                                <div className={styles.previewMeta}>
                                    <span>{categories.find(c => c.id === form.categoryId)?.name || "Uncategorized"}</span>
                                    <span>•</span>
                                    <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <h1 className={styles.previewTitle}>{form.title || "Untitled Article"}</h1>
                                {form.excerpt && <p className={styles.previewExcerpt}>{form.excerpt}</p>}
                            </header>
                            {form.featuredImage && (
                                <div className={styles.previewHero}>
                                    <Image
                                        src={form.featuredImage}
                                        alt={form.title || ""}
                                        fill
                                        className={styles.previewHeroImage}
                                        priority
                                    />
                                </div>
                            )}
                            <div className={styles.previewContent}>
                                <ArticleRenderer blocks={form.contentJson?.blocks || []} />
                            </div>
                        </article>
                    </div>
                </div>
            )}
        </div>
    );
}
