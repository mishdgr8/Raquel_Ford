import { supabase } from "../supabase";
import { PageTemplate, BlockInstance } from "../types";

const TEMPLATES_TABLE = "page_templates";
const BLOCKS_TABLE = "block_instances";

// Table may not exist yet — gracefully return null/empty
const isTableMissing = (error: any) =>
    error?.code === 'PGRST205' || error?.code === '42P01';

const mapTemplate = (data: any): PageTemplate => ({
    id: data.id,
    pageType: data.page_type,
    name: data.name,
    isActive: data.is_active,
    blocks: [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
});

const mapBlock = (data: any): BlockInstance => ({
    id: data.id,
    templateId: data.template_id,
    blockType: data.block_type,
    configJson: data.config_json,
    orderIndex: data.order_index,
});

export const templateService = {
    async getTemplates() {
        const { data, error } = await supabase
            .from(TEMPLATES_TABLE)
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            if (isTableMissing(error)) return [];
            throw error;
        }
        return (data || []).map(mapTemplate);
    },

    async getTemplateById(id: string) {
        const { data: template, error: tError } = await supabase
            .from(TEMPLATES_TABLE)
            .select('*')
            .eq('id', id)
            .single();

        if (tError) {
            if (isTableMissing(tError)) return null;
            throw tError;
        }

        const { data: blocks, error: bError } = await supabase
            .from(BLOCKS_TABLE)
            .select('*')
            .eq('template_id', id)
            .order('order_index', { ascending: true });

        if (bError && !isTableMissing(bError)) throw bError;

        const mapped = mapTemplate(template);
        mapped.blocks = (blocks || []).map(mapBlock);
        return mapped;
    },

    async getActiveTemplate(pageType: 'home' | 'category' | 'article') {
        const { data, error } = await supabase
            .from(TEMPLATES_TABLE)
            .select('*')
            .eq('page_type', pageType)
            .eq('is_active', true)
            .limit(1)
            .single();

        if (error) {
            if (isTableMissing(error) || error.code === 'PGRST116') return null;
            throw error;
        }
        if (!data) return null;

        // Now fetch the blocks for this template
        const template = mapTemplate(data);

        const { data: blocks, error: bError } = await supabase
            .from(BLOCKS_TABLE)
            .select('*')
            .eq('template_id', template.id)
            .order('order_index', { ascending: true });

        if (!bError && blocks) {
            template.blocks = blocks.map(mapBlock);
        }

        return template;
    },

    async createTemplate(data: Partial<PageTemplate>) {
        const { data: template, error } = await supabase
            .from(TEMPLATES_TABLE)
            .insert([{
                page_type: data.pageType,
                name: data.name,
                is_active: data.isActive ?? false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return mapTemplate(template);
    },

    async updateTemplate(id: string, data: Partial<PageTemplate>) {
        const mapped: any = {};
        if (data.name !== undefined) mapped.name = data.name;
        if (data.pageType !== undefined) mapped.page_type = data.pageType;
        if (data.isActive !== undefined) mapped.is_active = data.isActive;
        mapped.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from(TEMPLATES_TABLE)
            .update(mapped)
            .eq('id', id);

        if (error) throw error;
    },

    async deleteTemplate(id: string) {
        await supabase.from(BLOCKS_TABLE).delete().eq('template_id', id);
        const { error } = await supabase
            .from(TEMPLATES_TABLE)
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
