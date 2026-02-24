import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    try {
        const slug1 = "2026-bafta-film-awards-winners list";
        const slug2 = encodeURIComponent(slug1);

        console.log(`Checking plain slug: '${slug1}'`);
        let q = query(collection(db, "articles"), where("slug", "==", slug1));
        let snap = await getDocs(q);
        console.log(`Found docs: ${snap.size}`);

        console.log(`Checking encoded slug: '${slug2}'`);
        q = query(collection(db, "articles"), where("slug", "==", slug2));
        snap = await getDocs(q);
        console.log(`Found docs: ${snap.size}`);

    } catch (e) {
        console.error("Error:", e);
    }
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
