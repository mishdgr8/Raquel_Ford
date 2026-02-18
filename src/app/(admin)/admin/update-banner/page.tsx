"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/Button";

export default function UpdateTemplatePage() {
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const updateBlocks = async () => {
        setLoading(true);
        setStatus("Finding blocks...");
        try {
            // 1. Find the NewsletterSignup block that is part of a template
            const q = query(collection(db, "blocks"), where("blockType", "==", "NewsletterSignup"));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setStatus("No NewsletterSignup blocks found.");
                return;
            }

            let updatedCount = 0;
            for (const blockDoc of snapshot.docs) {
                // We only want to update the one on the homepage. 
                // In this simplified CMS, we check if it has the specific current title.
                const data = blockDoc.data();
                if (data.configJson?.title === "Stay in the loop" || data.templateId) {
                    await updateDoc(doc(db, "blocks", blockDoc.id), {
                        blockType: "BrandBanner",
                        configJson: {
                            title: "WE EMPOWER OUR,\nAUDIENCE TO LIVE\nTHEIR BEST LIVE"
                        }
                    });
                    updatedCount++;
                }
            }
            setStatus(`Successfully updated ${updatedCount} block(s) to BrandBanner.`);
        } catch (err: any) {
            setStatus("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Template Fixer</h1>
            <p>This will convert NewsletterSignup blocks to BrandBanner blocks on the homepage.</p>
            <Button onClick={updateBlocks} disabled={loading}>
                {loading ? "Updating..." : "Update Template Blocks"}
            </Button>
            <p>{status}</p>
        </div>
    );
}
