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

interface ArticleEditorProps {
    articleId?: string;
    initialData?: Partial<Article>;
}

export function ArticleEditor({ articleId, initialData }: ArticleEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

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

    const handleSave = async () => {
        setLoading(true);
        try {
            if (articleId) {
                await articleService.updateArticle(articleId, form);
            } else {
                const id = await articleService.createArticle(form as Article);
                router.push(`/admin/articles/edit/${id}`);
            }
            alert("Article saved successfully");
        } catch (err) {
            alert("Error saving article");
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
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <button onClick={() => router.back()} className={styles.backBtn}>
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className={styles.title}>{articleId ? "Edit Article" : "New Article"}</h1>
                </div>
                <div className={styles.headerRight}>
                    <Button variant="outline" onClick={handleSave} loading={loading}>
                        <Save size={18} />
                        <span>{articleId ? "Update" : "Save Draft"}</span>
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
                    <div className={styles.settingBlock}>
                        <h3>Publishing</h3>
                        <div className={styles.selectRow}>
                            <label>Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as ArticleStatus }))}
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="scheduled">Scheduled</option>
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
                </aside>
            </div>
        </div>
    );
}
