import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { categoryService } from "@/lib/services/categories";
import { serializeFirestoreData } from "@/lib/utils";
import Script from "next/script";

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Pre-fetch categories on the server for the Header
    const categories = await categoryService.getCategories();
    const serializedCategories = serializeFirestoreData(categories);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header initialCategories={serializedCategories} />
            <main style={{ flex: 1, paddingTop: '140px' }}>
                {children}
            </main>
            <Footer />
            <Script async src="//www.instagram.com/embed.js" strategy="lazyOnload" />
            <Script async src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" />
            <Script async src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
        </div>
    );
}
