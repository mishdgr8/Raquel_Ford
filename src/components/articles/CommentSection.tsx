"use client";

import { useState, useEffect } from "react";
import { getArticleComments, postComment } from "@/app/actions/comments";
import { Comment } from "@/lib/services/comments";
import styles from "./CommentSection.module.css";
import { formatDistanceToNow } from "date-fns";
import { toDate } from "@/lib/utils";

interface CommentSectionProps {
    articleId: string;
}

export function CommentSection({ articleId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [authorName, setAuthorName] = useState("");
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (articleId) {
            loadComments();
        }
    }, [articleId]);

    const loadComments = async () => {
        const data = await getArticleComments(articleId);
        setComments(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authorName.trim() || !content.trim()) return;

        setSubmitting(true);
        setMessage(null);

        const result = await postComment(articleId, authorName, content);

        if (result.success) {
            setAuthorName("");
            setContent("");
            setMessage({ type: 'success', text: 'Comment posted successfully!' });
            loadComments();
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to post comment.' });
        }
        setSubmitting(false);
    };

    return (
        <section className={styles.container}>
            <h3 className={styles.sectionTitle}>Comments ({comments.length})</h3>

            {/* Comment Form */}
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <textarea
                        placeholder="Write a comment..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={styles.textarea}
                        rows={4}
                        required
                    />
                </div>
                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}
                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={submitting}
                >
                    {submitting ? "Posting..." : "Post Comment"}
                </button>
            </form>

            {/* Comment List */}
            <div className={styles.list}>
                {comments.length === 0 ? (
                    <p className={styles.noComments}>No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className={styles.comment}>
                            <div className={styles.commentHeader}>
                                <span className={styles.author}>{comment.authorName}</span>
                                <span className={styles.date}>
                                    {toDate(comment.createdAt) ? formatDistanceToNow(toDate(comment.createdAt)!, { addSuffix: true }) : 'Just now'}
                                </span>
                            </div>
                            <p className={styles.content}>{comment.content}</p>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
