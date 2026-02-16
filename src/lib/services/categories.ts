import {
    collection,
    getDocs,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where
} from "firebase/firestore";
import { db } from "../firebase";
import { Category } from "../types";

const CATEGORIES_COLLECTION = "categories";

export const categoryService = {
    async getCategories() {
        const q = query(collection(db, CATEGORIES_COLLECTION), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    },

    async createCategory(data: Omit<Category, 'id'>) {
        const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), data);
        return docRef.id;
    },

    async getCategoryBySlug(slug: string) {
        const q = query(collection(db, CATEGORIES_COLLECTION), where("slug", "==", slug));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Category;
    },

    async updateCategory(id: string, data: Partial<Category>) {
        const docRef = doc(db, CATEGORIES_COLLECTION, id);
        await updateDoc(docRef, data);
    },

    async deleteCategory(id: string) {
        const docRef = doc(db, CATEGORIES_COLLECTION, id);
        await deleteDoc(docRef);
    }
};
