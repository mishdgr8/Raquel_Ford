import { supabase } from "../supabase";
import { Article, ArticleStatus } from "../types";

const ARTICLES_TABLE = "articles";

// Cache category map to avoid repeated lookups
let categoryCache: Map<string, { name: string; slug: string }> | null = null;
let categoryCacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

async function getCategoryMap(): Promise<Map<string, { name: string; slug: string }>> {
    const now = Date.now();
    if (categoryCache && now - categoryCacheTime < CACHE_TTL) return categoryCache;

    const { data } = await supabase.from('categories').select('id, name, slug');
    const map = new Map<string, { name: string; slug: string }>();
    (data || []).forEach((c: any) => map.set(c.id, { name: c.name, slug: c.slug }));
    categoryCache = map;
    categoryCacheTime = now;
    return map;
}

const mapArticle = (data: any, catMap?: Map<string, { name: string; slug: string }>): Article => {
    const cat = catMap?.get(data.category_id);
    return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        contentHtml: data.content_html,
        contentJson: data.content_json,
        featuredImage: data.featured_image,
        coverMediaId: data.cover_media_id,
        categoryId: data.category_id,
        categoryName: cat?.name,
        categorySlug: cat?.slug,
        status: data.status as ArticleStatus,
        publishedAt: data.published_at,
        scheduledAt: data.scheduled_at,
        seoTitle: data.seo_title,
        seoDescription: data.seo_description,
        ogMediaId: data.og_media_id,
        isEditorsPick: data.is_editors_pick,
        isExploreTheMix: data.is_explore_the_mix,
        editorPickOrder: data.editor_pick_order,
        headingStyle: data.heading_style,
        tags: data.tags,
        tagSlugs: data.tag_slugs,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

const mapToDb = (data: Partial<Article>): any => {
    const mapped: any = { ...data };
    if (data.contentHtml !== undefined) mapped.content_html = data.contentHtml;
    if (data.contentJson !== undefined) mapped.content_json = data.contentJson;
    if (data.featuredImage !== undefined) mapped.featured_image = data.featuredImage;
    if (data.coverMediaId !== undefined) mapped.cover_media_id = data.coverMediaId;
    if (data.categoryId !== undefined) mapped.category_id = data.categoryId;
    if (data.publishedAt !== undefined) mapped.published_at = data.publishedAt;
    if (data.scheduledAt !== undefined) mapped.scheduled_at = data.scheduledAt;
    if (data.seoTitle !== undefined) mapped.seo_title = data.seoTitle;
    if (data.seoDescription !== undefined) mapped.seo_description = data.seoDescription;
    if (data.ogMediaId !== undefined) mapped.og_media_id = data.ogMediaId;
    if (data.isEditorsPick !== undefined) mapped.is_editors_pick = data.isEditorsPick;
    if (data.isExploreTheMix !== undefined) mapped.is_explore_the_mix = data.isExploreTheMix;
    if (data.editorPickOrder !== undefined) mapped.editor_pick_order = data.editorPickOrder;
    if (data.headingStyle !== undefined) mapped.heading_style = data.headingStyle;
    if (data.tagSlugs !== undefined) mapped.tag_slugs = data.tagSlugs;
    if (data.createdAt !== undefined) mapped.created_at = data.createdAt;
    if (data.updatedAt !== undefined) mapped.updated_at = data.updatedAt;

    // Remove camelCase versions to keep it clean for Supabase
    delete mapped.contentHtml;
    delete mapped.contentJson;
    delete mapped.featuredImage;
    delete mapped.coverMediaId;
    delete mapped.categoryId;
    delete mapped.publishedAt;
    delete mapped.scheduledAt;
    delete mapped.seoTitle;
    delete mapped.seoDescription;
    delete mapped.ogMediaId;
    delete mapped.isEditorsPick;
    delete mapped.isExploreTheMix;
    delete mapped.editorPickOrder;
    delete mapped.headingStyle;
    delete mapped.tagSlugs;
    delete mapped.createdAt;
    delete mapped.updatedAt;

    return mapped;
};

export const articleService = {
    // Public Fetch
    async getPublishedArticles(categoryId?: string, count: number = 10, offset: number = 0, tag?: string) {
        let query = supabase
            .from(ARTICLES_TABLE)
            .select('*', { count: 'exact' })
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .range(offset, offset + count - 1);

        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        if (tag) {
            query = query.contains('tag_slugs', [tag]);
        }

        const { data, error, count: totalCount } = await query;

        if (error) throw error;

        const catMap = await getCategoryMap();
        return {
            articles: (data || []).map(d => mapArticle(d, catMap)),
            totalCount
        };
    },

    async getAllPublishedArticles() {
        const { data, error } = await supabase
            .from(ARTICLES_TABLE)
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (error) throw error;
        const catMap = await getCategoryMap();
        return (data || []).map(d => mapArticle(d, catMap));
    },

    async getEditorsPicks() {
        const { data, error } = await supabase
            .from(ARTICLES_TABLE)
            .select('*')
            .eq('status', 'published')
            .eq('is_editors_pick', true)
            .order('editor_pick_order', { ascending: false })
            .order('published_at', { ascending: false })
            .limit(4);

        if (error) throw error;
        const catMap = await getCategoryMap();
        return (data || []).map(d => mapArticle(d, catMap));
    },

    async getExploreTheMix() {
        const { data, error } = await supabase
            .from(ARTICLES_TABLE)
            .select('*')
            .eq('status', 'published')
            .eq('is_explore_the_mix', true)
            .order('published_at', { ascending: false })
            .limit(6);

        if (error) throw error;
        const catMap = await getCategoryMap();
        return (data || []).map(d => mapArticle(d, catMap));
    },

    async getArticleBySlug(slug: string) {
        const { data, error } = await supabase
            .from(ARTICLES_TABLE)
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .order('published_at', { ascending: true })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!data) return null;
        const catMap = await getCategoryMap();
        return mapArticle(data, catMap);
    },

    // Admin CRUD
    async getAllArticles() {
        const { data, error } = await supabase
            .from(ARTICLES_TABLE)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        const catMap = await getCategoryMap();
        return (data || []).map(d => mapArticle(d, catMap));
    },

    async getArticleById(id: string) {
        const { data, error } = await supabase
            .from(ARTICLES_TABLE)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        const catMap = await getCategoryMap();
        return mapArticle(data, catMap);
    },

    async createArticle(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) {
        const mapped = mapToDb(data);
        const { data: newArticle, error } = await supabase
            .from(ARTICLES_TABLE)
            .insert([{
                ...mapped,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return newArticle.id;
    },

    async updateArticle(id: string, data: Partial<Article>) {
        const mapped = mapToDb(data);
        const { error } = await supabase
            .from(ARTICLES_TABLE)
            .update({
                ...mapped,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;
    },

    async deleteArticle(id: string) {
        const { error } = await supabase
            .from(ARTICLES_TABLE)
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async toggleEditorsPick(id: string, currentValue: boolean) {
        const { error } = await supabase
            .from(ARTICLES_TABLE)
            .update({
                is_editors_pick: !currentValue,
                editor_pick_order: currentValue ? null : 1, // Simplified order management
                updated_at: new Date().toISOString()
            })
            .eq('id', id);
        if (error) throw error;
    },

    async toggleExploreTheMix(id: string, currentValue: boolean) {
        const { error } = await supabase
            .from(ARTICLES_TABLE)
            .update({
                is_explore_the_mix: !currentValue,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;
    },

    async bulkUpdateStatus(ids: string[], status: ArticleStatus) {
        const { error } = await supabase
            .from(ARTICLES_TABLE)
            .update({ status, updated_at: new Date().toISOString() })
            .in('id', ids);

        if (error) throw error;
    },

    async softDeleteArticles(ids: string[]) {
        const { error } = await supabase
            .from(ARTICLES_TABLE)
            .update({ status: 'archived', updated_at: new Date().toISOString() })
            .in('id', ids);

        if (error) throw error;
    },

    async bulkHardDelete(ids: string[]) {
        const { error } = await supabase
            .from(ARTICLES_TABLE)
            .delete()
            .in('id', ids);

        if (error) throw error;
    }
};
