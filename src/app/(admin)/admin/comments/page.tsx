"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getAllComments, deleteComment, bulkDeleteComments } from "@/app/actions/comments";
import { Comment } from "@/lib/services/comments";
import styles from "./CommentsPage.module.css";
import Link from "next/link";
import { ExternalLink, CheckSquare } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { toDate } from "@/lib/utils";

export default function CommentsModerationPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

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
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        } else {
            alert(result.error);
        }
        setActionLoading(null);
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === comments.length && comments.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(comments.map(c => c.id!)));
        }
    };

    const handleBulkDelete = async () => {
        setIsBulkDeleting(true);
        const idsToDelete = Array.from(selectedIds);

        try {
            const result = await bulkDeleteComments(idsToDelete);

            if (result.success) {
                setComments(prev => prev.filter(c => !selectedIds.has(c.id)));
                setSelectedIds(new Set());
                setShowConfirmModal(false);
            } else {
                alert(result.error || "Failed to bulk delete comments.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while bulk deleting comments.");
        } finally {
            setIsBulkDeleting(false);
        }
    };

    if (loading) {
        return <div>Loading comments...</div>;
    }

    return (
        <div>
            <h1 className={styles.pageTitle}>Comment Moderation</h1>

            {selectedIds.size > 0 && (
                <div className={styles.bulkBarContainer}>
                    <div className={styles.bulkBar}>
                        <span className={styles.bulkCount}>
                            <CheckSquare size={16} />
                            {selectedIds.size} selected
                        </span>
                        <Button
                            variant="primary"
                            onClick={() => setShowConfirmModal(true)}
                            disabled={isBulkDeleting}
                            style={{ backgroundColor: '#dc2626' }}
                        >
                            {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedIds(new Set())}
                            style={{ color: '#64748b' }}
                        >
                            Clear selection
                        </Button>
                    </div>
                </div>
            )}

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.checkboxCell}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size === comments.length && comments.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
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
                                <td colSpan={6} className={styles.emptyState}>
                                    No comments found.
                                </td>
                            </tr>
                        ) : (
                            comments.map((comment) => (
                                <tr key={comment.id} style={selectedIds.has(comment.id) ? { backgroundColor: '#f8fafc' } : {}}>
                                    <td className={styles.checkboxCell}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(comment.id)}
                                            onChange={() => toggleSelect(comment.id)}
                                        />
                                    </td>
                                    <td>
                                        <strong>{comment.authorName}</strong>
                                    </td>
                                    <td>
                                        <div className={styles.commentContent}>
                                            {comment.content}
                                        </div>
                                    </td>
                                    <td>
                                        {toDate(comment.createdAt) ? format(toDate(comment.createdAt)!, "MMM d, yyyy h:mm a") : "Unknown"}
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

            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Confirm Bulk Deletion"
            >
                <div style={{ padding: '1rem 0' }}>
                    <p style={{ marginBottom: '1.5rem', color: '#475569' }}>
                        Are you sure you want to permanently delete {selectedIds.size} selected comment(s)? This cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isBulkDeleting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBulkDelete}
                            disabled={isBulkDeleting}
                            style={{ backgroundColor: '#dc2626' }}
                        >
                            {isBulkDeleting ? 'Deleting...' : 'Delete Permanently'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
