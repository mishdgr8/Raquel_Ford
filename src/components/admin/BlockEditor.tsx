"use client";

import { useState, useRef, useCallback } from "react";
import { ContentBlock } from "@/lib/types";
import Image from "next/image";
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
    Type, Image as ImageIcon, Minus as DividerIcon, Upload, Video, Images, X, Columns
} from "lucide-react";
import styles from "./BlockEditor.module.css";
import { mediaService } from "@/lib/services/media";
import { MediaLibraryModal } from "./MediaLibraryModal";
import { Tweet } from "react-tweet";

// ─── Embed Helpers ──────────────────────────────────
function detectEmbedUrl(url: string): { type: 'youtube' | 'instagram' | 'twitter' | 'tiktok' | 'spotify' | null; id: string | null } {
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

    // Twitter / X
    const twMatch = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
    if (twMatch) return { type: 'twitter', id: twMatch[1] };

    // TikTok
    const tkMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
    if (tkMatch) return { type: 'tiktok', id: tkMatch[1] };

    // Spotify
    const spMatch = url.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/);
    if (spMatch) return { type: 'spotify', id: `${spMatch[1]}/${spMatch[2]}` };

    return { type: null, id: null };
}

function isEmbedUrl(text: string): boolean {
    const trimmed = text.trim();
    const { type } = detectEmbedUrl(trimmed);
    return type !== null;
}

// ─── Gallery Block Editor ────────────────────────────
export function GalleryBlockEditor({ block, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
    block: ContentBlock;
    onUpdate: (data: any) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const replaceFileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
    const images: { url: string; alt: string }[] = block.data.images || [];
    const columns: number = block.data.columns || 3;

    const handleUpload = async (files: FileList) => {
        setUploading(true);
        try {
            const uploaded: { url: string; alt: string }[] = [];
            for (const file of Array.from(files)) {
                const result = await mediaService.uploadMedia(file, 'uploads');
                uploaded.push({ url: result.url, alt: file.name.replace(/\.[^.]+$/, '') });
            }
            onUpdate({ ...block.data, images: [...images, ...uploaded] });
        } catch (err) {
            console.error('Gallery upload failed:', err);
            alert('Some images failed to upload');
        } finally {
            setUploading(false);
        }
    };

    const handleReplaceUpload = async (file: File) => {
        if (replaceIndex === null) return;
        setUploading(true);
        try {
            const result = await mediaService.uploadMedia(file, 'uploads');
            const newImage = { url: result.url, alt: file.name.replace(/\.[^.]+$/, '') };
            const next = [...images];
            next[replaceIndex] = newImage;
            onUpdate({ ...block.data, images: next });
        } catch (err) {
            console.error('Image replace upload failed:', err);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
            setReplaceIndex(null);
        }
    };

    const removeImage = (index: number) => {
        const next = images.filter((_, i) => i !== index);
        onUpdate({ ...block.data, images: next });
    };

    const moveImage = (from: number, to: number) => {
        if (to < 0 || to >= images.length) return;
        const next = [...images];
        [next[from], next[to]] = [next[to], next[from]];
        onUpdate({ ...block.data, images: next });
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
                    <span className={styles.blockLabel}>🖼 GALLERY</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', marginRight: '0.5rem' }}>
                        <Columns size={14} style={{ color: '#64748b' }} />
                        <select
                            value={columns}
                            onChange={(e) => onUpdate({ ...block.data, columns: parseInt(e.target.value) })}
                            style={{
                                padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: '4px',
                                fontSize: '0.8rem', background: 'white', cursor: 'pointer',
                            }}
                        >
                            <option value={2}>2 cols</option>
                            <option value={3}>3 cols</option>
                            <option value={4}>4 cols</option>
                        </select>
                    </div>
                    <button className={styles.deleteBtn} onClick={onDelete} title="Delete block"><Trash2 size={14} /></button>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) handleUpload(e.target.files);
                        e.target.value = '';
                    }}
                />

                <input
                    type="file"
                    ref={replaceFileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        if (e.target.files?.[0]) handleReplaceUpload(e.target.files[0]);
                        e.target.value = '';
                    }}
                />

                <MediaLibraryModal
                    isOpen={showLibrary}
                    onClose={() => {
                        setShowLibrary(false);
                        if (replaceIndex !== null) setReplaceIndex(null);
                    }}
                    onSelect={(url) => {
                        if (replaceIndex !== null) {
                            const next = [...images];
                            next[replaceIndex] = { url, alt: '' };
                            onUpdate({ ...block.data, images: next });
                            setReplaceIndex(null);
                        }
                    }}
                    onSelectMultiple={(urls) => {
                        if (replaceIndex === null) {
                            const newImages = urls.map(url => ({ url, alt: '' }));
                            onUpdate({ ...block.data, images: [...images, ...newImages] });
                        }
                    }}
                    multiSelect={replaceIndex === null}
                    title={replaceIndex !== null ? "Replace Image" : "Add to Gallery"}
                />

                {images.length > 0 && (
                    <div style={{
                        columnCount: Math.min(columns, 4),
                        columnGap: '0.5rem',
                        padding: '0.75rem 1rem',
                    }}>
                        {images.map((img, i) => (
                            <div key={i} className={styles.galleryImageContainer} style={{ breakInside: 'avoid', marginBottom: '0.5rem' }}>
                                <Image
                                    src={img.url}
                                    alt={img.alt || ""}
                                    width={0}
                                    height={0}
                                    className={styles.galleryImage}
                                    sizes="(max-width: 768px) 50vw, 200px"
                                />
                                <div style={{
                                    position: 'absolute', top: 0, right: 0,
                                    display: 'flex', gap: '2px', padding: '4px',
                                    zIndex: 10,
                                }}>
                                    {i > 0 && (
                                        <button
                                            onClick={() => moveImage(i, i - 1)}
                                            style={{
                                                width: '22px', height: '22px', borderRadius: '50%',
                                                background: 'rgba(0,0,0,0.6)', color: 'white',
                                                border: 'none', cursor: 'pointer', fontSize: '0.7rem',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                            title="Move left"
                                        >←</button>
                                    )}
                                    {i < images.length - 1 && (
                                        <button
                                            onClick={() => moveImage(i, i + 1)}
                                            style={{
                                                width: '22px', height: '22px', borderRadius: '50%',
                                                background: 'rgba(0,0,0,0.6)', color: 'white',
                                                border: 'none', cursor: 'pointer', fontSize: '0.7rem',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                            title="Move right"
                                        >→</button>
                                    )}
                                    <div style={{ position: 'relative', display: 'flex' }}
                                        onMouseEnter={(e) => {
                                            const menu = e.currentTarget.querySelector('.replaceMenu') as HTMLElement;
                                            if (menu) menu.style.display = 'flex';
                                        }}
                                        onMouseLeave={(e) => {
                                            const menu = e.currentTarget.querySelector('.replaceMenu') as HTMLElement;
                                            if (menu) menu.style.display = 'none';
                                        }}
                                    >
                                        <button
                                            style={{
                                                width: '22px', height: '22px', borderRadius: '50%',
                                                background: 'rgba(59, 130, 246, 0.85)', color: 'white',
                                                border: 'none', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                marginRight: '2px'
                                            }}
                                            title="Replace image"
                                        ><Upload size={10} /></button>
                                        <div className="replaceMenu" style={{
                                            display: 'none', position: 'absolute', top: '100%', right: 0,
                                            background: 'white', borderRadius: '6px', padding: '4px',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 20, flexDirection: 'column',
                                            gap: '2px', minWidth: '100px'
                                        }}>
                                            <button onClick={() => { setReplaceIndex(i); setShowLibrary(true); }} style={{ padding: '4px 8px', fontSize: '0.7rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Images size={10} /> Library</button>
                                            <button onClick={() => { setReplaceIndex(i); replaceFileInputRef.current?.click(); }} style={{ padding: '4px 8px', fontSize: '0.7rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Upload size={10} /> Upload</button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeImage(i)}
                                        style={{
                                            width: '22px', height: '22px', borderRadius: '50%',
                                            background: 'rgba(220,38,38,0.85)', color: 'white',
                                            border: 'none', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                        title="Remove image"
                                    ><X size={12} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div
                    style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: '0.5rem', padding: '1.5rem', margin: '0.5rem 1rem 1rem',
                        border: '2px dashed #cbd5e1', borderRadius: '8px',
                        background: '#fafbfc', color: '#64748b', cursor: 'pointer',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {uploading ? (
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Uploading...</p>
                    ) : (
                        <>
                            <Upload size={28} />
                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>
                                {images.length > 0 ? 'Add more images' : 'Click to upload images'}
                            </p>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                Select multiple files at once · JPG, PNG, GIF, WebP
                            </span>
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowLibrary(true); }}
                                    style={{
                                        padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0',
                                        background: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        fontSize: '0.8rem', fontWeight: 600, color: '#334155'
                                    }}
                                >
                                    <Images size={14} /> From Library
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
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
                        {embedType === 'youtube' ? '▶ YOUTUBE' :
                            embedType === 'instagram' ? '📷 INSTAGRAM' :
                                embedType === 'twitter' ? '🐦 X / TWITTER' :
                                    embedType === 'tiktok' ? '🎵 TIKTOK' :
                                        embedType === 'spotify' ? '🎧 SPOTIFY' : '🔗 EMBED'}
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
                        {embedType === 'spotify' && (
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <iframe
                                    src={`https://open.spotify.com/embed/${embedId}`}
                                    width="100%"
                                    height="152"
                                    frameBorder="0"
                                    allowFullScreen
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                    title="Spotify embed"
                                    style={{ borderRadius: '12px' }}
                                />
                            </div>
                        )}
                        {embedType === 'twitter' && (
                            <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0', width: '100%' }}>
                                <div className="light" style={{ width: '100%', maxWidth: '550px' }}>
                                    <Tweet id={embedId} />
                                </div>
                            </div>
                        )}
                        {embedType === 'tiktok' && (
                            <div style={{ textAlign: 'center', margin: '1rem auto', padding: '2rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                                🎵 <strong>TikTok Embed</strong><br />
                                The video will be rendered dynamically via TikTok's widget on the public page.<br />
                                <a href={block.data.originalUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#3b82f6' }}>{block.data.originalUrl}</a>
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
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                            Supports YouTube, Instagram, X/Twitter, TikTok, and Spotify URLs.<br />
                            Try pasting an Embed link in a Text block—it'll auto-convert!
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
    const [showLibrary, setShowLibrary] = useState(false);

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

                <MediaLibraryModal
                    isOpen={showLibrary}
                    onClose={() => setShowLibrary(false)}
                    onSelect={(url) => onUpdate({ ...block.data, url })}
                    title="Select Image"
                />

                {block.data.url ? (
                    <div className={styles.imagePreview}>
                        <Image
                            src={block.data.url}
                            alt={block.data.caption || ""}
                            fill
                            className={styles.imagePreviewImage}
                            sizes="(max-width: 1024px) 100vw, 800px"
                        />
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
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowLibrary(true); }}
                                        style={{
                                            padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0',
                                            background: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                            fontSize: '0.8rem', fontWeight: 600, color: '#334155'
                                        }}
                                    >
                                        <Images size={14} /> From Library
                                    </button>
                                </div>
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
                    <button onClick={() => { onAdd('gallery'); setOpen(false); }}>
                        <Images size={18} />
                        <div>
                            <strong>Gallery</strong>
                            <span>Multiple images in a grid</span>
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
                        : type === 'gallery' ? { images: [], columns: 3 }
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
                    {block.type === 'gallery' && (
                        <GalleryBlockEditor
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
