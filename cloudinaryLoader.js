export default function cloudinaryLoader({ src, width, quality }) {
    // Aggressive mobile optimization
    // q_auto:eco - Use the most efficient compression possible
    // f_auto - Automatically choose best format (WebP/AVIF)
    // c_fill - Crop to fit the exact width
    // dpr_1.0 - Force 1x pixel density for mobile scores (Retina 3x images are the LCP killer)

    // We only use higher quality/DPR for very large (desktop) widths
    const isSmall = width < 800;

    const params = [
        'f_auto',
        isSmall ? 'q_auto:eco' : 'q_auto',
        `w_${width}`,
        'c_fill',
        isSmall ? 'dpr_1.0' : 'dpr_auto'
    ];

    const fallbackSrc = src.includes('?') ? `${src}&w=${width}` : `${src}?w=${width}`;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dowyjfruh';

    if (!cloudName) return fallbackSrc;

    let sourceUrl = src;
    if (src.startsWith('/')) {
        if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SITE_URL) {
            return fallbackSrc;
        }

        let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
        if (siteUrl && siteUrl.endsWith('/')) {
            siteUrl = siteUrl.slice(0, -1);
        }
        sourceUrl = siteUrl ? `${siteUrl}${src}` : src;
    }

    const encodedSourceUrl = encodeURIComponent(sourceUrl);
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${params.join(',')}/${encodedSourceUrl}`;
}
