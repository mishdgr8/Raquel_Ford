"use client";

import { useState, useRef, useEffect } from "react";
import {
    Bold,
    Italic,
    Underline,
    Link as LinkIcon,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered
} from "lucide-react";
import styles from "./RichTextEditor.module.css";
import clsx from "clsx";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, []);

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const addLink = () => {
        const url = prompt("Enter URL:");
        if (url) execCommand("createLink", url);
    };

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <button type="button" onClick={() => execCommand("formatBlock", "H1")} title="Heading 1"><Heading1 size={18} /></button>
                <button type="button" onClick={() => execCommand("formatBlock", "H2")} title="Heading 2"><Heading2 size={18} /></button>
                <button type="button" onClick={() => execCommand("formatBlock", "H3")} title="Heading 3"><Heading3 size={18} /></button>
                <div className={styles.divider} />
                <button type="button" onClick={() => execCommand("bold")} title="Bold"><Bold size={18} /></button>
                <button type="button" onClick={() => execCommand("italic")} title="Italic"><Italic size={18} /></button>
                <button type="button" onClick={() => execCommand("underline")} title="Underline"><Underline size={18} /></button>
                <div className={styles.divider} />
                <button type="button" onClick={() => execCommand("insertUnorderedList")} title="Bullet List"><List size={18} /></button>
                <button type="button" onClick={() => execCommand("insertOrderedList")} title="Numbered List"><ListOrdered size={18} /></button>
                <button type="button" onClick={addLink} title="Add Link"><LinkIcon size={18} /></button>
            </div>
            <div
                ref={editorRef}
                className={styles.editor}
                contentEditable
                onInput={handleInput}
                data-placeholder={placeholder}
            />
        </div>
    );
}
