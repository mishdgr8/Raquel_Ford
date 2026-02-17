"use client";

import { useState, useEffect, useRef } from "react";
import { BlockInstance, Category } from "@/lib/types";
import { categoryService } from "@/lib/services/categories";
import { mediaService } from "@/lib/services/media";
import { Input } from "../ui/Input";
import Image from "next/image";
import styles from "./BlockInspector.module.css";

interface BlockInspectorProps {
    block: BlockInstance;
    onUpdate: (config: any) => void;
}

export function BlockInspector({ block, onUpdate }: BlockInspectorProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [uploading, setUploading] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        categoryService.getCategories().then(setCategories);
    }, []);

    const handleChange = (key: string, value: any) => {
        const newConfig = { ...block.configJson, [key]: value };
        onUpdate(newConfig);
    };

    const renderFields = () => {
        switch (block.blockType) {
            case 'HeroCarousel':
                return (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Number of Slides</label>
                            <Input
                                type="number"
                                value={block.configJson.count || 5}
                                onChange={(e) => handleChange('count', parseInt(e.target.value))}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={block.configJson.autoplay ?? true}
                                    onChange={(e) => handleChange('autoplay', e.target.checked)}
                                />
                                Autoplay Slides
                            </label>
                        </div>
                    </>
                );
            case 'LatestArticles':
                return (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Section Title</label>
                            <Input
                                value={block.configJson.title || ""}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="LATEST STORIES"
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Number of Articles</label>
                            <Input
                                type="number"
                                value={block.configJson.count || 5}
                                onChange={(e) => handleChange('count', parseInt(e.target.value))}
                            />
                        </div>
                    </>
                );
            case 'PostGrid':
                return (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Section Title</label>
                            <Input
                                value={block.configJson.title || ""}
                                onChange={(e) => handleChange('title', e.target.value)}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Category Filter</label>
                            <select
                                className={styles.select}
                                value={block.configJson.categoryId || ""}
                                onChange={(e) => handleChange('categoryId', e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.fieldGroup}>
                                <label>Count</label>
                                <Input
                                    type="number"
                                    value={block.configJson.count || 4}
                                    onChange={(e) => handleChange('count', parseInt(e.target.value))}
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Columns</label>
                                <Input
                                    type="number"
                                    value={block.configJson.columns || 4}
                                    onChange={(e) => handleChange('columns', parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    </>
                );
            case 'NewsletterSignup':
                return (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Title</label>
                            <Input
                                value={block.configJson.title || ""}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="JOIN THE NEWSLETTER"
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Description</label>
                            <textarea
                                className={styles.textarea}
                                value={block.configJson.description || ""}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Stay ahead of the curve..."
                            />
                        </div>
                    </>
                );
            case 'IGReels':
                return (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Title</label>
                            <Input
                                value={block.configJson.title || ""}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="FOLLOW THE VIBE"
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Instagram Handle</label>
                            <Input
                                value={block.configJson.handle || ""}
                                onChange={(e) => handleChange('handle', e.target.value)}
                                placeholder="@raquelford"
                            />
                        </div>
                    </>
                );
            case 'MagazinePromo':
                return (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Title</label>
                            <Input
                                value={block.configJson.title || ""}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="THE RAQUEL FORD MAGAZINE"
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Description</label>
                            <textarea
                                className={styles.textarea}
                                value={block.configJson.description || ""}
                                onChange={(e) => handleChange('description', e.target.value)}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Cover Image</label>
                            <input
                                type="file"
                                ref={coverInputRef}
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setUploading(true);
                                    try {
                                        const result = await mediaService.uploadMedia(file, 'magazine');
                                        handleChange('coverImage', result.url);
                                    } catch (err) {
                                        console.error('Cover upload failed:', err);
                                        alert('Upload failed');
                                    } finally {
                                        setUploading(false);
                                        e.target.value = '';
                                    }
                                }}
                            />
                            {block.configJson.coverImage ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        position: 'relative',
                                        width: '80px',
                                        height: '107px',
                                        borderRadius: '4px',
                                        border: '1px solid #e2e8f0',
                                        overflow: 'hidden'
                                    }}>
                                        <Image
                                            src={block.configJson.coverImage}
                                            alt="Cover preview"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => coverInputRef.current?.click()}
                                            style={{
                                                padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600,
                                                background: '#f1f5f9', border: '1px solid #e2e8f0',
                                                borderRadius: '4px', cursor: 'pointer',
                                            }}
                                        >Replace</button>
                                        <button
                                            type="button"
                                            onClick={() => handleChange('coverImage', '')}
                                            style={{
                                                padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600,
                                                background: '#fef2f2', border: '1px solid #fecaca',
                                                borderRadius: '4px', cursor: 'pointer', color: '#dc2626',
                                            }}
                                        >Remove</button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => coverInputRef.current?.click()}
                                    disabled={uploading}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.75rem 1rem', width: '100%',
                                        border: '2px dashed #cbd5e1', borderRadius: '6px',
                                        background: '#fafbfc', color: '#64748b',
                                        cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                                    }}
                                >
                                    {uploading ? 'Uploading...' : '📷 Upload cover image'}
                                </button>
                            )}
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Download URL</label>
                            <Input
                                value={block.configJson.downloadUrl || ""}
                                onChange={(e) => handleChange('downloadUrl', e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </>
                );
            default:
                return <p className={styles.info}>No configuration available for this block type.</p>;
        }
    };

    return (
        <div className={styles.container}>
            {renderFields()}
        </div>
    );
}
