export default function cloudinaryLoader({ src, width, quality }) {
    const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];

    // Note: To satisfy Next.js's strict requirement that the returned string includes the requested width,
    // we append the width to the fallback src as a dummy query parameter.
    const fallbackSrc = src.includes('?') ? `${src}&w=${width}` : `${src}?w=${width}`;

    // Get cloud name (hardcoded to avoid Turbopack process.env issues in loaderFile)
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dowyjfruh';

    // If the cloud name isn't set, fallback to the original image URL 
    if (!cloudName) {
        return fallbackSrc;
    }

    // Handle relative local paths (e.g. /images/logo.png)
    let sourceUrl = src;
    if (src.startsWith('/')) {
        // Determine absolute URL for local images
        // Note: Cloudinary Fetch ONLY works with publicly accessible and verifiable absolute URLs.

        // In local development, Cloudinary can't reach "localhost", so we serve it unoptimized 
        if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_VERCEL_URL) {
            return fallbackSrc;
        }

        // In production, Vercel automatically populates NEXT_PUBLIC_VERCEL_URL.
        // If you have a custom domain set in env variables, we use that.
        let siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
            (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null);

        if (siteUrl) {
            // Remove trailing slash if it exists to avoid double slash issues
            if (siteUrl.endsWith('/')) {
                siteUrl = siteUrl.slice(0, -1);
            }
            sourceUrl = `${siteUrl}${src}`;
        } else {
            // Fallback relative if we can't build an absolute URL for Cloudinary
            return fallbackSrc;
        }
    }

    // Prepare sourceUrl correctly encoding query parameters so Cloudinary fetch doesn't fail
    // Firebase URLs contain ?alt=media which needs to be properly escaped
    const encodedSourceUrl = encodeURIComponent(sourceUrl);

    // Generate the highly optimized Cloudinary fetch URL
    // You must enable "Fetched URL" in your Cloudinary Dashboard under Settings > Security
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${params.join(',')}/${encodedSourceUrl}`;
}
