
import { db } from './src/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { slugify } from './src/lib/utils';

const articlesToUpdate = [
    {
        id: '255xLpnLRRSNjDiCs43S',
        tags: ['Meghan Markle', 'Harry and Meghan', 'Royalty', 'Fashion']
    },
    {
        id: '2vpJKwlwL9dB8W4qC69m',
        tags: ['Teyana Taylor', 'Chase Infiniti', 'One Battle After Another', 'Frankenstein', 'Hamnet']
    },
    {
        id: '4KGNjbfYyHUazkFeiINM',
        tags: ['Lionel Messi', 'Cristiano Ronaldo', 'Football', 'Soccer', "Balon d'Or"]
    },
    {
        id: '4mVi675SJ9YdfL0zOhJw',
        tags: ['Bad Bunny', 'Teyana Taylor', 'Best Dressed', 'Doechii', 'BlackPink', 'Karol G', 'Olivia Dean', 'Rosé', 'Kehlani', 'Ayra Starr']
    }
];

async function migrate() {
    for (const article of articlesToUpdate) {
        const tagSlugs = article.tags.map(tag => slugify(tag));
        console.log(`Updating ${article.id} with slugs: ${tagSlugs.join(', ')}`);
        const docRef = doc(db, 'articles', article.id);
        await updateDoc(docRef, { tagSlugs });
    }
    console.log('Migration complete!');
}

migrate().catch(console.error);
