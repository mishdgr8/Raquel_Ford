"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

export default function UpdateTemplatePageV2() {
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const updateBlocks = async () => {
        setLoading(true);
        setStatus("Finding templates...");
        try {
            // 1. Find the active home template
            const { data: templates, error: tError } = await supabase
                .from('page_templates')
                .select('id')
                .eq('page_type', 'home')
                .eq('is_active', true)
                .single();

            if (tError || !templates) {
                setStatus("No active home template found.");
                return;
            }

            const templateId = templates.id;

            // 2. Find the BrandBanner block to get its order_index
            const { data: blocks, error: bError } = await supabase
                .from('block_instances')
                .select('*')
                .eq('template_id', templateId)
                .eq('block_type', 'BrandBanner')
                .single();

            if (bError || !blocks) {
                setStatus("BrandBanner block not found in active template.");
                return;
            }

            const newOrderIndex = (blocks.order_index || 0) + 1;

            // 3. Add the new SimpleBanner block
            const { error: iError } = await supabase
                .from('block_instances')
                .insert([{
                    block_type: "SimpleBanner",
                    template_id: templateId,
                    order_index: newOrderIndex,
                    config_json: {
                        title: "ADVERTISE WITH RAQUEL FORD",
                        backgroundColor: "#FFD447",
                        textColor: "#11001C"
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }]);

            if (iError) throw iError;

            setStatus(`Successfully added Ad banner below BrandBanner in template ${templateId}.`);
        } catch (err: any) {
            setStatus("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Homepage Refinement Util</h1>
            <p>This will add the "Advertise with Raquel Ford" banner below the Brand Banner on the Supabase DB.</p>
            <Button onClick={updateBlocks} disabled={loading}>
                {loading ? "Adding Banner..." : "Add Advertisement Banner"}
            </Button>
            <p>{status}</p>
        </div>
    );
}
