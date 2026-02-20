"use client";

import React, { useState, useEffect } from "react";
import { wordPressService, WordPressPost } from "@/lib/services/wordpress";
import { articleService } from "@/lib/services/articles";
import { categoryService } from "@/lib/services/categories";
import { Category } from "@/lib/types";
import { generateExcerpt } from "@/lib/utils";
import styles from "../ArticleList.module.css";

export default function WordPressImportPage() {
    const [siteUrl, setSiteUrl] = useState("");
    const [posts, setPosts] = useState<WordPressPost[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState<Record<number, boolean>>({});
    const [imported, setImported] = useState<Record<number, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const [useProxy, setUseProxy] = useState(true);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // XML Import
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const parseXmlFile = (xmlText: string) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const items = Array.from(xmlDoc.querySelectorAll("item"));

        // 1. Build a map of attachment IDs to URLs for featured images
        const attachmentMap = new Map<string, string>();
        items.forEach(item => {
            const postType = item.querySelector("post_type")?.textContent;
            const postId = item.querySelector("post_id")?.textContent;
            const attachmentUrl = item.querySelector("attachment_url")?.textContent;

            if (postType === "attachment" && postId && attachmentUrl) {
                attachmentMap.set(postId, attachmentUrl);
            }
        });

        const parsedPosts: WordPressPost[] = [];

        items.forEach(item => {
            const postType = item.querySelector("post_type")?.textContent;
            if (postType !== "post") return;

            const title = item.querySelector("title")?.textContent || "Untitled";
            const link = item.querySelector("link")?.textContent || "";
            // pubDate is standard RSS, wp:post_date is WP specific. Prefer wp:post_date
            const postDate = item.querySelector("post_date")?.textContent || item.querySelector("pubDate")?.textContent || new Date().toISOString();
            const slug = item.querySelector("post_name")?.textContent || "";
            const status = item.querySelector("status")?.textContent || "draft";

            // Content is in content:encoded namespace
            const contentEncoded = item.getElementsByTagNameNS("*", "encoded")[0]?.textContent || "";
            const excerptEncoded = item.getElementsByTagNameNS("*", "encoded")[1]?.textContent || ""; // Often excerpt is the second encoded block, but let's be safer

            // Actually, in WP XML, content:encoded is usually first, excerpt:encoded second. 
            // Better to find by tag name directly if namespaces are tricky with simple DOMParser
            // querySelector("content\\:encoded") might not work.
            // Let's iterate child nodes to be safe or use getElementsByTagName

            const content = item.getElementsByTagName("content:encoded")[0]?.textContent || "";
            let excerpt = item.getElementsByTagName("excerpt:encoded")[0]?.textContent || "";

            if (!excerpt.trim()) {
                excerpt = generateExcerpt(content);
            }

            const postId = parseInt(item.querySelector("post_id")?.textContent || "0");

            // Featured Image
            let featuredImageUrl = "";
            const metaNodes = Array.from(item.querySelectorAll("postmeta"));
            const thumbnailMeta = metaNodes.find(meta =>
                meta.querySelector("meta_key")?.textContent === "_thumbnail_id"
            );

            if (thumbnailMeta) {
                const thumbnailId = thumbnailMeta.querySelector("meta_value")?.textContent;
                if (thumbnailId && attachmentMap.has(thumbnailId)) {
                    featuredImageUrl = attachmentMap.get(thumbnailId) || "";
                }
            }

            parsedPosts.push({
                id: postId,
                title: { rendered: title },
                slug: slug,
                excerpt: { rendered: excerpt },
                content: { rendered: content },
                date: postDate,
                status: status,
                jetpack_featured_media_url: featuredImageUrl
            });
        });

        return parsedPosts;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        setSuccessMsg(null);
        setPosts([]);
        setImported({});

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const xmlText = event.target?.result as string;
                const parsed = parseXmlFile(xmlText);
                if (parsed.length === 0) {
                    setError("No posts found in the XML file.");
                } else {
                    setPosts(parsed);
                    setSuccessMsg(`Parsed ${parsed.length} posts from XML.`);
                }
            } catch (err: any) {
                setError("Failed to parse XML file: " + err.message);
            } finally {
                setLoading(false);
            }
        };
        reader.onerror = () => {
            setError("Failed to read file.");
            setLoading(false);
        };
        reader.readAsText(file);
    };
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cats = await categoryService.getCategories();
                setCategories(cats);
                if (cats.length > 0) setSelectedCategoryId(cats[0].id!);
            } catch (err) {
                console.error("Failed to load categories:", err);
                setError("Failed to load categories. Check console for details.");
            }
        };
        fetchCategories();
    }, []);

    const handleFetchPosts = async () => {
        if (!siteUrl) {
            setError("Please enter a WordPress site URL");
            return;
        }
        setLoading(true);
        setError(null);
        setSuccessMsg(null);
        setPosts([]);
        setImported({});
        try {
            const fetchedPosts = await wordPressService.fetchPosts(
                siteUrl,
                1,
                20,
                useProxy
            );
            if (fetchedPosts.length === 0) {
                setError("No posts found on this WordPress site.");
            } else {
                setPosts(fetchedPosts);
                setSuccessMsg(`Found ${fetchedPosts.length} posts.`);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (post: WordPressPost) => {
        if (!selectedCategoryId) {
            setError("Please select a category first");
            return;
        }

        setImporting((prev) => ({ ...prev, [post.id]: true }));
        setError(null);
        try {
            const articleData = wordPressService.mapPostToArticle(
                post,
                selectedCategoryId
            );
            await articleService.createArticle(articleData);
            setImported((prev) => ({ ...prev, [post.id]: true }));
            setSuccessMsg(`"${post.title.rendered}" imported as draft!`);
        } catch (err: any) {
            setError(
                `Error importing "${post.title.rendered}": ${err.message}`
            );
        } finally {
            setImporting((prev) => ({ ...prev, [post.id]: false }));
        }
    };

    const handleImportAll = async () => {
        const remaining = posts.filter((p) => !imported[p.id]);
        for (const post of remaining) {
            await handleImport(post);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Import from WordPress</h1>
            </div>

            {/* URL + Proxy Toggle */}
            <div
                style={{
                    marginBottom: "1.5rem",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-end",
                    flexWrap: "wrap",
                }}
            >
                <div style={{ flex: 1, minWidth: "250px" }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 500,
                        }}
                    >
                        WordPress Site URL
                    </label>
                    <input
                        type="text"
                        value={siteUrl}
                        onChange={(e) => setSiteUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleFetchPosts()}
                        placeholder="https://your-wordpress-site.com"
                        style={{
                            padding: "0.8rem",
                            width: "100%",
                            borderRadius: "4px",
                            border: "1px solid #ddd",
                        }}
                    />
                </div>
                <button
                    onClick={handleFetchPosts}
                    disabled={loading}
                    className={styles.addButton}
                    style={{ padding: "0.8rem 2rem", whiteSpace: "nowrap" }}
                >
                    {loading ? "Fetching..." : "Fetch Posts"}
                </button>
            </div>

            {/* OR Seperator */}
            <div style={{ textAlign: 'center', margin: '1rem 0', position: 'relative' }}>
                <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
                <span style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#fff',
                    padding: '0 1rem',
                    color: '#888',
                    fontSize: '0.9rem'
                }}>OR</span>
            </div>

            {/* XML Upload */}
            <div style={{ marginBottom: "2rem" }}>
                <label
                    style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                    }}
                >
                    Upload WordPress XML File (Limit 100MB)
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="file"
                        accept=".xml"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        style={{
                            padding: "0.8rem",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            flex: 1
                        }}
                    />
                </div>
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                    Upload an exported XML file from WordPress (Tools &gt; Export). This processes partially in your browser.
                </p>
            </div>

            {/* Proxy toggle */}
            <div style={{ marginBottom: "1.5rem" }}>
                <label
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                    }}
                >
                    <input
                        type="checkbox"
                        checked={useProxy}
                        onChange={(e) => setUseProxy(e.target.checked)}
                    />
                    <span>Use CORS proxy</span>
                    <span style={{ fontSize: "0.8rem", color: "#888" }}>
                        (recommended — disable only if the site allows cross-origin
                        requests)
                    </span>
                </label>
            </div>

            {/* Messages */}
            {error && (
                <div
                    style={{
                        color: "#d32f2f",
                        background: "#fdecea",
                        padding: "0.8rem 1rem",
                        borderRadius: "6px",
                        marginBottom: "1rem",
                        fontSize: "0.9rem",
                        lineHeight: 1.5,
                    }}
                >
                    ⚠️ {error}
                </div>
            )}
            {successMsg && !error && (
                <div
                    style={{
                        color: "#2e7d32",
                        background: "#e8f5e9",
                        padding: "0.8rem 1rem",
                        borderRadius: "6px",
                        marginBottom: "1rem",
                        fontSize: "0.9rem",
                    }}
                >
                    ✅ {successMsg}
                </div>
            )}

            {/* Category selector + Import All */}
            {posts.length > 0 && (
                <div
                    style={{
                        marginBottom: "1.5rem",
                        display: "flex",
                        gap: "1rem",
                        alignItems: "flex-end",
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: 500,
                            }}
                        >
                            Import into category
                        </label>
                        <select
                            value={selectedCategoryId}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                            style={{
                                padding: "0.8rem",
                                width: "300px",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                            }}
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleImportAll}
                        className={styles.addButton}
                        style={{ padding: "0.8rem 2rem" }}
                    >
                        Import All
                    </button>
                </div>
            )}

            {/* Posts table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post) => (
                            <tr
                                key={post.id}
                                style={{
                                    opacity: imported[post.id] ? 0.5 : 1,
                                }}
                            >
                                <td
                                    dangerouslySetInnerHTML={{
                                        __html: post.title.rendered,
                                    }}
                                />
                                <td>
                                    {new Date(post.date).toLocaleDateString()}
                                </td>
                                <td>
                                    {imported[post.id] ? (
                                        <span
                                            style={{
                                                color: "#2e7d32",
                                                fontWeight: 500,
                                            }}
                                        >
                                            ✅ Imported
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleImport(post)}
                                            disabled={importing[post.id]}
                                            className={styles.addButton}
                                            style={{
                                                padding: "0.4rem 1rem",
                                                fontSize: "0.8rem",
                                            }}
                                        >
                                            {importing[post.id]
                                                ? "Importing..."
                                                : "Import"}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {posts.length === 0 && !loading && (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "2rem",
                            color: "#666",
                        }}
                    >
                        Enter your WordPress site URL and click &quot;Fetch Posts&quot; to
                        get started.
                    </div>
                )}
            </div>
        </div>
    );
}
