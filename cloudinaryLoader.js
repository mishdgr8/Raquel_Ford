export default function cloudinaryLoader({ src, width, quality }) {
    // f_auto: Fetch the most optimal format (webp/avif)
    // q_auto: Aggressively optimize quality based on the image content
    // c_fill: Ensure the image fills the requested width (better for LCP than c_limit)
    // dpr_auto: Adjust for high-density mobile screens
    const params = [
        'f_auto',
        'q_auto',
        `w_${width}`,
        'c_fill',
        'dpr_auto'
    ];

    // Fallback for non-cloudinary environments (development)
    const fallbackSrc = src.includes('?') ? `${src}&w=${width}` : `${src}?w=${width}`;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dowyjfruh';

    if (!cloudName) {
        return fallbackSrc;
    }

    let sourceUrl = src;
    if (src.startsWith('/')) {
        if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SITE_URL) {
            return fallbackSrc;
        }

        let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
        if (siteUrl) {
            if (siteUrl.endsWith('/')) {
                siteUrl = siteUrl.slice(0, -1);
            }
            sourceUrl = `${siteUrl}${src}`;
        } else {
            return fallbackSrc;
        }
    }

    const encodedSourceUrl = encodeURIComponent(sourceUrl);
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${params.join(',')}/${encodedSourceUrl}`;
}
