"use client";

import { useEffect, useState } from "react";
import { fetchRSS, RSSItem } from "@/lib/services/rss";
import styles from "./RSSFeed.module.css";

interface RSSFeedProps {
    url: string;
    title: string;
    limit?: number;
}

// Since fetchRSS is a server-side compatible function but we are calling it from a client component,
// we need to wrap it in a Server Action or API route if we want to bypass CORS.
// However, since we defined fetchRSS as a simple function, let's see if we can use it directly in a Server Component wrapper
// OR use a Next.js Server Action.

// Let's create a Server Action for this first.
// Actually, for simplicity in this flow, I'll create a separate server action file.
