import {
    collection,
    getDocs,
    doc,
    addDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase";
import { Media } from "../types";

const MEDIA_COLLECTION = "media";

export const mediaService = {
    async getMedia() {
        const q = query(collection(db, MEDIA_COLLECTION), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Media));
    },

    async uploadMedia(file: File, folder: string = "uploads", altText: string = "") {
        // 1. Upload to Storage
        const path = `${folder}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);

        // 2. Save metadata to Firestore
        const docRef = await addDoc(collection(db, MEDIA_COLLECTION), {
            url,
            path,
            name: file.name,
            type: file.type,
            size: file.size,
            extension: file.name.split('.').pop() || "",
            altText,
            createdAt: serverTimestamp(),
        });

        return { id: docRef.id, url, path };
    },

    async deleteMedia(id: string, path: string) {
        // 1. Delete from Storage
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);

        // 2. Delete from Firestore
        const docRef = doc(db, MEDIA_COLLECTION, id);
        await deleteDoc(docRef);
    }
};
