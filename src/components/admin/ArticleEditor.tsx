"use client";

import { useState, useEffect } from "react";
import { Article, Category, ArticleStatus, ContentBlock } from "@/lib/types";
import { articleService } from "@/lib/services/articles";
import { categoryService } from "@/lib/services/categories";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import styles from "./ArticleEditor.module.css";
import { slugify } from "@/lib/utils";
import { Save, ChevronLeft, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
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

    const [form, setForm] = useState<Partial<Article>>({
        title: "",
        slug: "",
        excerpt: "",
        categoryId: "",
        status: "draft" as ArticleStatus,
        contentJson: { blocks: [] },
        ...initialData
    });

    useEffect(() => {
        categoryService.getCategories().then(setCategories);
    }, []);

    // Track created ID to prevent duplicates if user keeps clicking
    const [createdId, setCreatedId] = useState<string | null>(null);

    const handleSave = async (newStatus: ArticleStatus) => {
        if (loading) return;
        setLoading(true);

        try {
            // Update the form with the new status immediately
            const dataToSave: any = { ...form, status: newStatus };
            if (newStatus === 'published' && !form.publishedAt) {
                dataToSave.publishedAt = new Date(); // Use client date or serverTimestamp
            }

            setForm(prev => ({ ...prev, status: newStatus }));

            const targetId = articleId || initialData?.id || createdId;

            if (targetId) {
                // Update existing
                await articleService.updateArticle(targetId, dataToSave);
                // alert(`Article ${newStatus === 'published' ? 'posted' : 'saved'} successfully`);
                setNotification({ type: 'success', message: `Article ${newStatus === 'published' ? 'posted' : 'saved'} successfully` });
                setTimeout(() => setNotification(null), 3000);
            } else {
                // Create new
                const id = await articleService.createArticle(dataToSave as Article);
                setCreatedId(id); // Prevent duplicate creation
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

    const addBlock = (type: ContentBlock['type']) => {
        const newBlock: ContentBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            data: type === 'text' ? { text: "" } : type === 'image' ? { url: "", caption: "" } : {}
        };
        setForm(prev => ({
            ...prev,
            contentJson: {
                blocks: [...(prev.contentJson?.blocks || []), newBlock]
            }
        }));
    };

    const updateBlock = (id: string, data: any) => {
        setForm(prev => ({
            ...prev,
            contentJson: {
                blocks: (prev.contentJson?.blocks || []).map(b => b.id === id ? { ...b, data } : b)
            }
        }));
    };

    const removeBlock = (id: string) => {
        setForm(prev => ({
            ...prev,
            contentJson: {
                blocks: (prev.contentJson?.blocks || []).filter(b => b.id !== id)
            }
        }));
    };

    return (
        <div className={styles.container}>
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    backgroundColor: notification.type === 'success' ? '#22c55e' : '#ef4444',
                    color: 'white',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    animation: 'slideIn 0.3s ease-out'
                }}>
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

                        <div className={styles.excerptSection}>
                            <label>Excerpt / Summary</label>
                            <textarea
                                value={form.excerpt}
                                onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                                placeholder="A brief summary for cards and SEO..."
                            />
                        </div>
                    </section>

                    <section className={styles.editor}>
                        <h2 className={styles.sectionTitle}>Content Blocks</h2>
                        <div className={styles.blockList}>
                            {(form.contentJson?.blocks || []).map((block) => (
                                <div key={block.id} className={styles.blockItem}>
                                    <div className={styles.blockHandle}>
                                        <span>{block.type.toUpperCase()}</span>
                                        <button onClick={() => removeBlock(block.id)}><Trash2 size={14} /></button>
                                    </div>
                                    <div className={styles.blockContent}>
                                        {block.type === 'text' && (
                                            <RichTextEditor
                                                value={block.data.text}
                                                onChange={(text: string) => updateBlock(block.id, { ...block.data, text })}
                                                placeholder="Write your story here..."
                                            />
                                        )}
                                        {block.type === 'image' && (
                                            <div className={styles.imageBlock}>
                                                <Input
                                                    placeholder="Image URL"
                                                    value={block.data.url}
                                                    onChange={(e) => updateBlock(block.id, { ...block.data, url: e.target.value })}
                                                />
                                                <Input
                                                    placeholder="Caption"
                                                    value={block.data.caption}
                                                    onChange={(e) => updateBlock(block.id, { ...block.data, caption: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.addBlock}>
                            <button onClick={() => addBlock('text')}><Plus size={16} /> <span>Text</span></button>
                            <button onClick={() => addBlock('image')}><ImageIcon size={16} /> <span>Image</span></button>
                        </div>
                    </section>
                </div>

                <aside className={styles.settings}>
                    {/* Status is now controlled by top buttons */}

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
                </aside>
            </div>
        </div>
    );
}
