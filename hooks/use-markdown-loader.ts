"use client";

import { useState, useEffect } from "react";

export function useMarkdownLoader(path: string) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMarkdown = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(path);
        console.log(`Fetching markdown from: ${path}`);
        if (!response.ok) {
          throw new Error(
            `Failed to load markdown: ${response.status} ${response.statusText}`,
          );
        }

        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, [path]);

  return { content, loading, error };
}
