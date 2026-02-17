"use client";

import { useState, useRef, useCallback } from "react";
import { ContentBlock } from "@/lib/types";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, Heading3, Heading4, Heading5, Pilcrow,
    List, ListOrdered, Quote,
    Link as LinkIcon,
    AlignLeft, AlignCenter, AlignRight,
    GripVertical, Trash2, Plus, ArrowUp, ArrowDown,
    Type, Image as ImageIcon, Minus as DividerIcon, Upload, Video
} from "lucide-react";
import styles from "./BlockEditor.module.css";
import { mediaService } from "@/lib/services/media";

// ─── Embed Helpers ──────────────────────────────────
function detectEmbedUrl(url: string): { type: 'youtube' | 'instagram' | null; id: string | null } {
    // YouTube
    const ytPatterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of ytPatterns) {
        const m = url.match(p);
        if (m) return { type: 'youtube', id: m[1] };
    }
    // Instagram
    const igMatch = url.match(/instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
    if (igMatch) return { type: 'instagram', id: igMatch[1] };

    return { type: null, id: null };
}

function isEmbedUrl(text: string): boolean {
    const trimmed = text.trim();
    const { type } = detectEmbedUrl(trimmed);
    return type !== null;
}

// ─── Types ──────────────────────────────────────────
interface BlockEditorProps {
    blocks: ContentBlock[];
    onChange: (blocks: ContentBlock[]) => void;
}

// ─── Embed Block Editor ─────────────────────────────
function EmbedBlockEditor({ block, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
    block: ContentBlock;
    onUpdate: (data: any) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}) {
    const [urlInput, setUrlInput] = useState('');
    const embedType = block.data.embedType as string | undefined;
    const embedId = block.data.embedId as string | undefined;

    const handleSetUrl = (url: string) => {
        const { type, id } = detectEmbedUrl(url);
        if (type && id) {
            onUpdate({ ...block.data, embedType: type, embedId: id, originalUrl: url });
        }
    };

    return (
        <div className={styles.blockWrapper}>
            <div className={styles.blockSide}>
                <button className={styles.dragHandle} title="Drag to reorder"><GripVertical size={16} /></button>
                <div className={styles.moveButtons}>
                    <button onClick={onMoveUp} disabled={isFirst} title="Move up"><ArrowUp size={12} /></button>
                    <button onClick={onMoveDown} disabled={isLast} title="Move down"><ArrowDown size={12} /></button>
                </div>
            </div>
            <div className={styles.blockBody}>
                <div className={styles.blockToolbar}>
                    <span className={styles.blockLabel}>
                        {embedType === 'youtube' ? '▶ YOUTUBE' : embedType === 'instagram' ? '📷 INSTAGRAM' : '🔗 EMBED'}
                    </span>
                    <button className={styles.deleteBtn} onClick={onDelete} title="Delete block"><Trash2 size={14} /></button>
                </div>

                {embedType && embedId ? (
                    <div style={{ margin: '0.75rem 1rem' }}>
                        {embedType === 'youtube' && (
                            <div style={{
                                position: 'relative',
                                paddingBottom: '56.25%',
                                height: 0,
                                overflow: 'hidden',
                                borderRadius: '8px',
                            }}>
                                <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${embedId}`}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    title="YouTube embed"
                                />
                            </div>
                        )}
                        {embedType === 'instagram' && (
                            <div style={{ textAlign: 'center' }}>
                                <iframe
                                    src={`https://www.instagram.com/p/${embedId}/embed`}
                                    style={{ width: '100%', maxWidth: '540px', height: '600px', border: 0 }}
                                    scrolling="no"
                                    loading="lazy"
                                    title="Instagram embed"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: '0.75rem', padding: '2rem', margin: '0.75rem 1rem',
                        border: '2px dashed #cbd5e1', borderRadius: '8px',
                        background: '#fafbfc', color: '#64748b',
                    }}>
                        <Video size={32} />
                        <p style={{ fontSize: '0.9375rem', fontWeight: 500, margin: 0 }}>Paste a YouTube or Instagram URL</p>
                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '480px' }}>
                            <input
                                type="text"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="https://www.instagram.com/reel/... or https://youtu.be/..."
                                style={{
                                    flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0',
                                    borderRadius: '6px', fontSize: '0.875rem', outline: 'none',
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && urlInput.trim()) {
                                        handleSetUrl(urlInput.trim());
                                    }
                                }}
                                onPaste={(e) => {
                                    // Auto-detect on paste
                                    setTimeout(() => {
                                        const pasted = (e.target as HTMLInputElement).value;
                                        if (pasted && isEmbedUrl(pasted)) {
                                            handleSetUrl(pasted.trim());
                                        }
                                    }, 50);
                                }}
                            />
                            <button
                                onClick={() => { if (urlInput.trim()) handleSetUrl(urlInput.trim()); }}
                                style={{
                                    padding: '0.5rem 1rem', background: '#1a1a1a', color: 'white',
                                    border: 'none', borderRadius: '6px', cursor: 'pointer',
                                    fontSize: '0.8rem', fontWeight: 600,
                                }}
                            >
                                Embed
                            </button>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            Supports YouTube videos, Shorts, and Instagram posts/reels
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Single Block Editor ────────────────────────────
function TextBlockEditor({ block, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast, onConvertToEmbed }: {
    block: ContentBlock;
    onUpdate: (data: any) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
    onConvertToEmbed: (url: string) => void;
}) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5] } }),
            Underline,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            LinkExt.configure({ openOnClick: false }),
            ImageExt.configure({ inline: true }),
            Placeholder.configure({ placeholder: "Type '/' for commands, or just start writing..." }),
        ],
        content: block.data.text || block.data.html || "",
        onUpdate: ({ editor }) => {
            // Check if the entire content is just an embed URL
            const text = editor.getText().trim();
            if (text && isEmbedUrl(text) && editor.getText().length === text.length) {
                // Auto-convert: replace this text block with an embed block
                onConvertToEmbed(text);
                return;
            }
            onUpdate({ ...block.data, text: editor.getHTML() });
        },
    });

    const addLink = useCallback(() => {
        if (!editor) return;
        const url = prompt("Enter URL:", editor.getAttributes("link").href || "");
        if (url === null) return;
        if (url === "") { editor.chain().focus().unsetLink().run(); return; }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    if (!editor) return null;

    return (
        <div className={styles.blockWrapper}>
            {/* Block handle & controls */}
            <div className={styles.blockSide}>
                <button className={styles.dragHandle} title="Drag to reorder">
                    <GripVertical size={16} />
                </button>
                <div className={styles.moveButtons}>
                    <button onClick={onMoveUp} disabled={isFirst} title="Move up"><ArrowUp size={12} /></button>
                    <button onClick={onMoveDown} disabled={isLast} title="Move down"><ArrowDown size={12} /></button>
                </div>
            </div>

            <div className={styles.blockBody}>
                {/* Per-block toolbar */}
                <div className={styles.blockToolbar}>
                    <div className={styles.toolbarSection}>
                        <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive("paragraph") ? styles.active : ""} title="Normal text"><Pilcrow size={15} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive("heading", { level: 1 }) ? styles.active : ""} title="Heading 1"><Heading1 size={15} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive("heading", { level: 2 }) ? styles.active : ""} title="Heading 2"><Heading2 size={15} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive("heading", { level: 3 }) ? styles.active : ""} title="Heading 3"><Heading3 size={15} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={editor.isActive("heading", { level: 4 }) ? styles.active : ""} title="Heading 4"><Heading4 size={15} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} className={editor.isActive("heading", { level: 5 }) ? styles.active : ""} title="Heading 5"><Heading5 size={15} /></button>
                    </div>
                    <span className={styles.toolbarDivider} />
                    <div className={styles.toolbarSection}>
                        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? styles.active : ""} title="Bold"><Bold size={15} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? styles.active : ""} title="Italic"><Italic size={15} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive("underline") ? styles.active : ""} title="Underline"><UnderlineIcon size={15} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive("strike") ? styles.active : ""} title="Strikethrough"><Strikethrough size={15} /></button>
                    </div>
                    <span className={styles.toolbarDivider} />
                    <div className={styles.toolbarSection}>
                        <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={editor.isActive({ textAlign: "left" }) ? styles.active : ""} title="Left"><AlignLeft size={15} /></button>
                        <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={editor.isActive({ textAlign: "center" }) ? styles.active : ""} title="Center"><AlignCenter size={15} /></button>
                        <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={editor.isActive({ textAlign: "right" }) ? styles.active : ""} title="Right"><AlignRight size={15} /></button>
                    </div>
                    <span className={styles.toolbarDivider} />
                    <div className={styles.toolbarSection}>
                        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? styles.active : ""} title="Bullet list"><List size={15} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive("orderedList") ? styles.active : ""} title="Numbered list"><ListOrdered size={15} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive("blockquote") ? styles.active : ""} title="Quote"><Quote size={15} /></button>
                    </div>
                    <span className={styles.toolbarDivider} />
                    <div className={styles.toolbarSection}>
                        <button type="button" onClick={addLink} className={editor.isActive("link") ? styles.active : ""} title="Link"><LinkIcon size={15} /></button>
                    </div>

                    <button className={styles.deleteBtn} onClick={onDelete} title="Delete block"><Trash2 size={14} /></button>
                </div>

                {/* Editor area */}
                <EditorContent editor={editor} className={styles.textEditor} />
            </div>
        </div>
    );
}

// ─── Image Block ────────────────────────────────────
function ImageBlockEditor({ block, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
    block: ContentBlock;
    onUpdate: (data: any) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const result = await mediaService.uploadMedia(file, "uploads");
            onUpdate({ ...block.data, url: result.url });
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.blockWrapper}>
            <div className={styles.blockSide}>
                <button className={styles.dragHandle} title="Drag to reorder"><GripVertical size={16} /></button>
                <div className={styles.moveButtons}>
                    <button onClick={onMoveUp} disabled={isFirst} title="Move up"><ArrowUp size={12} /></button>
                    <button onClick={onMoveDown} disabled={isLast} title="Move down"><ArrowDown size={12} /></button>
                </div>
            </div>
            <div className={styles.blockBody}>
                <div className={styles.blockToolbar}>
                    <span className={styles.blockLabel}>IMAGE</span>
                    <button className={styles.deleteBtn} onClick={onDelete} title="Delete block"><Trash2 size={14} /></button>
                </div>

                <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }}
                    onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); e.target.value = ""; }} />

                {block.data.url ? (
                    <div className={styles.imagePreview}>
                        <img src={block.data.url} alt={block.data.caption || ""} />
                        <div className={styles.imageActions}>
                            <button onClick={() => fileInputRef.current?.click()}>Replace</button>
                            <button onClick={() => onUpdate({ ...block.data, url: "" })}>Remove</button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.imageUploadZone} onClick={() => fileInputRef.current?.click()}>
                        {uploading ? (
                            <p>Uploading...</p>
                        ) : (
                            <>
                                <Upload size={32} />
                                <p>Click to upload or drag an image</p>
                                <span>JPG, PNG, GIF, WebP</span>
                            </>
                        )}
                    </div>
                )}

                <input
                    type="text"
                    className={styles.captionInput}
                    placeholder="Write a caption..."
                    value={block.data.caption || ""}
                    onChange={(e) => onUpdate({ ...block.data, caption: e.target.value })}
                />
            </div>
        </div>
    );
}

// ─── Divider Block ──────────────────────────────────
function DividerBlockEditor({ onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}) {
    return (
        <div className={styles.blockWrapper}>
            <div className={styles.blockSide}>
                <button className={styles.dragHandle}><GripVertical size={16} /></button>
                <div className={styles.moveButtons}>
                    <button onClick={onMoveUp} disabled={isFirst}><ArrowUp size={12} /></button>
                    <button onClick={onMoveDown} disabled={isLast}><ArrowDown size={12} /></button>
                </div>
            </div>
            <div className={styles.blockBody}>
                <div className={styles.blockToolbar}>
                    <span className={styles.blockLabel}>DIVIDER</span>
                    <button className={styles.deleteBtn} onClick={onDelete}><Trash2 size={14} /></button>
                </div>
                <hr className={styles.dividerLine} />
            </div>
        </div>
    );
}

// ─── Block Inserter ─────────────────────────────────
function BlockInserter({ onAdd }: { onAdd: (type: ContentBlock['type']) => void }) {
    const [open, setOpen] = useState(false);

    return (
        <div className={styles.inserter}>
            <button className={styles.inserterToggle} onClick={() => setOpen(!open)} title="Add block">
                <Plus size={20} />
            </button>
            {open && (
                <div className={styles.inserterMenu}>
                    <button onClick={() => { onAdd('text'); setOpen(false); }}>
                        <Type size={18} />
                        <div>
                            <strong>Text</strong>
                            <span>Paragraph, heading, list</span>
                        </div>
                    </button>
                    <button onClick={() => { onAdd('image'); setOpen(false); }}>
                        <ImageIcon size={18} />
                        <div>
                            <strong>Image</strong>
                            <span>Upload or embed</span>
                        </div>
                    </button>
                    <button onClick={() => { onAdd('embed'); setOpen(false); }}>
                        <Video size={18} />
                        <div>
                            <strong>Embed</strong>
                            <span>YouTube, Instagram</span>
                        </div>
                    </button>
                    <button onClick={() => { onAdd('divider'); setOpen(false); }}>
                        <DividerIcon size={18} />
                        <div>
                            <strong>Divider</strong>
                            <span>Horizontal separator</span>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Main Block Editor ──────────────────────────────
export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
    const genId = () => Math.random().toString(36).substr(2, 9);

    const addBlock = (type: ContentBlock['type'], afterIndex?: number) => {
        const newBlock: ContentBlock = {
            id: genId(),
            type,
            data: type === 'text' ? { text: "" }
                : type === 'image' ? { url: "", caption: "" }
                    : type === 'embed' ? { embedType: null, embedId: null, originalUrl: "" }
                        : {}
        };
        const next = [...blocks];
        const idx = afterIndex !== undefined ? afterIndex + 1 : next.length;
        next.splice(idx, 0, newBlock);
        onChange(next);
    };

    const updateBlock = (id: string, data: any) => {
        onChange(blocks.map(b => b.id === id ? { ...b, data } : b));
    };

    const removeBlock = (id: string) => {
        onChange(blocks.filter(b => b.id !== id));
    };

    const moveBlock = (index: number, direction: -1 | 1) => {
        const next = [...blocks];
        const target = index + direction;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    // Convert a text block into an embed block when a URL is pasted
    const convertToEmbed = (blockId: string, url: string) => {
        const { type, id } = detectEmbedUrl(url);
        if (!type || !id) return;
        onChange(blocks.map(b => b.id === blockId ? {
            ...b,
            type: 'embed' as const,
            data: { embedType: type, embedId: id, originalUrl: url }
        } : b));
    };

    return (
        <div className={styles.editor}>
            {blocks.length === 0 && (
                <div className={styles.emptyState}>
                    <p>Start building your article</p>
                    <span>Click the + button below to add your first block</span>
                </div>
            )}

            {blocks.map((block, index) => (
                <div key={block.id}>
                    {block.type === 'text' && (
                        <TextBlockEditor
                            block={block}
                            onUpdate={(data) => updateBlock(block.id, data)}
                            onDelete={() => removeBlock(block.id)}
                            onMoveUp={() => moveBlock(index, -1)}
                            onMoveDown={() => moveBlock(index, 1)}
                            isFirst={index === 0}
                            isLast={index === blocks.length - 1}
                            onConvertToEmbed={(url) => convertToEmbed(block.id, url)}
                        />
                    )}
                    {block.type === 'image' && (
                        <ImageBlockEditor
                            block={block}
                            onUpdate={(data) => updateBlock(block.id, data)}
                            onDelete={() => removeBlock(block.id)}
                            onMoveUp={() => moveBlock(index, -1)}
                            onMoveDown={() => moveBlock(index, 1)}
                            isFirst={index === 0}
                            isLast={index === blocks.length - 1}
                        />
                    )}
                    {block.type === 'embed' && (
                        <EmbedBlockEditor
                            block={block}
                            onUpdate={(data) => updateBlock(block.id, data)}
                            onDelete={() => removeBlock(block.id)}
                            onMoveUp={() => moveBlock(index, -1)}
                            onMoveDown={() => moveBlock(index, 1)}
                            isFirst={index === 0}
                            isLast={index === blocks.length - 1}
                        />
                    )}
                    {block.type === 'divider' && (
                        <DividerBlockEditor
                            onDelete={() => removeBlock(block.id)}
                            onMoveUp={() => moveBlock(index, -1)}
                            onMoveDown={() => moveBlock(index, 1)}
                            isFirst={index === 0}
                            isLast={index === blocks.length - 1}
                        />
                    )}

                    {/* Inline inserter between blocks */}
                    <BlockInserter onAdd={(type) => addBlock(type, index)} />
                </div>
            ))}

            {/* Bottom inserter */}
            {blocks.length === 0 && (
                <BlockInserter onAdd={(type) => addBlock(type)} />
            )}
        </div>
    );
}
