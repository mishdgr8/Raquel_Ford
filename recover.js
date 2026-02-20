const fs = require('fs');
const path = require('path');
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, serverTimestamp } = require("firebase/firestore");
require('dotenv').config({ path: '.env.local' });

// We will look in .next/server/app/articles/[slug].html or data files to find the content
const dir = path.join(process.cwd(), '.next', 'server', 'app', 'articles');

async function main() {
    let htmlContent = '';
    const files = fs.readdirSync(dir);
    for (const f of files) {
        if (f.includes('pharrell')) {
            const content = fs.readFileSync(path.join(dir, f), 'utf-8');
            // extract the interesting parts... actually it's easier to just read the JSON from .next/server/app/articles/pharrells-louis-vuitton-fw26-show.meta or similar
            if (f.endsWith('.html')) {
                console.log("Found HTML: " + f);
                htmlContent = content;
            }
        }
    }
    console.log("Found HTML length: " + htmlContent.length);
}
main();
