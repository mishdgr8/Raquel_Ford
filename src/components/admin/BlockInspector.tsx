"use client";

import { useState, useEffect, useRef } from "react";
import { BlockInstance, Category } from "@/lib/types";
import { categoryService } from "@/lib/services/categories";
import { mediaService } from "@/lib/services/media";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import styles from "./BlockInspector.module.css";
import { MediaLibraryModal } from "./MediaLibraryModal";
import { Images } from "lucide-react";

interface BlockInspectorProps {
    block: BlockInstance;
    onUpdate: (config: any) => void;
}

export function BlockInspector({ block, onUpdate }: BlockInspectorProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [uploading, setUploading] = useState(false);
    const [showLibrary, setShowLibrary] = useState<{ open: boolean; target: 'cover' | number }>({ open: false, target: 'cover' });
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
            case 'BrandBanner':
                return (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Title (Use \n for line breaks)</label>
                            <textarea
                                className={styles.textarea}
                                value={block.configJson.title || ""}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder={"WE EMPOWER OUR\nAUDIENCE TO LIVE\nTHEIR BEST LIVE"}
                                style={{ height: '80px' }}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Image URL</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Input
                                    value={block.configJson.imageUrl || ""}
                                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                                    placeholder="https://..."
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowLibrary({ open: true, target: 'cover' })}
                                    style={{
                                        padding: '0 0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0',
                                        borderRadius: '4px', cursor: 'pointer'
                                    }}
                                >
                                    <Images size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                );
            case 'SimpleBanner':
                return (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Title</label>
                            <Input
                                value={block.configJson.title || ""}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="ADVERTISE WITH RAQUEL FORD"
                            />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.fieldGroup}>
                                <label>BG Color</label>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    <Input
                                        type="color"
                                        value={block.configJson.backgroundColor || "#FFD447"}
                                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                        style={{ width: '40px', padding: '2px', height: '36px' }}
                                    />
                                    <Input
                                        value={block.configJson.backgroundColor || "#FFD447"}
                                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                </div>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Text Color</label>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    <Input
                                        type="color"
                                        value={block.configJson.textColor || "#11001C"}
                                        onChange={(e) => handleChange('textColor', e.target.value)}
                                        style={{ width: '40px', padding: '2px', height: '36px' }}
                                    />
                                    <Input
                                        value={block.configJson.textColor || "#11001C"}
                                        onChange={(e) => handleChange('textColor', e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.fieldGroup}>
                                <label>Button Text</label>
                                <Input
                                    value={block.configJson.buttonText || ""}
                                    onChange={(e) => handleChange('buttonText', e.target.value)}
                                    placeholder="CONTACT US"
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Button Link</label>
                                <Input
                                    value={block.configJson.buttonLink || ""}
                                    onChange={(e) => handleChange('buttonLink', e.target.value)}
                                    placeholder="mailto:..."
                                />
                            </div>
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
                        <div className={styles.fieldGroup}>
                            <label>Manual Reel URLs (Plan B)</label>
                            <div className={styles.listContainer}>
                                {(block.configJson.reelUrls || []).map((url: string, index: number) => (
                                    <div key={index} className={styles.listItem}>
                                        <Input
                                            value={url}
                                            onChange={(e) => {
                                                const newUrls = [...(block.configJson.reelUrls || [])];
                                                newUrls[index] = e.target.value;
                                                handleChange('reelUrls', newUrls);
                                            }}
                                            placeholder="https://www.instagram.com/reels/..."
                                        />
                                        <Button
                                            onClick={() => {
                                                const newUrls = (block.configJson.reelUrls || []).filter((_: any, i: number) => i !== index);
                                                handleChange('reelUrls', newUrls);
                                            }}
                                            style={{ padding: '0 0.5rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))}
                                <button
                                    className={styles.addBtn}
                                    onClick={() => handleChange('reelUrls', [...(block.configJson.reelUrls || []), ""])}
                                >
                                    <Plus size={14} />
                                    Add Reel URL
                                </button>
                            </div>
                            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>
                                Use these if you don&apos;t have an API token yet. The reels will be embedded directly.
                            </p>
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
                                            onClick={() => setShowLibrary({ open: true, target: 'cover' })}
                                            style={{
                                                padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600,
                                                background: '#f1f5f9', border: '1px solid #e2e8f0',
                                                borderRadius: '4px', cursor: 'pointer',
                                            }}
                                        >
                                            <Images size={12} style={{ marginRight: '4px' }} />
                                            Library
                                        </button>
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
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => coverInputRef.current?.click()}
                                        disabled={uploading}
                                        style={{
                                            display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                            padding: '0.75rem 1rem', border: '2px dashed #cbd5e1', borderRadius: '6px',
                                            background: '#fafbfc', color: '#64748b', cursor: 'pointer',
                                            fontSize: '0.85rem', fontWeight: 500,
                                        }}
                                    >
                                        {uploading ? 'Uploading...' : '📷 Upload'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowLibrary({ open: true, target: 'cover' })}
                                        style={{
                                            display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                            padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '6px',
                                            background: '#fff', color: '#0f172a', cursor: 'pointer',
                                            fontSize: '0.85rem', fontWeight: 500,
                                        }}
                                    >
                                        <Images size={20} />
                                        <span>Library</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label>Preview Images (Min 3)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                {[0, 1, 2].map((idx) => (
                                    <div key={idx} style={{ position: 'relative' }}>
                                        <input
                                            type="file"
                                            id={`preview-${idx}`}
                                            accept="image/*"
                                            multiple
                                            style={{ display: 'none' }}
                                            onChange={async (e) => {
                                                const files = Array.from(e.target.files || []);
                                                if (files.length === 0) return;

                                                setUploading(true);
                                                try {
                                                    const uploadPromises = files.map(f => mediaService.uploadMedia(f, 'magazine'));
                                                    const results = await Promise.all(uploadPromises);

                                                    const newPreviews = [...(block.configJson.previewImages || [])];

                                                    // Start assigning from the clicked slot index, up to the 3 available slots
                                                    results.forEach((res, i) => {
                                                        if (idx + i < 3) {
                                                            newPreviews[idx + i] = res.url;
                                                        }
                                                    });

                                                    handleChange('previewImages', newPreviews);
                                                } catch (err) {
                                                    console.error('Preview batch upload failed:', err);
                                                    alert('Batch upload failed');
                                                } finally {
                                                    setUploading(false);
                                                    e.target.value = '';
                                                }
                                            }}
                                        />
                                        <div
                                            onClick={() => setShowLibrary({ open: true, target: idx })}
                                            style={{
                                                aspectRatio: '3/4',
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                position: 'relative'
                                            }}
                                        >
                                            {block.configJson.previewImages?.[idx] ? (
                                                <Image
                                                    src={block.configJson.previewImages[idx]}
                                                    alt={`Preview ${idx + 1}`}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: '1.5rem', color: '#cbd5e1' }}>+</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <MediaLibraryModal
                            isOpen={showLibrary.open}
                            onClose={() => setShowLibrary({ ...showLibrary, open: false })}
                            onSelect={(url) => {
                                if (showLibrary.target === 'cover') {
                                    // Handles both Magazine cover and general image URL fields
                                    if (block.blockType === 'BrandBanner') {
                                        handleChange('imageUrl', url);
                                    } else {
                                        handleChange('coverImage', url);
                                    }
                                } else {
                                    const newPreviews = [...(block.configJson.previewImages || [])];
                                    newPreviews[showLibrary.target] = url;
                                    handleChange('previewImages', newPreviews);
                                }
                            }}
                            title={`Select ${showLibrary.target === 'cover' ? 'Image' : 'Preview Image'}`}
                        />

                        <div className={styles.fieldGroup}>
                            <label>Download URL</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Input
                                    value={block.configJson.downloadUrl || ""}
                                    onChange={(e) => handleChange('downloadUrl', e.target.value)}
                                    placeholder="https://..."
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="file"
                                    id="magazine-pdf-upload"
                                    accept="application/pdf"
                                    style={{ display: 'none' }}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setUploading(true);
                                        try {
                                            const result = await mediaService.uploadMedia(file, 'magazine');
                                            handleChange('downloadUrl', result.url);
                                        } catch (err) {
                                            console.error('PDF upload failed:', err);
                                            alert('Failed to upload PDF');
                                        } finally {
                                            setUploading(false);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('magazine-pdf-upload')?.click()}
                                    style={{
                                        padding: '0 1rem',
                                        background: '#f1f5f9',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Upload PDF
                                </button>
                            </div>
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
