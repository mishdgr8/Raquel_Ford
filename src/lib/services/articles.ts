import {
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    startAfter,
    QueryDocumentSnapshot
} from "firebase/firestore";
import { db } from "../firebase";
import { Article } from "../types";

const ARTICLES_COLLECTION = "articles";

export const articleService = {
    // Public Fetch
    async getPublishedArticles(categoryId?: string, count: number = 10, lastDoc?: any) {
        const constraints: any[] = [
            where("status", "==", "published"),
            orderBy("publishedAt", "desc"),
            limit(count)
        ];

        if (categoryId) {
            constraints.unshift(where("categoryId", "==", categoryId));
        }

        if (lastDoc) {
            constraints.push(startAfter(lastDoc));
        }

        const q = query(collection(db, ARTICLES_COLLECTION), ...constraints);
        const snapshot = await getDocs(q);

        return {
            articles: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)),
            lastDoc: snapshot.docs[snapshot.docs.length - 1]
        };
    },

    async getArticleBySlug(slug: string) {
        const q = query(collection(db, ARTICLES_COLLECTION), where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Article;
    },

    // Admin CRUD
    async getAllArticles() {
        const q = query(collection(db, ARTICLES_COLLECTION), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
    },

    async getArticlesByCategory(categorySlug: string) {
        const q = query(
            collection(db, ARTICLES_COLLECTION),
            where("status", "==", "published"),
            where("categoryId", "==", categorySlug),
            orderBy("publishedAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
    },

    async getArticleById(id: string) {
        const docRef = doc(db, ARTICLES_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...docSnap.data() } as Article;
    },

    async createArticle(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) {
        const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    },

    async updateArticle(id: string, data: Partial<Article>) {
        const docRef = doc(db, ARTICLES_COLLECTION, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
    },

    async deleteArticle(id: string) {
        const docRef = doc(db, ARTICLES_COLLECTION, id);
        await deleteDoc(docRef);
    }
};
