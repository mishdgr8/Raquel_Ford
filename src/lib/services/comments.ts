import { supabase } from "../supabase";

export interface Comment {
    id: string;
    articleId: string;
    authorName: string;
    content: string;
    createdAt: string;
}

const COMMENTS_TABLE = "comments";

const mapComment = (data: any): Comment => ({
    id: data.id,
    articleId: data.article_id,
    authorName: data.author_name,
    content: data.content,
    createdAt: data.created_at,
});

export const commentService = {
    async getCommentsByArticleId(articleId: string): Promise<Comment[]> {
        const { data, error } = await supabase
            .from(COMMENTS_TABLE)
            .select('*')
            .eq('article_id', articleId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapComment);
    },

    async addComment(articleId: string, authorName: string, content: string): Promise<string> {
        const { data, error } = await supabase
            .from(COMMENTS_TABLE)
            .insert([{
                article_id: articleId,
                author_name: authorName,
                content,
                created_at: new Date().toISOString(),
            }])
            .select()
            .single();

        if (error) throw error;
        return data.id;
    },

    async getAllComments(): Promise<Comment[]> {
        const { data, error } = await supabase
            .from(COMMENTS_TABLE)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapComment);
    },

    async deleteComment(commentId: string): Promise<void> {
        const { error } = await supabase
            .from(COMMENTS_TABLE)
            .delete()
            .eq('id', commentId);

        if (error) throw error;
    }
};
