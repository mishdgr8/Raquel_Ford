/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    loader: 'custom',
    loaderFile: './cloudinaryLoader.js',
    // Added more granular sizes to target mobile discovery better (shaves off LCP)
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp'],
    minimumCacheTTL: 86400, // Increase cache TTL to 24h
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
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
