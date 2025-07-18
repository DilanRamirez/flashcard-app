"use client";

import { useCallback } from "react";
import type { StudyData, Highlight } from "@/types/study";

export function useHighlighting(
  studyData: StudyData,
  setStudyData: (data: StudyData | ((prev: StudyData) => StudyData)) => void,
) {
  const addHighlight = useCallback(
    (chapterId: string, highlight: Omit<Highlight, "id" | "createdAt">) => {
      const newHighlight: Highlight = {
        ...highlight,
        id: `hl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
      };

      setStudyData((prev) => ({
        ...prev,
        highlights: {
          ...prev.highlights,
          [chapterId]: [...(prev.highlights[chapterId] || []), newHighlight],
        },
      }));
    },
    [setStudyData],
  );

  const removeHighlight = useCallback(
    (chapterId: string, highlightId: string) => {
      setStudyData((prev) => ({
        ...prev,
        highlights: {
          ...prev.highlights,
          [chapterId]: (prev.highlights[chapterId] || []).filter(
            (h) => h.id !== highlightId,
          ),
        },
      }));
    },
    [setStudyData],
  );

  const restoreHighlights = useCallback(
    (chapterId: string, container: HTMLElement) => {
      const highlights = studyData.highlights[chapterId] || [];

      highlights.forEach((highlight) => {
        // Simple text-based highlighting restoration
        const walker = document.createTreeWalker(
          container,
          NodeFilter.SHOW_TEXT,
          null,
        );

        let node;
        while ((node = walker.nextNode())) {
          const text = node.textContent || "";
          const index = text.indexOf(highlight.text);

          if (index !== -1) {
            const range = document.createRange();
            range.setStart(node, index);
            range.setEnd(node, index + highlight.text.length);

            const mark = document.createElement("mark");
            mark.className = "bg-yellow-200 cursor-pointer";
            mark.setAttribute("data-highlight-id", highlight.id);
            mark.title = highlight.note || "Highlighted text";

            try {
              range.surroundContents(mark);
            } catch (e) {
              console.warn("Could not restore highlight:", e);
            }
            break;
          }
        }
      });
    },
    [studyData.highlights],
  );

  return { addHighlight, removeHighlight, restoreHighlights };
}
