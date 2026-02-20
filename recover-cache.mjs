import fs from 'fs';
import path from 'path';

// read all files in .next/cache/fetch-cache
const dir = path.join(process.cwd(), '.next', 'cache', 'fetch-cache');
if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        if (!f.endsWith('.json')) {
            const content = fs.readFileSync(path.join(dir, f), 'utf-8');
            if (content.includes("Star-Studded")) {
                console.log(`Found Star-Studded in cache file ${f}!`);
                fs.writeFileSync(`recovered-${f}.json`, content);
                console.log("Saved to recovered-" + f + ".json");
            }
        }
    }
} else {
    console.log("No fetch-cache directory found.");
}
