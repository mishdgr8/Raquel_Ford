import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    addDoc,
    serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { NewsletterSubscriber } from "../types";

const NEWSLETTER_COLLECTION = "newsletter";

export const newsletterService = {
    async subscribe(email: string, firstName?: string, source: string = "home") {
        // Check if already exists (optional, could also be handled by security rules or unique indices if possible)
        const q = query(collection(db, NEWSLETTER_COLLECTION), where("email", "==", email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            throw new Error("Already subscribed");
        }

        const docRef = await addDoc(collection(db, NEWSLETTER_COLLECTION), {
            email,
            firstName,
            status: "active",
            source,
            createdAt: serverTimestamp(),
        });

        return docRef.id;
    },

    async getSubscribers() {
        const q = query(collection(db, NEWSLETTER_COLLECTION), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsletterSubscriber));
    }
};
