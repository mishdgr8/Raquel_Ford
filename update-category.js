const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function updateCategory() {
    try {
        await db.collection('categories').doc('entertainment').update({
            image: '/images/categories/entertainment.webp'
        });
        console.log('Firestore updated successfully: Entertainment image set to /images/categories/entertainment.webp');
        process.exit(0);
    } catch (err) {
        console.error('Error updating Firestore:', err);
        process.exit(1);
    }
}

updateCategory();
