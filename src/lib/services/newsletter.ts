import { supabase } from "../supabase";
import { NewsletterSubscriber } from "../types";

const SUBSCRIBERS_TABLE = "newsletter_subscribers";

const mapSubscriber = (data: any): NewsletterSubscriber => ({
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    status: data.status,
    source: data.source,
    createdAt: data.created_at,
});

export const newsletterService = {
    async subscribe(email: string, firstName?: string, source: string = 'unknown') {
        const { data, error } = await supabase
            .from(SUBSCRIBERS_TABLE)
            .insert([{
                email,
                first_name: firstName,
                source,
                status: 'pending',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data.id;
    },

    async getSubscribers() {
        const { data, error } = await supabase
            .from(SUBSCRIBERS_TABLE)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapSubscriber);
    }
};
