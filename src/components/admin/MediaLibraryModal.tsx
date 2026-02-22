"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Search, Check, Loader2, Upload } from "lucide-react";
import { mediaService } from "@/lib/services/media";
import { Media } from "@/lib/types";
import styles from "./MediaLibraryModal.module.css";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface MediaLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect?: (url: string) => void;
    onSelectMultiple?: (urls: string[]) => void;
    title?: string;
    multiSelect?: boolean;
}

export function MediaLibraryModal({ isOpen, onClose, onSelect, onSelectMultiple, title = "Media Library", multiSelect = false }: MediaLibraryModalProps) {
    const [media, setMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
    const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setSelectedUrl(null);
            setSelectedUrls([]);
            mediaService.getMedia().then(items => {
                setMedia(items);
                setLoading(false);
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredMedia = media.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.altText?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleConfirm = () => {
        if (multiSelect && onSelectMultiple) {
            if (selectedUrls.length > 0) {
                onSelectMultiple(selectedUrls);
                onClose();
            }
        } else if (onSelect && selectedUrl) {
            onSelect(selectedUrl);
            onClose();
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadedItems: Media[] = [];

            // Allow multiple uploads if multiSelect is true
            const filesArray = multiSelect ? Array.from(files) : [files[0]];

            for (const file of filesArray) {
                const result = await mediaService.uploadMedia(file, "library");
                const newMediaItem: Media = {
                    id: result.id,
                    url: result.url,
                    path: result.path,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    extension: file.name.split('.').pop() || '',
                    createdAt: new Date().toISOString()
                };
                uploadedItems.push(newMediaItem);
            }

            setMedia(prev => [...uploadedItems, ...prev]);

            if (multiSelect) {
                // Auto-select all newly uploaded items
                setSelectedUrls(prev => [...prev, ...uploadedItems.map(item => item.url)]);
            } else {
                setSelectedUrl(uploadedItems[0].url);
            }
        } catch (err) {
            console.error("Upload failed in modal:", err);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2>{title}</h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </header>

                <div className={styles.toolbar}>
                    <div className={styles.searchWrapper}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search images..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple={true}
                        style={{ display: "none" }}
                        onChange={handleUpload}
                    />
                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {uploading ? <Loader2 size={16} className={styles.spinner} /> : <Upload size={16} />}
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.empty}>
                            <Loader2 size={32} className={styles.spinner} />
                            <p>Loading library...</p>
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className={styles.empty}>
                            <p>No images found.</p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {filteredMedia.map((item) => {
                                const isSelected = multiSelect
                                    ? selectedUrls.includes(item.url)
                                    : selectedUrl === item.url;

                                return (
                                    <div
                                        key={item.id}
                                        className={`${styles.item} ${isSelected ? styles.selected : ""}`}
                                        onClick={() => {
                                            if (multiSelect) {
                                                setSelectedUrls(prev =>
                                                    prev.includes(item.url)
                                                        ? prev.filter(u => u !== item.url)
                                                        : [...prev, item.url]
                                                );
                                            } else {
                                                setSelectedUrl(item.url);
                                            }
                                        }}
                                        onDoubleClick={() => {
                                            if (!multiSelect && onSelect) {
                                                onSelect(item.url);
                                                onClose();
                                            }
                                        }}
                                    >
                                        <div className={styles.imageWrapper}>
                                            <Image
                                                src={item.url}
                                                alt={item.altText || item.name}
                                                fill
                                                className={styles.image}
                                                sizes="200px"
                                            />
                                            {isSelected && (
                                                <div className={styles.checkOverlay}>
                                                    <Check size={24} color="white" />
                                                </div>
                                            )}
                                        </div>
                                        <span className={styles.itemName} title={item.name}>{item.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <footer className={styles.footer}>
                    <div className={styles.footerInfo}>
                        {multiSelect
                            ? (selectedUrls.length > 0 ? `${selectedUrls.length} images selected` : "Select images")
                            : (selectedUrl ? "1 image selected" : "Select an image")
                        }
                    </div>
                    <div className={styles.footerActions}>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={multiSelect ? selectedUrls.length === 0 : !selectedUrl}
                            style={{ backgroundColor: 'black', color: 'white' }}
                        >
                            {multiSelect ? 'Insert Selected' : 'Insert Image'}
                        </Button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
