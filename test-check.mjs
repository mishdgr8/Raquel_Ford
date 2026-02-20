import { initializeApp } from "firebase/app";
import { getFirestore, getDoc, doc, deleteDoc } from "firebase/firestore";

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
    const snap = await getDoc(doc(db, "articles", "lLFKBXMjmKsMEDuec3Mu"));
    if (snap.exists()) {
        console.log("lLFKBXMjmKsMEDuec3Mu EXISTS! title: " + snap.data().title);
    } else {
        console.log("lLFKBXMjmKsMEDuec3Mu IS GONE!");
    }
    
    // forcefully delete the 4 bad ones
    const badIds = ["EvKgwwpRSxuqNSmSTIxR", "Vs7kcw6kiKQbFfxLzpQk", "YDOyzoUdSskoGzTyGQc1", "x1KjR0wKO645HpurjlYh"];
    for (const id of badIds) {
        console.log("Deleting " + id);
        await deleteDoc(doc(db, "articles", id));
    }
}
check();
