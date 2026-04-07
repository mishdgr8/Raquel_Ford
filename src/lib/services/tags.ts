import { supabase } from "../supabase";
import { Tag } from "../types";

const TAGS_TABLE = "tags";

export const tagService = {
    async getTags() {
        const { data, error } = await supabase
            .from(TAGS_TABLE)
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data as Tag[];
    },

    async getTagBySlug(slug: string) {
        const { data, error } = await supabase
            .from(TAGS_TABLE)
            .select('*')
            .eq('slug', slug)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data as Tag | null;
    },

    async createTag(name: string, slug: string) {
        const { data, error } = await supabase
            .from(TAGS_TABLE)
            .insert([{ name, slug }])
            .select()
            .single();

        if (error) throw error;
        return data as Tag;
    },

    async updateTag(id: string, data: Partial<Tag>) {
        const { error } = await supabase
            .from(TAGS_TABLE)
            .update(data)
            .eq('id', id);

        if (error) throw error;
    },

    async deleteTag(id: string) {
        const { error } = await supabase
            .from(TAGS_TABLE)
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
