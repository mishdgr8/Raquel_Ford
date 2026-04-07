"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

export default function UpdateTemplatePage() {
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const updateBlocks = async () => {
        setLoading(true);
        setStatus("Finding blocks...");
        try {
            // 1. Find the NewsletterSignup blocks
            const { data: blocks, error } = await supabase
                .from('block_instances')
                .select('*')
                .eq('block_type', 'NewsletterSignup');

            if (error) throw error;

            if (!blocks || blocks.length === 0) {
                setStatus("No NewsletterSignup blocks found.");
                return;
            }

            let updatedCount = 0;
            for (const block of blocks) {
                if (block.config_json?.title === "Stay in the loop" || block.template_id) {
                    const { error: uError } = await supabase
                        .from('block_instances')
                        .update({
                            block_type: "BrandBanner",
                            config_json: {
                                title: "WE EMPOWER OUR,\nAUDIENCE TO LIVE\nTHEIR BEST LIVE"
                            },
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', block.id);

                    if (!uError) updatedCount++;
                }
            }
            setStatus(`Successfully updated ${updatedCount} block(s) to BrandBanner in Supabase.`);
        } catch (err: any) {
            setStatus("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Supabase Template Fixer</h1>
            <p>This will convert NewsletterSignup blocks to BrandBanner blocks on the homepage.</p>
            <Button onClick={updateBlocks} disabled={loading}>
                {loading ? "Updating..." : "Update Template Blocks"}
            </Button>
            <p>{status}</p>
        </div>
    );
}
