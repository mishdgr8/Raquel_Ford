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
            // 1. Find the BrandBanner and NewsletterSignup blocks
            const { data: blocks, error } = await supabase
                .from('block_instances')
                .select('*')
                .in('block_type', ['BrandBanner', 'NewsletterSignup']);

            if (error) throw error;

            if (!blocks || blocks.length === 0) {
                setStatus("No matching blocks found.");
                return;
            }

            let updatedCount = 0;
            for (const block of blocks) {
                const currentTitle = block.config_json?.title || "";
                if (currentTitle.includes("EMPOWER OUR")) {
                    const newTitle = "WE EMPOWER OUR\nAUDIENCE TO LIVE\nTHEIR BEST LIVE";

                    const { error: uError } = await supabase
                        .from('block_instances')
                        .update({
                            config_json: {
                                ...block.config_json,
                                title: newTitle
                            },
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', block.id);

                    if (!uError) updatedCount++;
                }
            }
            setStatus(`Successfully updated ${updatedCount} block(s) in Supabase.`);
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
