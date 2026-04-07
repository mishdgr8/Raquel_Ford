import { supabase } from "../supabase";
import { Media } from "../types";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dowyjfruh";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

const MEDIA_TABLE = "media";

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

export const mediaService = {
    async getMedia() {
        const { data, error } = await supabase
            .from(MEDIA_TABLE)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Media[];
    },

    async uploadMedia(
        file: File,
        folder: string = "uploads",
        meta: { altText?: string; title?: string; caption?: string; description?: string } = {}
    ) {
        try {
            console.log(`Starting Cloudinary upload for ${file.name}...`);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);
            formData.append('folder', folder);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Cloudinary upload failed');
            }

            const data = await response.json();
            const url = data.secure_url;
            const path = data.public_id;

            console.log("Cloudinary upload success, saving to Supabase...");

            // 2. Save metadata to Supabase
            const baseName = file.name.replace(/\.[^/.]+$/, "");
            const { data: newMedia, error: dbError } = await supabase
                .from(MEDIA_TABLE)
                .insert([{
                    url,
                    path,
                    name: file.name,
                    file_name: file.name,
                    type: file.type,
                    size: file.size,
                    extension: file.name.split('.').pop() || "",
                    alt_text: meta.altText || "",
                    title: meta.title || baseName,
                    caption: meta.caption || "",
                    description: meta.description || "",
                    slug: slugify(baseName),
                    created_at: new Date().toISOString(),
                }])
                .select()
                .single();

            if (dbError) throw dbError;

            console.log("Supabase metadata saved successfully.");
            return { id: newMedia.id, url, path };
        } catch (error: any) {
            console.error("Upload failed in mediaService:", {
                message: error.message,
                fullError: error
            });
            throw error;
        }
    },

    async updateMediaMeta(id: string, meta: Partial<Pick<Media, 'altText' | 'title' | 'caption' | 'description'>>) {
        // Map camelCase to snake_case for Supabase
        const dbMeta: any = {};
        if (meta.altText !== undefined) dbMeta.alt_text = meta.altText;
        if (meta.title !== undefined) dbMeta.title = meta.title;
        if (meta.caption !== undefined) dbMeta.caption = meta.caption;
        if (meta.description !== undefined) dbMeta.description = meta.description;

        const { error } = await supabase
            .from(MEDIA_TABLE)
            .update(dbMeta)
            .eq('id', id);

        if (error) throw error;
    },

    async deleteMedia(id: string, path: string) {
        const { error } = await supabase
            .from(MEDIA_TABLE)
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async bulkDeleteMedia(items: Pick<Media, 'id' | 'path'>[]) {
        const ids = items.map(i => i.id).filter(id => id !== undefined) as string[];
        const { error } = await supabase
            .from(MEDIA_TABLE)
            .delete()
            .in('id', ids);

        if (error) throw error;
    }
};
