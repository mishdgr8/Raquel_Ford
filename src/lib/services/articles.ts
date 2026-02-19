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
import { Article, ArticleStatus } from "../types";

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

    async getAllPublishedArticles() {
        const q = query(
            collection(db, ARTICLES_COLLECTION),
            where("status", "==", "published"),
            orderBy("publishedAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
    },

    async getEditorsPicks() {
        // Simple query for now, fetching up to 4
        const q = query(
            collection(db, ARTICLES_COLLECTION),
            where("status", "==", "published"),
            where("isEditorsPick", "==", true),
            orderBy("publishedAt", "desc"),
            limit(4)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
    },

    async getArticleBySlug(slug: string) {
        // Query by slug only to avoid composite index requirements
        const q = query(collection(db, ARTICLES_COLLECTION), where("slug", "==", slug));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        // In-memory filter: Prioritize published articles, sort by date desc
        const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));

        // 1. Filter for published
        const publishedArticles = articles.filter(a => a.status === 'published');

        // 2. If we have published ones, sort by date and take the newest
        if (publishedArticles.length > 0) {
            publishedArticles.sort((a, b) => {
                const dateA = a.publishedAt?.toMillis ? a.publishedAt.toMillis() : 0;
                const dateB = b.publishedAt?.toMillis ? b.publishedAt.toMillis() : 0;
                return dateB - dateA;
            });
            return publishedArticles[0];
        }

        // 3. Fallback: Return the first found (legacy behavior)
        return articles[0];
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
    },

    // Bulk Operations (Feature 8)
    async bulkUpdateStatus(ids: string[], status: ArticleStatus) {
        const promises = ids.map(id => {
            const docRef = doc(db, ARTICLES_COLLECTION, id);
            return updateDoc(docRef, {
                status,
                updatedAt: serverTimestamp(),
                ...(status === 'published' ? { publishedAt: serverTimestamp() } : {}),
            });
        });
        await Promise.all(promises);
    },

    async softDeleteArticles(ids: string[]) {
        const promises = ids.map(id => {
            const docRef = doc(db, ARTICLES_COLLECTION, id);
            return updateDoc(docRef, {
                status: 'archived',
                updatedAt: serverTimestamp(),
            });
        });
        await Promise.all(promises);
    },

    async bulkHardDelete(ids: string[]) {
        const promises = ids.map(id => {
            const docRef = doc(db, ARTICLES_COLLECTION, id);
            return deleteDoc(docRef);
        });
        await Promise.all(promises);
    },

    // Editor's Pick (Feature 9)
    async toggleEditorsPick(id: string, currentValue: boolean) {
        const docRef = doc(db, ARTICLES_COLLECTION, id);
        if (currentValue) {
            // Unpin
            await updateDoc(docRef, {
                isEditorsPick: false,
                editorPickOrder: null,
                updatedAt: serverTimestamp(),
            });
        } else {
            // Pin — get max order and add 1
            const picks = await this.getEditorsPicks();
            const maxOrder = picks.reduce((max, p) => Math.max(max, p.editorPickOrder || 0), 0);
            await updateDoc(docRef, {
                isEditorsPick: true,
                editorPickOrder: maxOrder + 1,
                updatedAt: serverTimestamp(),
            });
        }
    },
};
