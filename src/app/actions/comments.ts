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
