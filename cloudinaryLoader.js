export default function cloudinaryLoader({ src, width, quality }) {
    // f_auto: Optimal format (WebP/AVIF)
    // q_auto:eco: Aggressive mobile compression
    // c_fill: Resize and crop to fit
    const params = [
        'f_auto',
        width < 800 ? 'q_auto:eco' : 'q_auto',
        `w_${width}`,
        'c_fill',
        'dpr_1.0' // Force 1x for Lighthouse score (prevents 3x retina downloads on 4G)
    ];

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dowyjfruh';

    // If it's a relative local path, we MUST make it absolute for Cloudinary 'fetch' to work
    let sourceUrl = src;
    if (src.startsWith('/')) {
        // Hardcoded production URL as a primary fallback to ensure Cloudinary triggers
        // Vercel deployment URLs can also be used if NEXT_PUBLIC_SITE_URL is missing
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://raquel-ford.vercel.app';
        sourceUrl = `${siteUrl}${src}`;
    }

    // If it's already a Cloudinary URL, we can use it directly by injecting params
    if (src.includes('res.cloudinary.com')) {
        // Find the index after 'upload/' or 'fetch/' to insert transformations
        const parts = src.split('/');
        const uploadIndex = parts.indexOf('upload');
        const fetchIndex = parts.indexOf('fetch');

        if (uploadIndex !== -1) {
            // It's a direct upload, inject our custom params
            parts.splice(uploadIndex + 1, 0, params.join(','));
            return parts.join('/');
        } else if (fetchIndex !== -1) {
            // It's already a fetch URL, just return it
            return src;
        }
    }

    // Prepare sourceUrl correctly encoding query parameters
    const encodedSourceUrl = encodeURIComponent(sourceUrl);

    // If for some reason we are in dev and don't want Cloudinary, return local
    if (process.env.NODE_ENV === 'development' && !src.startsWith('http')) {
        return src.includes('?') ? `${src}&w=${width}` : `${src}?w=${width}`;
    }

    return `https://res.cloudinary.com/${cloudName}/image/fetch/${params.join(',')}/${encodedSourceUrl}`;
}
