"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/Button";

export default function UpdateTemplatePageV2() {
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const updateBlocks = async () => {
        setLoading(true);
        setStatus("Finding templates...");
        try {
            // 1. Find the active home template
            const q = query(collection(db, "templates"), where("pageType", "==", "home"), where("isActive", "==", true));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setStatus("No active home template found.");
                return;
            }

            const templateId = snapshot.docs[0].id;

            // 2. Find the BrandBanner block to get its orderIndex
            const blocksQ = query(collection(db, "blocks"), where("templateId", "==", templateId), where("blockType", "==", "BrandBanner"));
            const blocksSnap = await getDocs(blocksQ);

            if (blocksSnap.empty) {
                setStatus("BrandBanner block not found in active template.");
                return;
            }

            const brandBannerBlock = blocksSnap.docs[0].data();
            const newOrderIndex = (brandBannerBlock.orderIndex || 0) + 1;

            // 3. Add the new SimpleBanner block
            await addDoc(collection(db, "blocks"), {
                blockType: "SimpleBanner",
                templateId: templateId,
                orderIndex: newOrderIndex,
                configJson: {
                    title: "ADVERTISE WITH RAQUEL FORD",
                    backgroundColor: "#FFD447",
                    textColor: "#11001C"
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

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
            <p>This will add the "Advertise with Raquel Ford" banner below the Brand Banner.</p>
            <Button onClick={updateBlocks} disabled={loading}>
                {loading ? "Adding Banner..." : "Add Advertisement Banner"}
            </Button>
            <p>{status}</p>
        </div>
    );
}
