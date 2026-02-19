import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import Script from "next/script";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1, paddingTop: '140px' }}>
                {children}
            </main>
            <Footer />
            <Script async src="//www.instagram.com/embed.js" strategy="lazyOnload" />
        </div>
    );
}
