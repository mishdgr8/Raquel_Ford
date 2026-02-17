import {
    collection,
    getDocs,
    addDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { db } from "../firebase";

export interface Comment {
    id: string;
    articleId: string;
    authorName: string;
    content: string;
    createdAt: Timestamp;
}

const COMMENTS_COLLECTION = "comments";

export const commentService = {
    async getCommentsByArticleId(articleId: string): Promise<Comment[]> {
        const q = query(
            collection(db, COMMENTS_COLLECTION),
            where("articleId", "==", articleId)
        );
        const snapshot = await getDocs(q);
        const comments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Comment));

        // Sort in memory to avoid needing a composite index
        return comments.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
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
    }
};
