const html = `
<p><em>What it is, how it works, and why wellness insiders are drinking their
protein instead of shaking it up.</em></p>

<p>Let’s unpack.</p>

<blockquote class="twitter-tweet" data-dnt="true"><a
href="https://x.com/golfwang0x/status/2018252903253782934?s=20"></a></blockquote>

<h2 class="wp-block-heading">What is Clear Protein, Really?</h2>
`;

const twitterBlockquoteRegex = /<blockquote[^>]*class=["'][^"']*twitter-tweet[^"']*["'][^>]*>[\s\S]*?href=["']https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)[^"']*["'][\s\S]*?<\/blockquote>/gi;

let match;
while ((match = twitterBlockquoteRegex.exec(html)) !== null) {
    console.log("Matched:", match[0]);
    console.log("ID:", match[1]);
}

const html2 = `<p>https://x.com/abc/status/12345</p>`;
const twitterUrlRegex = /<p>\s*(?:<a[^>]*href=["'])?https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)[^<"']*(?:["'][^>]*>.*?<\/a>)?\s*<\/p>/gi;

while ((match = twitterUrlRegex.exec(html2)) !== null) {
    console.log("Matched2:", match[0]);
    console.log("ID2:", match[1]);
}

const html3 = `<p><a href="https://x.com/abc/status/12345">https://x.com/abc/status/12345</a></p>`;
while ((match = twitterUrlRegex.exec(html3)) !== null) {
    console.log("Matched3:", match[0]);
    console.log("ID3:", match[1]);
}
