import { PostGrid } from "@/components/blocks/PostGrid";

export const revalidate = 60;

export const metadata = {
    title: "All Articles | Raquel Ford",
    description: "Browse all our latest stories, news, and updates.",
};

export default function ArticlesPage() {
    return (
        <div className="container" style={{ padding: "2rem 0" }}>
            <div style={{ marginBottom: "3rem", textAlign: "center" }}>
                <h1 style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "3rem",
                    marginBottom: "1rem"
                }}>
                    All Stories
                </h1>
                <div style={{
                    width: "60px",
                    height: "2px",
                    background: "var(--primary)",
                    margin: "0 auto"
                }} />
            </div>

            <PostGrid
                config={{
                    count: 12, // Pagination limit
                    columns: 3,
                }}
            />
        </div>
    );
}
