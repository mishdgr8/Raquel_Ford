"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Search, Check, Loader2 } from "lucide-react";
import { mediaService } from "@/lib/services/media";
import { Media } from "@/lib/types";
import styles from "./MediaLibraryModal.module.css";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface MediaLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    title?: string;
}

export function MediaLibraryModal({ isOpen, onClose, onSelect, title = "Media Library" }: MediaLibraryModalProps) {
    const [media, setMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
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
        if (selectedUrl) {
            onSelect(selectedUrl);
            onClose();
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
                            {filteredMedia.map((item) => (
                                <div
                                    key={item.id}
                                    className={`${styles.item} ${selectedUrl === item.url ? styles.selected : ""}`}
                                    onClick={() => setSelectedUrl(item.url)}
                                    onDoubleClick={() => {
                                        onSelect(item.url);
                                        onClose();
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
                                        {selectedUrl === item.url && (
                                            <div className={styles.checkOverlay}>
                                                <Check size={24} color="white" />
                                            </div>
                                        )}
                                    </div>
                                    <span className={styles.itemName} title={item.name}>{item.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <footer className={styles.footer}>
                    <div className={styles.footerInfo}>
                        {selectedUrl ? "1 image selected" : "Select an image"}
                    </div>
                    <div className={styles.footerActions}>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!selectedUrl}
                            style={{ backgroundColor: 'black', color: 'white' }}
                        >
                            Insert Image
                        </Button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
