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
            where("articleId", "==", articleId),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Comment));
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
