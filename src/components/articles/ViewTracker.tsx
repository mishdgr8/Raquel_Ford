"use client";

import { useEffect, useRef } from "react";
import { analyticsService } from "@/lib/services/analytics";

interface ViewTrackerProps {
    articleId: string;
}

export function ViewTracker({ articleId }: ViewTrackerProps) {
    const tracked = useRef(false);

    useEffect(() => {
        if (!tracked.current && articleId) {
            tracked.current = true;
            analyticsService.trackView(articleId);
        }
    }, [articleId]);

    return null; // Invisible component
}
