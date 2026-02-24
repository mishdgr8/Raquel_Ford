"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/Button";

export default function FinalUpdatePage() {
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const updateBlocks = async () => {
        setLoading(true);
        setStatus("Finding Ad banner...");
        try {
            // Find the SimpleBanner block that is an advertisement
            const q = query(collection(db, "blocks"), where("blockType", "==", "SimpleBanner"));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setStatus("No SimpleBanner blocks found.");
                return;
            }

            let updatedCount = 0;
            for (const blockDoc of snapshot.docs) {
                const data = blockDoc.data();
                if (data.configJson?.title === "ADVERTISE WITH RAQUEL FORD") {
                    await updateDoc(doc(db, "blocks", blockDoc.id), {
                        configJson: {
                            ...data.configJson,
                            buttonText: "CONTACT US",
                            buttonLink: "mailto:momentswithraquel@gmail.com"
                        }
                    });
                    updatedCount++;
                }
            }
            setStatus(`Successfully added contact button to ${updatedCount} ad banner(s).`);
        } catch (err: any) {
            setStatus("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Final Layout Update</h1>
            <p>This will add the "CONTACT ME" button to the Advertise banner.</p>
            <Button onClick={updateBlocks} disabled={loading}>
                {loading ? "Updating..." : "Add Contact Button"}
            </Button>
            <p>{status}</p>
        </div>
    );
}
