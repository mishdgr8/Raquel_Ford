"use client";

import { useState, useEffect } from "react";
import { PageTemplate, BlockInstance } from "@/lib/types";
import { templateService } from "@/lib/services/templates";
import { Button } from "../ui/Button";
import { Plus, Save, Trash2, ArrowUp, ArrowDown, Settings, X } from "lucide-react";
import styles from "./TemplateEditor.module.css";
import clsx from "clsx";
import { BlockRenderer } from "../blocks/BlockRenderer";
import { BlockInspector } from "./BlockInspector";

interface TemplateEditorProps {
    templateId?: string;
    initialData?: PageTemplate;
}

const AVAILABLE_BLOCKS = [
    { type: 'HeroCarousel', label: 'Hero Carousel' },
    { type: 'LatestArticles', label: 'Latest Articles' },
    { type: 'NewsletterSignup', label: 'Newsletter Signup' },
    { type: 'PostGrid', label: 'Article Grid' },
    { type: 'IGReels', label: 'IG Reels Strip' },
    { type: 'MagazinePromo', label: 'Magazine Promo' }
];

export function TemplateEditor({ templateId, initialData }: TemplateEditorProps) {
    const [template, setTemplate] = useState<Partial<PageTemplate>>({
        name: "",
        pageType: "home",
        isActive: false,
        blocks: [],
        ...initialData
    });
    const [loading, setLoading] = useState(false);

    const [showPreview, setShowPreview] = useState(true);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (templateId) {
                await templateService.updateTemplate(templateId, template);
            } else {
                await templateService.createTemplate(template as PageTemplate);
            }
            alert("Template saved successfully");
        } catch (err) {
            alert("Error saving template");
        } finally {
            setLoading(false);
        }
    };

    const addBlock = (blockType: string) => {
        const newBlock: BlockInstance = {
            id: Math.random().toString(36).substr(2, 9),
            templateId: templateId || "temp",
            blockType,
            configJson: {},
            orderIndex: (template.blocks?.length || 0)
        };
        setTemplate(prev => ({
            ...prev,
            blocks: [...(prev.blocks || []), newBlock]
        }));
    };

    const removeBlock = (id: string) => {
        setTemplate(prev => ({
            ...prev,
            blocks: (prev.blocks || []).filter(b => b.id !== id)
        }));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const blocks = [...(template.blocks || [])];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= blocks.length) return;

        [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
        setTemplate(prev => ({ ...prev, blocks }));
    };

    const selectedBlock = template.blocks?.find(b => b.id === selectedBlockId);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerInfo}>
                    <input
                        className={styles.nameInput}
                        value={template.name}
                        onChange={(e) => setTemplate(p => ({ ...p, name: e.target.value }))}
                        placeholder="Template Name..."
                    />
                    <div className={styles.meta}>
                        <select
                            value={template.pageType}
                            onChange={(e) => setTemplate(p => ({ ...p, pageType: e.target.value as any }))}
                        >
                            <option value="home">Home Page</option>
                            <option value="category">Category Page</option>
                            <option value="article">Article Detail</option>
                        </select>
                        <label className={styles.activeSwitch}>
                            <input
                                type="checkbox"
                                checked={template.isActive}
                                onChange={(e) => setTemplate(p => ({ ...p, isActive: !p.isActive }))}
                            />
                            <span>Active</span>
                        </label>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={clsx(styles.previewToggle, showPreview && styles.active)}
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        {showPreview ? "Hide Preview" : "Show Preview"}
                    </button>
                    <Button onClick={handleSave} loading={loading}>
                        <Save size={18} />
                        <span>Save Changes</span>
                    </Button>
                </div>
            </header>

            <div className={styles.layout}>
                <div className={clsx(styles.mainEditor, !showPreview && styles.fullHeight)}>
                    <div className={styles.builder}>
                        <div className={styles.blockList}>
                            {(template.blocks || []).map((block, index) => (
                                <div
                                    key={block.id}
                                    className={clsx(styles.blockItem, selectedBlockId === block.id && styles.selected)}
                                    onClick={() => setSelectedBlockId(block.id)}
                                >
                                    <div className={styles.blockHeader}>
                                        <div className={styles.blockType}>
                                            <div className={styles.dragHandle} />
                                            <span>{block.blockType}</span>
                                        </div>
                                        <div className={styles.blockActions}>
                                            <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }} disabled={index === 0}><ArrowUp size={14} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }} disabled={index === (template.blocks?.length || 0) - 1}><ArrowDown size={14} /></button>
                                            <button
                                                className={styles.settingsBtn}
                                                onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); }}
                                            ><Settings size={14} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }} className={styles.deleteBtn}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.addBlockSection}>
                            <h3>Add Section</h3>
                            <div className={styles.blockChoices}>
                                {AVAILABLE_BLOCKS.map(b => (
                                    <button key={b.type} onClick={() => addBlock(b.type)} className={styles.choiceBtn}>
                                        <Plus size={16} />
                                        <span>{b.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <aside className={clsx(styles.inspector, selectedBlockId && styles.inspectorOpen)}>
                        <div className={styles.inspectorHeader}>
                            <Settings size={16} />
                            <span>Configure {selectedBlock?.blockType}</span>
                            <button onClick={() => setSelectedBlockId(null)}><X size={14} /></button>
                        </div>
                        {selectedBlock ? (
                            <div className={styles.inspectorContent}>
                                <BlockInspector
                                    block={selectedBlock}
                                    onUpdate={(newConfig) => {
                                        setTemplate(prev => ({
                                            ...prev,
                                            blocks: (prev.blocks || []).map(b =>
                                                b.id === selectedBlockId ? { ...b, configJson: newConfig } : b
                                            )
                                        }));
                                    }}
                                />
                            </div>
                        ) : (
                            <div className={styles.inspectorEmpty}>
                                Select a block to configure its properties
                            </div>
                        )}
                    </aside>
                </div>

                {showPreview && (
                    <div className={styles.previewContainer}>
                        <div className={styles.previewDevice}>
                            <div className={styles.previewContent}>
                                <BlockRenderer blocks={template.blocks || []} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
