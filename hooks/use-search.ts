"use client";

import { useState, useEffect, useMemo } from "react";
import type { Chapter, SearchResult } from "@/types/study";

export function useSearch(chapters: Chapter[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Build search index
  const searchIndex = useMemo(() => {
    const index: Array<{
      chapterId: string;
      chapterTitle: string;
      content: string;
      snippets: string[];
    }> = [];

    chapters.forEach((chapter) => {
      // Remove HTML tags for searching
      const textContent = chapter.content
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Create snippets (sentences or paragraphs)
      const snippets = textContent
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 20);

      index.push({
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        content: textContent,
        snippets,
      });
    });

    return index;
  }, [chapters]);

  // Perform search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    searchIndex.forEach((item) => {
      // Search in title
      if (item.chapterTitle.toLowerCase().includes(term)) {
        results.push({
          chapterId: item.chapterId,
          chapterTitle: item.chapterTitle,
          snippet: item.chapterTitle,
          relevance: 10, // Higher relevance for title matches
        });
      }

      // Search in content snippets
      item.snippets.forEach((snippet) => {
        if (snippet.toLowerCase().includes(term)) {
          // Create highlighted snippet
          const index = snippet.toLowerCase().indexOf(term);
          const start = Math.max(0, index - 50);
          const end = Math.min(snippet.length, index + term.length + 50);
          let contextSnippet = snippet.slice(start, end);

          if (start > 0) contextSnippet = "..." + contextSnippet;
          if (end < snippet.length) contextSnippet = contextSnippet + "...";

          results.push({
            chapterId: item.chapterId,
            chapterTitle: item.chapterTitle,
            snippet: contextSnippet,
            relevance: 5,
          });
        }
      });
    });

    // Sort by relevance and remove duplicates
    const uniqueResults = results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 20); // Limit results

    setSearchResults(uniqueResults);
  }, [searchTerm, searchIndex]);

  const searchInContent = (term: string) => {
    setSearchTerm(term);
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    searchInContent,
  };
}
