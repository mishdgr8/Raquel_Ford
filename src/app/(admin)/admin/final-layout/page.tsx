"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

export default function FinalUpdatePage() {
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const updateBlocks = async () => {
        setLoading(true);
        setStatus("Finding Ad banner...");
        try {
            // Find the SimpleBanner block that is an advertisement
            const { data: blocks, error } = await supabase
                .from('block_instances')
                .select('*')
                .eq('block_type', 'SimpleBanner');

            if (error) throw error;

            if (!blocks || blocks.length === 0) {
                setStatus("No SimpleBanner blocks found.");
                return;
            }

            let updatedCount = 0;
            for (const block of blocks) {
                if (block.config_json?.title === "ADVERTISE WITH RAQUEL FORD") {
                    const { error: uError } = await supabase
                        .from('block_instances')
                        .update({
                            config_json: {
                                ...block.config_json,
                                buttonText: "CONTACT US",
                                buttonLink: "mailto:momentswithraquel@gmail.com"
                            },
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', block.id);

                    if (!uError) updatedCount++;
                }
            }
            setStatus(`Successfully added contact button to ${updatedCount} ad banner(s) in Supabase.`);
        } catch (err: any) {
            setStatus("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Final Layout Update</h1>
            <p>This will add the "CONTACT ME" button to the Advertise banner on Supabase.</p>
            <Button onClick={updateBlocks} disabled={loading}>
                {loading ? "Updating..." : "Add Contact Button"}
            </Button>
            <p>{status}</p>
        </div>
    );
}
