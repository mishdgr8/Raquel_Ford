import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-vogue",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://raquelford.com"),
  title: "Raquel Ford: Beauty, Entertainment, Fashion, Lifestyle and More..",
  description: "Browse the latest in lifestyle, fashion, beauty, and more on Raquel Ford.",
  openGraph: {
    title: "Raquel Ford: Beauty, Entertainment, Fashion, Lifestyle and More..",
    description: "Browse the latest in lifestyle, fashion, beauty, and more on Raquel Ford.",
    url: "https://raquelford.com",
    siteName: "Raquel Ford",
    images: [
      {
        url: "/og-image.png", // Using the new RF logo for sharing
        width: 1200,
        height: 630,
        alt: "Raquel Ford",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raquel Ford: Beauty, Entertainment, Fashion, Lifestyle and More..",
    description: "Browse the latest in lifestyle, fashion, beauty, and more on Raquel Ford.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/favicon.png", sizes: "32x32" },
    ],
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${cormorant.variable}`}>
        {children}
      </body>
    </html>
  );
}
