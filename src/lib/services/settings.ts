import {
    collection,
    getDocs,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { SiteSettings } from "../types";

const SETTINGS_COLLECTION = "settings";
const SITE_SETTINGS_ID = "main";

export const settingsService = {
    async getSettings() {
        const docRef = doc(db, SETTINGS_COLLECTION, SITE_SETTINGS_ID);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            // Default settings if none found
            return {
                general: { siteName: "Raquel Ford", tagline: "Editorial Magazine" },
                seo: { defaultTitle: "Raquel Ford", defaultDescription: "A premium editorial experience." },
                social: {},
                footer: { content: "© 2026 Raquel Ford" }
            } as SiteSettings;
        }

        return { id: docSnap.id, ...docSnap.data() } as SiteSettings;
    },

    async updateSettings(data: Partial<SiteSettings>) {
        const docRef = doc(db, SETTINGS_COLLECTION, SITE_SETTINGS_ID);
        await setDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    }
};
