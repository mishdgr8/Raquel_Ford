import {
    collection,
    getDocs,
    doc,
    addDoc,
    deleteDoc,
    updateDoc,
    query,
    orderBy,
    serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { Media } from "../types";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dowyjfruh";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

const MEDIA_COLLECTION = "media";

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

export const mediaService = {
    async getMedia() {
        const q = query(collection(db, MEDIA_COLLECTION), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Media));
    },

    async uploadMedia(
        file: File,
        folder: string = "uploads",
        meta: { altText?: string; title?: string; caption?: string; description?: string } = {}
    ) {
        try {
            console.log(`Starting Cloudinary upload for ${file.name}...`);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);
            formData.append('folder', folder);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Cloudinary upload failed');
            }

            const data = await response.json();
            const url = data.secure_url;
            const path = data.public_id;

            console.log("Cloudinary upload success, saving to Firestore...");

            // 2. Save metadata to Firestore
            const baseName = file.name.replace(/\.[^/.]+$/, "");
            const docRef = await addDoc(collection(db, MEDIA_COLLECTION), {
                url,
                path,
                name: file.name,
                fileName: file.name,
                type: file.type,
                size: file.size,
                extension: file.name.split('.').pop() || "",
                altText: meta.altText || "",
                title: meta.title || baseName,
                caption: meta.caption || "",
                description: meta.description || "",
                slug: slugify(baseName),
                createdAt: serverTimestamp(),
            });

            console.log("Firestore metadata saved successfully.");
            return { id: docRef.id, url, path };
        } catch (error: any) {
            console.error("Upload failed in mediaService:", {
                message: error.message,
                fullError: error
            });
            throw error;
        }
    },

    async updateMediaMeta(id: string, meta: Partial<Pick<Media, 'altText' | 'title' | 'caption' | 'description'>>) {
        const docRef = doc(db, MEDIA_COLLECTION, id);
        await updateDoc(docRef, { ...meta });
    },

    async deleteMedia(id: string, path: string) {
        // Note: For full deletion from Cloudinary, we'd need a signed request.
        // For now, we delete from Firestore to hide it from the UI.
        const docRef = doc(db, MEDIA_COLLECTION, id);
        await deleteDoc(docRef);
    },

    async bulkDeleteMedia(items: Pick<Media, 'id' | 'path'>[]) {
        const promises = items.map(async (item) => {
            if (item.id && item.path) {
                return this.deleteMedia(item.id, item.path);
            }
        });
        await Promise.all(promises);
    }
};

