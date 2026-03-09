/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    loader: 'custom',
    loaderFile: './cloudinaryLoader.js',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp'],
    minimumCacheTTL: 3600,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "*.firebasestorage.app",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.wp.com",
      },
      {
        protocol: "https",
        hostname: "*.wordpress.com",
      },
      {
        protocol: "https",
        hostname: "*.gravatar.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.cnn.com",
      },
      {
        protocol: "https",
        hostname: "*.vogue.com",
      },
      {
        protocol: "https",
        hostname: "raquelford.wordpress.com",
      },
    ],
  },
};

export default nextConfig;
