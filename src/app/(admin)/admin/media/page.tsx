"use client";

import { useEffect, useState } from "react";
import { mediaService } from "@/lib/services/media";
import { Media } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Upload, Trash2, Copy, Check, CheckSquare } from "lucide-react";
import styles from "./MediaLibrary.module.css";

export default function MediaLibraryPage() {
    const [media, setMedia] = useState<Media[]>([]);
    const [uploading, setUploading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        mediaService.getMedia().then(setMedia);
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = Array.from(files).map(file => mediaService.uploadMedia(file));
            await Promise.all(uploadPromises);
            const updatedMedia = await mediaService.getMedia();
            setMedia(updatedMedia);
        } catch (err) {
            console.error("Batch upload failed:", err);
            alert("Some files failed to upload. Please try again.");
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input so same files can be uploaded again if needed
        }
    };

    const handleDelete = async (item: Media) => {
        if (confirm("Permanently delete this media?")) {
            await mediaService.deleteMedia(item.id!, item.path);
            setMedia(media.filter(m => m.id !== item.id));
        }
    };

    const copyUrl = (url: string, id: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === media.length && media.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(media.map(m => m.id!)));
        }
    };

    const handleBulkDelete = async () => {
        setIsBulkDeleting(true);
        try {
            const itemsToDelete = media.filter(m => m.id && selectedIds.has(m.id)).map(m => ({ id: m.id!, path: m.path }));
            await mediaService.bulkDeleteMedia(itemsToDelete);
            setMedia(media.filter(m => !m.id || !selectedIds.has(m.id)));
            setSelectedIds(new Set());
            setShowConfirmModal(false);
        } catch (err) {
            console.error("Failed to bulk delete media:", err);
            alert("Failed to delete selected media items.");
        } finally {
            setIsBulkDeleting(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Media Library</h1>
                <label className={styles.uploadBtn}>
                    <Upload size={18} />
                    <span>{uploading ? "Uploading..." : "Upload File"}</span>
                    <input type="file" multiple hidden onChange={handleUpload} disabled={uploading} />
                </label>
            </header>

            {media.length > 0 && (
                <div className={styles.selectAllWrapper}>
                    <input
                        type="checkbox"
                        id="selectAll"
                        checked={selectedIds.size === media.length && media.length > 0}
                        onChange={toggleSelectAll}
                    />
                    <label htmlFor="selectAll">Select All</label>
                </div>
            )}

            {selectedIds.size > 0 && (
                <div className={styles.bulkBarContainer}>
                    <div className={styles.bulkBar}>
                        <span className={styles.bulkCount}>
                            <CheckSquare size={16} />
                            {selectedIds.size} selected
                        </span>
                        <Button
                            variant="primary"
                            onClick={() => setShowConfirmModal(true)}
                            disabled={isBulkDeleting}
                            style={{ backgroundColor: '#dc2626' }}
                        >
                            {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedIds(new Set())}
                            style={{ color: '#64748b' }}
                        >
                            Clear selection
                        </Button>
                    </div>
                </div>
            )}

            <div className={styles.grid}>
                {media.map((item) => (
                    <div key={item.id} className={`${styles.card} ${selectedIds.has(item.id!) ? styles.selectedCard : ''}`}>
                        <div className={styles.preview}>
                            <div className={styles.checkboxWrapper}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(item.id!)}
                                    onChange={() => toggleSelect(item.id!)}
                                />
                            </div>
                            {item.type.startsWith("image") ? (
                                <Image
                                    src={item.url}
                                    alt={item.altText || ""}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 200px"
                                    className={styles.image}
                                />
                            ) : (
                                <div className={styles.fileIcon}>📄</div>
                            )}
                        </div>
                        <div className={styles.details}>
                            <span className={styles.name}>{item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}</span>
                            <div className={styles.actions}>
                                <button onClick={() => copyUrl(item.url, item.id!)}>
                                    {copiedId === item.id ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                                </button>
                                <button onClick={() => handleDelete(item)} className={styles.delete}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Confirm Bulk Deletion"
            >
                <div style={{ padding: '1rem 0' }}>
                    <p style={{ marginBottom: '1.5rem', color: '#475569' }}>
                        Are you sure you want to permanently delete {selectedIds.size} selected media item(s)? This cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isBulkDeleting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBulkDelete}
                            disabled={isBulkDeleting}
                            style={{ backgroundColor: '#dc2626' }}
                        >
                            {isBulkDeleting ? 'Deleting...' : 'Delete Permanently'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
