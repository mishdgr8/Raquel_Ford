"use server";

import { commentService, Comment } from "@/lib/services/comments";
import { revalidatePath } from "next/cache";

export async function getArticleComments(articleId: string): Promise<Comment[]> {
    try {
        return await commentService.getCommentsByArticleId(articleId);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
}

export async function postComment(articleId: string, authorName: string, content: string) {
    if (!articleId || !authorName || !content) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        await commentService.addComment(articleId, authorName, content);
        revalidatePath(`/articles/[slug]`);
        return { success: true };
    } catch (error) {
        console.error("Error posting comment:", error);
        return { success: false, error: "Failed to post comment" };
    }
}

export async function getAllComments(): Promise<Comment[]> {
    try {
        return await commentService.getAllComments();
    } catch (error) {
        console.error("Error fetching all comments:", error);
        return [];
    }
}

export async function deleteComment(commentId: string) {
    if (!commentId) return { success: false, error: "Missing comment ID" };

    try {
        await commentService.deleteComment(commentId);
        // We revalidate the main layout or comments page
        revalidatePath('/admin/comments');
        return { success: true };
    } catch (error) {
        console.error("Error deleting comment:", error);
        return { success: false, error: "Failed to delete comment" };
    }
}
