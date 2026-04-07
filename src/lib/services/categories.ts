import { supabase } from "../supabase";
import { Category } from "../types";

const CATEGORIES_TABLE = "categories";

const mapCategory = (data: any): Category => ({
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    image: data.image,
    order: data.order_index || data.order,
    isMain: data.is_main,
});

const mapToDb = (data: Partial<Category>): any => {
    const mapped: any = { ...data };
    if (data.order !== undefined) {
        mapped.order_index = data.order;
        delete mapped.order;
    }
    if (data.isMain !== undefined) {
        mapped.is_main = data.isMain;
        delete mapped.isMain;
    }
    return mapped;
};

export const categoryService = {
    async getCategories() {
        const { data, error } = await supabase
            .from(CATEGORIES_TABLE)
            .select('*')
            .order('order_index', { ascending: true });

        if (error) throw error;
        return (data || []).map(mapCategory);
    },

    async getCategoryBySlug(slug: string) {
        const { data, error } = await supabase
            .from(CATEGORIES_TABLE)
            .select('*')
            .eq('slug', slug)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data ? mapCategory(data) : null;
    },

    async createCategory(data: Omit<Category, 'id'>) {
        const mapped = mapToDb(data);
        const { data: newCat, error } = await supabase
            .from(CATEGORIES_TABLE)
            .insert([mapped])
            .select()
            .single();

        if (error) throw error;
        return newCat.id;
    },

    async updateCategory(id: string, data: Partial<Category>) {
        const mapped = mapToDb(data);
        const { error } = await supabase
            .from(CATEGORIES_TABLE)
            .update(mapped)
            .eq('id', id);

        if (error) throw error;
    },

    async deleteCategory(id: string) {
        const { error } = await supabase
            .from(CATEGORIES_TABLE)
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
