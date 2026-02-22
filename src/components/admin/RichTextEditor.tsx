"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useRef, useState } from "react";
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, Heading3,
    List, ListOrdered, Quote,
    Link as LinkIcon, Image as ImageIcon,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Undo2, Redo2, Minus,
    Video, Instagram, GalleryHorizontalEnd, MessageSquareQuote
} from "lucide-react";
import styles from "./RichTextEditor.module.css";
import { mediaService } from "@/lib/services/media";
import { StyledQuote } from "./extensions/StyledQuote";
import { SecureEmbed } from "./extensions/SecureEmbed";
import { ImageGallery } from "./extensions/ImageGallery";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5] },
                blockquote: false, // We use StyledQuote instead
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: { class: styles.inlineImage },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: styles.link },
            }),
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Placeholder.configure({
                placeholder: placeholder || "Start writing your story...",
            }),
            StyledQuote,
            SecureEmbed,
            ImageGallery,
        ],
        content: value || "",
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: styles.editor,
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer?.files?.length) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith("image/")) {
                        event.preventDefault();
                        handleImageUpload(file);
                        return true;
                    }
                }
                return false;
            },
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items;
                if (items) {
                    for (const item of items) {
                        if (item.type.startsWith("image/")) {
                            event.preventDefault();
                            const file = item.getAsFile();
                            if (file) handleImageUpload(file);
                            return true;
                        }
                    }
                }
                return false;
            },
        },
    });

    const handleImageUpload = useCallback(async (file: File) => {
        if (!editor) return;
        try {
            const result = await mediaService.uploadMedia(file, "uploads");
            editor.chain().focus().setImage({ src: result.url }).run();
        } catch (err) {
            console.error("Image upload failed:", err);
            alert("Failed to upload image. Please try again.");
        }
    }, [editor]);

    const addImage = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        try {
            await Promise.all(files.map(file => handleImageUpload(file)));
        } finally {
            e.target.value = "";
        }
    }, [handleImageUpload]);

    const addImageByUrl = useCallback(() => {
        const url = prompt("Enter image URL:");
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const addLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes("link").href;
        const url = prompt("Enter URL:", previousUrl);
        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    if (!editor) return null;

    const handleQuote = () => {
        const author = prompt("Quote author (optional):");
        if (author === null) return;
        const authorTitle = prompt("Author title / source (optional):") || '';
        editor.chain().focus().setStyledQuote({ author, authorTitle }).run();
    };

    const handleEmbed = () => {
        const url = prompt("Paste YouTube or Instagram URL:");
        if (!url) return;
        const success = editor.chain().focus().setEmbed({ url }).run();
        if (!success) {
            alert("Could not detect embed type. Please use a valid YouTube or Instagram URL.");
        }
    };

    const handleGallery = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        input.onchange = async (e: any) => {
            const files = Array.from(e.target.files || []) as File[];
            if (files.length === 0) return;
            try {
                const uploaded = await Promise.all(
                    files.map(f => mediaService.uploadMedia(f, 'gallery'))
                );
                const images = uploaded.map((u, i) => ({ url: u.url, alt: files[i].name }));
                editor.chain().focus().setGallery({ images }).run();
            } catch (err) {
                console.error('Gallery upload failed:', err);
                alert('Failed to upload gallery images.');
            }
        };
        input.click();
    };

    const ToolbarButton = ({ onClick, isActive, title, children }: {
        onClick: () => void;
        isActive?: boolean;
        title: string;
        children: React.ReactNode;
    }) => (
        <button
            type="button"
            onClick={onClick}
            className={`${styles.toolbarBtn} ${isActive ? styles.active : ""}`}
            title={title}
        >
            {children}
        </button>
    );

    return (
        <div className={styles.container}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                style={{ display: "none" }}
            />

            {/* Fixed Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarGroup}>
                    <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                        <Undo2 size={16} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                        <Redo2 size={16} />
                    </ToolbarButton>
                </div>

                <div className={styles.divider} />

                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive("heading", { level: 1 })}
                        title="Heading 1"
                    >
                        <Heading1 size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive("heading", { level: 2 })}
                        title="Heading 2"
                    >
                        <Heading2 size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive("heading", { level: 3 })}
                        title="Heading 3"
                    >
                        <Heading3 size={16} />
                    </ToolbarButton>
                </div>

                <div className={styles.divider} />

                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive("bold")}
                        title="Bold"
                    >
                        <Bold size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive("italic")}
                        title="Italic"
                    >
                        <Italic size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive("underline")}
                        title="Underline"
                    >
                        <UnderlineIcon size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive("strike")}
                        title="Strikethrough"
                    >
                        <Strikethrough size={16} />
                    </ToolbarButton>
                </div>

                <div className={styles.divider} />

                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("left").run()}
                        isActive={editor.isActive({ textAlign: "left" })}
                        title="Align Left"
                    >
                        <AlignLeft size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("center").run()}
                        isActive={editor.isActive({ textAlign: "center" })}
                        title="Align Center"
                    >
                        <AlignCenter size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("right").run()}
                        isActive={editor.isActive({ textAlign: "right" })}
                        title="Align Right"
                    >
                        <AlignRight size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                        isActive={editor.isActive({ textAlign: "justify" })}
                        title="Justify"
                    >
                        <AlignJustify size={16} />
                    </ToolbarButton>
                </div>

                <div className={styles.divider} />

                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive("bulletList")}
                        title="Bullet List"
                    >
                        <List size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive("orderedList")}
                        title="Numbered List"
                    >
                        <ListOrdered size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive("blockquote")}
                        title="Simple Quote"
                    >
                        <Quote size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={handleQuote}
                        isActive={editor.isActive("styledQuote")}
                        title="Styled Quote Block"
                    >
                        <MessageSquareQuote size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Divider"
                    >
                        <Minus size={16} />
                    </ToolbarButton>
                </div>

                <div className={styles.divider} />

                <div className={styles.toolbarGroup}>
                    <ToolbarButton onClick={addLink} isActive={editor.isActive("link")} title="Add Link">
                        <LinkIcon size={16} />
                    </ToolbarButton>
                    <ToolbarButton onClick={addImage} title="Upload Image">
                        <ImageIcon size={16} />
                    </ToolbarButton>
                    <ToolbarButton onClick={handleEmbed} title="Embed YouTube/Instagram">
                        <Video size={16} />
                    </ToolbarButton>
                    <ToolbarButton onClick={handleGallery} title="Image Gallery">
                        <GalleryHorizontalEnd size={16} />
                    </ToolbarButton>
                </div>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} className={styles.editorWrap} />
        </div>
    );
}
