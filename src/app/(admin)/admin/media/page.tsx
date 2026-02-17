"use client";

import { useEffect, useState } from "react";
import { mediaService } from "@/lib/services/media";
import { Media } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { Upload, Trash2, Copy, Check } from "lucide-react";
import styles from "./MediaLibrary.module.css";

export default function MediaLibraryPage() {
    const [media, setMedia] = useState<Media[]>([]);
    const [uploading, setUploading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        mediaService.getMedia().then(setMedia);
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await mediaService.uploadMedia(file);
            mediaService.getMedia().then(setMedia);
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
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

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Media Library</h1>
                <label className={styles.uploadBtn}>
                    <Upload size={18} />
                    <span>{uploading ? "Uploading..." : "Upload File"}</span>
                    <input type="file" hidden onChange={handleUpload} disabled={uploading} />
                </label>
            </header>

            <div className={styles.grid}>
                {media.map((item) => (
                    <div key={item.id} className={styles.card}>
                        <div className={styles.preview}>
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
        </div>
    );
}
