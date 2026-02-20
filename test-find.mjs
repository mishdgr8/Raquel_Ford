import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function check() {
    const snap1 = await getDocs(collection(db, "articles"));
    
    snap1.docs.forEach(d => {
        const data = d.data();
        if (data.title && (data.title.includes("Pharrell") || data.title.includes("Front Row"))) {
            console.log(`[${d.id}] Slug: ${data.slug} | Status: ${data.status} | Title: ${data.title}`);
            console.log(`   Excerpt: ${data.excerpt}`);
        }
    });
}
check();
