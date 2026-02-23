import {
    collection,
    getDocs,
    doc,
    addDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    limit,
    serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { Tag } from "../types";
import { slugify } from "../utils";

const TAGS_COLLECTION = "tags";

export const tagService = {
    async getTags() {
        const q = query(collection(db, TAGS_COLLECTION), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tag));
    },

    async getTagBySlug(slug: string) {
        const q = query(collection(db, TAGS_COLLECTION), where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Tag;
    },

    async createTag(name: string) {
        const slug = slugify(name);

        // Check if tag already exists
        const q = query(collection(db, TAGS_COLLECTION), where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Tag;
        }

        const docRef = await addDoc(collection(db, TAGS_COLLECTION), {
            name,
            slug,
            createdAt: serverTimestamp(),
        });

        return { id: docRef.id, name, slug } as Tag;
    },

    async deleteTag(id: string) {
        const docRef = doc(db, TAGS_COLLECTION, id);
        await deleteDoc(docRef);
    }
};
