"use client";

import { useEffect, useState } from "react";
import { articleService } from "@/lib/services/articles";
import { Article, ArticleStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";
import { Plus, Edit, Trash2, ExternalLink, Star, Archive, Send, CheckSquare } from "lucide-react";
import styles from "./ArticleList.module.css";
import { formatDate } from "@/lib/utils";

type FilterStatus = 'all' | ArticleStatus;

export default function ArticleListPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkAction, setBulkAction] = useState<string>('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ action: string; ids: string[] } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchQuery]);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const data = await articleService.getAllArticles();
            const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
            setArticles(uniqueData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Filtered articles
    let filtered = filter === 'all'
        ? articles
        : articles.filter(a => a.status === filter);

    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(a =>
            (a.title || '').toLowerCase().includes(query) ||
            (a.slug || '').toLowerCase().includes(query)
        );
    }

    const filteredArticles = filtered;

    // Pagination
    const itemsPerPage = 30;
    const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
    const paginatedArticles = filteredArticles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Counts per status
    const counts = {
        all: articles.length,
        published: articles.filter(a => a.status === 'published').length,
        draft: articles.filter(a => a.status === 'draft').length,
        archived: articles.filter(a => a.status === 'archived').length,
    };

    // Selection
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredArticles.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredArticles.map(a => a.id!)));
        }
    };

    // Bulk Actions
    const executeBulkAction = async () => {
        if (!pendingAction) return;
        const { action, ids } = pendingAction;
        try {
            switch (action) {
                case 'publish':
                    await articleService.bulkUpdateStatus(ids, 'published');
                    break;
                case 'draft':
                    await articleService.bulkUpdateStatus(ids, 'draft');
                    break;
                case 'archive':
                    await articleService.softDeleteArticles(ids);
                    break;
                case 'delete':
                    await articleService.bulkHardDelete(ids);
                    break;
            }
            setSelectedIds(new Set());
            setPendingAction(null);
            setShowConfirm(false);
            await fetchArticles();
        } catch (err) {
            console.error('Bulk action failed:', err);
            alert('Bulk action failed. Please try again.');
        }
    };

    const handleBulkApply = () => {
        if (!bulkAction || selectedIds.size === 0) return;
        const ids = Array.from(selectedIds);
        setPendingAction({ action: bulkAction, ids });
        setShowConfirm(true);
    };

    // Single actions
    const handleDelete = async (id: string) => {
        setPendingAction({ action: 'delete', ids: [id] });
        setShowConfirm(true);
    };

    const handleTogglePin = async (article: Article) => {
        try {
            await articleService.toggleEditorsPick(article.id!, article.isEditorsPick || false);
            await fetchArticles();
        } catch (err) {
            console.error('Toggle pin failed:', err);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading articles...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Articles</h1>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search title or slug..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                paddingLeft: '2.2rem',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.875rem',
                                width: '220px',
                                outline: 'none'
                            }}
                        />
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </span>
                    </div>
                    <Link href="/admin/articles/import">
                        <Button variant="outline" className={styles.addBtn}>
                            <ExternalLink size={16} />
                            <span>Import</span>
                        </Button>
                    </Link>
                    <Link href="/admin/articles/new">
                        <Button className={styles.addBtn}>
                            <Plus size={16} />
                            <span>New Article</span>
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Status Filter Tabs */}
            <div className={styles.filterTabs}>
                {(['all', 'published', 'draft', 'archived'] as FilterStatus[]).map(status => (
                    <button
                        key={status}
                        className={`${styles.filterTab} ${filter === status ? styles.filterTabActive : ''}`}
                        onClick={() => { setFilter(status); setSelectedIds(new Set()); }}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        <span className={styles.filterCount}>{counts[status as keyof typeof counts] || 0}</span>
                    </button>
                ))}
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className={styles.bulkBar}>
                    <span className={styles.bulkCount}>
                        <CheckSquare size={16} />
                        {selectedIds.size} selected
                    </span>
                    <select
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value)}
                        className={styles.bulkSelect}
                    >
                        <option value="">Bulk Actions</option>
                        <option value="publish">Publish</option>
                        <option value="draft">Move to Draft</option>
                        <option value="archive">Archive (Soft Delete)</option>
                        <option value="delete">Delete Permanently</option>
                    </select>
                    <Button
                        variant="outline"
                        onClick={handleBulkApply}
                        disabled={!bulkAction}
                        className={styles.bulkApplyBtn}
                    >
                        Apply
                    </Button>
                </div>
            )}

            {/* Articles Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={filteredArticles.length > 0 && selectedIds.size === filteredArticles.length}
                                    onChange={toggleSelectAll}
                                    style={{ cursor: 'pointer' }}
                                />
                            </th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Tags</th>
                            <th style={{ width: '40px' }}>⭐</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedArticles.map((article) => (
                            <tr key={article.id} className={selectedIds.has(article.id!) ? styles.selectedRow : ''}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(article.id!)}
                                        onChange={() => toggleSelect(article.id!)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </td>
                                <td className={styles.titleCell}>
                                    <strong>{article.title || '(Untitled)'}</strong>
                                    <span className={styles.slug}>/{article.slug}</span>
                                </td>
                                <td>{article.categoryId}</td>
                                <td>
                                    <span className={`${styles.badge} ${styles[article.status]}`}>
                                        {article.status}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.tagsListInline}>
                                        {(article.tags || []).slice(0, 3).map((tag, i) => (
                                            <span key={i} className={styles.tagBadgeSmall}>{tag}</span>
                                        ))}
                                        {(article.tags || []).length > 3 && (
                                            <span className={styles.tagMore}>+{(article.tags || []).length - 3}</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <button
                                        className={`${styles.pinBtn} ${article.isEditorsPick ? styles.pinned : ''}`}
                                        onClick={() => handleTogglePin(article)}
                                        title={article.isEditorsPick ? "Unpin from Editor's Pick" : "Pin as Editor's Pick"}
                                    >
                                        <Star size={16} fill={article.isEditorsPick ? '#f59e0b' : 'none'} />
                                    </button>
                                </td>
                                <td>{formatDate(article.createdAt)}</td>
                                <td className={styles.actions}>
                                    <Link href={`/admin/articles/edit/${article.id}`} title="Edit">
                                        <Edit size={16} />
                                    </Link>
                                    <Link href={`/articles/${article.slug}`} target="_blank" title="View">
                                        <ExternalLink size={16} />
                                    </Link>
                                    <button onClick={() => handleDelete(article.id!)} title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {paginatedArticles.length === 0 && (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                    No articles found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem', paddingBottom: '2rem' }}>
                    <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                        Previous
                    </Button>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirm}
                onClose={() => { setShowConfirm(false); setPendingAction(null); }}
                title="Confirm Action"
            >
                <div style={{ padding: '1rem 0' }}>
                    <p style={{ marginBottom: '1.5rem', color: '#475569' }}>
                        {pendingAction?.action === 'delete'
                            ? `Are you sure you want to permanently delete ${pendingAction.ids.length} article(s)? This cannot be undone.`
                            : `Apply "${pendingAction?.action}" to ${pendingAction?.ids.length} article(s)?`}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <Button variant="outline" onClick={() => { setShowConfirm(false); setPendingAction(null); }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={executeBulkAction}
                            style={pendingAction?.action === 'delete' ? { backgroundColor: '#dc2626' } : {}}
                        >
                            {pendingAction?.action === 'delete' ? 'Delete Permanently' : 'Confirm'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
