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
        // Note: Cloudinary Fetch ONLY works with publicly accessible and verifiable absolute URLs.
        // Vercel Preview URLs are often protected and will cause Cloudinary fetch to fail (401/403).

        // Only use Cloudinary for local images if we have a stable production URL
        // In development or on preview branches without a hardcoded site URL, serve locally 
        if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SITE_URL) {
            return fallbackSrc;
        }

        let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

        if (siteUrl) {
            // Remove trailing slash if it exists
            if (siteUrl.endsWith('/')) {
                siteUrl = siteUrl.slice(0, -1);
            }
            sourceUrl = `${siteUrl}${src}`;
        } else {
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
