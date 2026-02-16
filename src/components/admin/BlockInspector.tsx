"use client";

import { useState, useEffect } from "react";
import { BlockInstance, Category } from "@/lib/types";
import { categoryService } from "@/lib/services/categories";
import { Input } from "../ui/Input";
import styles from "./BlockInspector.module.css";

interface BlockInspectorProps {
    block: BlockInstance;
    onUpdate: (config: any) => void;
}

export function BlockInspector({ block, onUpdate }: BlockInspectorProps) {
    const [categories, setCategories] = useState<Category[]>([]);

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
                            <label>Link URL</label>
                            <Input
                                value={block.configJson.link || ""}
                                onChange={(e) => handleChange('link', e.target.value)}
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
