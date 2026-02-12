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
    writeBatch
} from "firebase/firestore";
import { db } from "../firebase";
import { PageTemplate, BlockInstance } from "../types";

const TEMPLATES_COLLECTION = "templates";
const BLOCKS_COLLECTION = "blocks";

export const templateService = {
    async getTemplates() {
        const q = query(collection(db, TEMPLATES_COLLECTION), orderBy("updatedAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PageTemplate));
    },

    async getTemplateById(id: string) {
        const docRef = doc(db, TEMPLATES_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;

        const template = { id: docSnap.id, ...docSnap.data() } as PageTemplate;

        // Fetch blocks
        const blocksQ = query(
            collection(db, BLOCKS_COLLECTION),
            where("templateId", "==", id),
            orderBy("orderIndex", "asc")
        );
        const blocksSnapshot = await getDocs(blocksQ);
        const blocks = blocksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlockInstance));

        return { ...template, blocks };
    },

    async getActiveTemplate(pageType: 'home' | 'category' | 'article') {
        const q = query(
            collection(db, TEMPLATES_COLLECTION),
            where("pageType", "==", pageType),
            where("isActive", "==", true),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;

        const template = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as PageTemplate;
        return this.getTemplateById(template.id);
    },

    async createTemplate(data: Partial<PageTemplate>) {
        const { blocks, ...templateData } = data;

        // 1. Create Template
        const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), {
            ...templateData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // 2. Create Blocks
        if (blocks && blocks.length > 0) {
            const batch = writeBatch(db);
            blocks.forEach((block, index) => {
                const blockRef = doc(collection(db, BLOCKS_COLLECTION));
                batch.set(blockRef, {
                    ...block,
                    templateId: docRef.id,
                    orderIndex: index
                });
            });
            await batch.commit();
        }

        return docRef.id;
    },

    async updateTemplate(id: string, data: Partial<PageTemplate>) {
        const { blocks, ...templateData } = data;

        // 1. Update Template
        const docRef = doc(db, TEMPLATES_COLLECTION, id);
        await updateDoc(docRef, {
            ...templateData,
            updatedAt: serverTimestamp(),
        });

        // 2. Sync Blocks (Delete old and recreates for simplicity in this version)
        if (blocks) {
            // Delete old blocks
            const oldBlocksQ = query(collection(db, BLOCKS_COLLECTION), where("templateId", "==", id));
            const oldBlocksSnap = await getDocs(oldBlocksQ);
            const batch = writeBatch(db);
            oldBlocksSnap.docs.forEach(doc => batch.delete(doc.ref));

            // Add new blocks
            blocks.forEach((block, index) => {
                const blockRef = doc(collection(db, BLOCKS_COLLECTION));
                const { id: _, ...blockToSave } = block; // Remove client-side temp id
                batch.set(blockRef, {
                    ...blockToSave,
                    templateId: id,
                    orderIndex: index
                });
            });
            await batch.commit();
        }
    },

    async deleteTemplate(id: string) {
        // Delete blocks first
        const oldBlocksQ = query(collection(db, BLOCKS_COLLECTION), where("templateId", "==", id));
        const oldBlocksSnap = await getDocs(oldBlocksQ);
        const batch = writeBatch(db);
        oldBlocksSnap.docs.forEach(doc => batch.delete(doc.ref));

        // Delete template
        batch.delete(doc(db, TEMPLATES_COLLECTION, id));
        await batch.commit();
    }
};
