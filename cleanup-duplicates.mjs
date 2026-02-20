import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupDuplicates() {
    console.log("Fetching all articles...");
    const snap = await getDocs(collection(db, "articles"));

    // Group by slug
    const articlesBySlug = new Map();

    snap.docs.forEach(d => {
        const data = d.data();
        if (!data.slug) return; // Skip if no slug

        if (!articlesBySlug.has(data.slug)) {
            articlesBySlug.set(data.slug, []);
        }
        articlesBySlug.get(data.slug).push({ id: d.id, ...data });
    });

    let deletedCount = 0;

    for (const [slug, articles] of articlesBySlug.entries()) {
        if (articles.length > 1) {
            console.log(`Found ${articles.length} duplicates for slug: ${slug}`);

            // Sort to find the best one to keep
            // Prioritize published ones, then by newest date
            articles.sort((a, b) => {
                // If one is published and the other isn't, prefer the published one
                if (a.status === 'published' && b.status !== 'published') return -1;
                if (b.status === 'published' && a.status !== 'published') return 1;

                const timeA = a.publishedAt?.toMillis ? a.publishedAt.toMillis() : new Date(a.publishedAt || a.createdAt || 0).getTime();
                const timeB = b.publishedAt?.toMillis ? b.publishedAt.toMillis() : new Date(b.publishedAt || b.createdAt || 0).getTime();
                return timeB - timeA; // Newest first
            });

            // Keep the first one, delete the rest
            const toKeep = articles[0];
            const toDelete = articles.slice(1);

            console.log(`Keeping: [${toKeep.id}] ${toKeep.title} (Status: ${toKeep.status})`);

            for (const item of toDelete) {
                console.log(`Deleting: [${item.id}] ${item.title} (Status: ${item.status})`);
                await deleteDoc(doc(db, "articles", item.id));
                deletedCount++;
            }
            console.log("---");
        }
    }

    console.log(`Cleanup complete! Deleted ${deletedCount} duplicate articles.`);
}

cleanupDuplicates().catch(console.error);
