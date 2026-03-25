import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { db } from "../firebase";

import { FirestoreTimestamp } from "../types";

export interface Comment {
    id: string;
    articleId: string;
    authorName: string;
    content: string;
    createdAt: FirestoreTimestamp | Date | string;
}

import { toDate } from "../utils";

const COMMENTS_COLLECTION = "comments";

export const commentService = {
    async getCommentsByArticleId(articleId: string): Promise<Comment[]> {
        const q = query(
            collection(db, COMMENTS_COLLECTION),
            where("articleId", "==", articleId)
        );
        const snapshot = await getDocs(q);
        const comments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as Comment;
        });

        // Sort in memory to avoid needing a composite index
        return comments.sort((a, b) => {
            const timeA = toDate(a.createdAt)?.getTime() || 0;
            const timeB = toDate(b.createdAt)?.getTime() || 0;
            return timeB - timeA; // Descending
        });
    },

    async addComment(articleId: string, authorName: string, content: string): Promise<string> {
        const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
            articleId,
            authorName,
            content,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    },

    async getAllComments(): Promise<Comment[]> {
        const q = query(collection(db, COMMENTS_COLLECTION));
        const snapshot = await getDocs(q);
        const comments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as Comment;
        });

        // Sort in memory (newest first)
        return comments.sort((a, b) => {
            const timeA = toDate(a.createdAt)?.getTime() || 0;
            const timeB = toDate(b.createdAt)?.getTime() || 0;
            return timeB - timeA;
        });
    },

    async deleteComment(commentId: string): Promise<void> {
        const docRef = doc(db, COMMENTS_COLLECTION, commentId);
        await deleteDoc(docRef);
    }
};
