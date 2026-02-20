"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getAllComments, deleteComment } from "@/app/actions/comments";
import { Comment } from "@/lib/services/comments";
import styles from "./CommentsPage.module.css";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function CommentsModerationPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        setLoading(true);
        const data = await getAllComments();
        setComments(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;

        setActionLoading(id);
        const result = await deleteComment(id);

        if (result.success) {
            setComments(prev => prev.filter(c => c.id !== id));
        } else {
            alert(result.error);
        }
        setActionLoading(null);
    };

    if (loading) {
        return <div>Loading comments...</div>;
    }

    return (
        <div>
            <h1 className={styles.pageTitle}>Comment Moderation</h1>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Author</th>
                            <th>Comment</th>
                            <th>Date</th>
                            <th>Article</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className={styles.emptyState}>
                                    No comments found.
                                </td>
                            </tr>
                        ) : (
                            comments.map((comment) => (
                                <tr key={comment.id}>
                                    <td>
                                        <strong>{comment.authorName}</strong>
                                    </td>
                                    <td>
                                        <div className={styles.commentContent}>
                                            {comment.content}
                                        </div>
                                    </td>
                                    <td>
                                        {comment.createdAt?.toDate ? format(comment.createdAt.toDate(), "MMM d, yyyy h:mm a") : "Unknown"}
                                    </td>
                                    <td>
                                        {/* Ideally we'd have the article slug, but we only store the articleId in the comment. We can link to edit article for now. */}
                                        <Link href={`/admin/articles/edit/${comment.articleId}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--foreground)' }}>
                                            View Article <ExternalLink size={14} />
                                        </Link>
                                    </td>
                                    <td>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDelete(comment.id)}
                                            disabled={actionLoading === comment.id}
                                        >
                                            {actionLoading === comment.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
