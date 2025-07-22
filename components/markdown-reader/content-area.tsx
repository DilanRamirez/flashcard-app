"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Menu,
  CheckCircle,
  Circle,
  BookmarkIcon,
  Highlighter,
  StickyNote,
  X,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import type { Chapter, StudyData, Highlight } from "@/types/study";
import "../../styles/markdown.css"; // Import custom markdown styles
import { generateChapterAIQuiz } from "@/lib/ai-quiz-generator";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Progress } from "@/components/ui/progress";

interface ContentAreaProps {
  chapter: Chapter | undefined;
  studyData: StudyData;
  onUpdateProgress: (chapterId: string, status: "reading" | "complete") => void;
  onAddHighlight: (
    chapterId: string,
    highlight: Omit<Highlight, "id" | "createdAt">,
  ) => void;
  onRemoveHighlight: (chapterId: string, highlightId: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onStartQuiz: (questions: any[]) => void;
  onToggleSidebar: () => void;
  onClose: () => void;
}

export const ContentArea = forwardRef<HTMLDivElement, ContentAreaProps>(
  (
    {
      chapter,
      studyData,
      onUpdateProgress,
      onAddHighlight,
      onRemoveHighlight,
      onToggleSidebar,
      onStartQuiz,
      onClose,
    },
    ref,
  ) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [selectedText, setSelectedText] = useState<{
      text: string;
      range: Range;
    } | null>(null);
    const [showHighlightPopover, setShowHighlightPopover] = useState(false);
    const [highlightNote, setHighlightNote] = useState("");
    const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiProgress, setProgress] = useState(0);
    const [status, setStatus] = useState("");
    const [errors, setErrors] = useState<string[]>([]);

    // Handle text selection
    useEffect(() => {
      const handleSelection = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !contentRef.current) {
          setShowHighlightPopover(false);
          setSelectedText(null);
          return;
        }

        const range = selection.getRangeAt(0);
        const text = selection.toString().trim();

        if (text.length < 3) return; // Ignore very short selections

        // Check if selection is within content area
        if (!contentRef.current.contains(range.commonAncestorContainer)) return;

        setSelectedText({ text, range });

        // Position popover near selection
        const rect = range.getBoundingClientRect();
        setPopoverPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 10,
        });
        setShowHighlightPopover(true);
      };

      document.addEventListener("mouseup", handleSelection);
      document.addEventListener("keyup", handleSelection);

      return () => {
        document.removeEventListener("mouseup", handleSelection);
        document.removeEventListener("keyup", handleSelection);
      };
    }, []);

    // Add highlight
    const handleAddHighlight = (withNote = false) => {
      if (!selectedText || !chapter) return;

      const highlight: Omit<Highlight, "id" | "createdAt"> = {
        text: selectedText.text,
        startPath: "", // Simplified - you might want to implement proper path tracking
        startOffset: 0,
        endPath: "",
        endOffset: selectedText.text.length,
        note: withNote ? highlightNote : "",
      };
      onAddHighlight(chapter.id, highlight);

      // Clear selection
      window.getSelection()?.removeAllRanges();
      setShowHighlightPopover(false);
      setSelectedText(null);
      setHighlightNote("");
    };

    // Remove highlight
    const handleRemoveHighlight = () => {
      if (!selectedText || !chapter) return;
      const highlightsList = studyData.highlights[chapter.id] || [];
      // Find the matching highlight by text
      const matching = highlightsList.find((h) => h.text === selectedText.text);
      if (!matching) return;

      // Invoke the removal callback
      onRemoveHighlight(chapter.id, matching.id);

      // Clear selection and popover state
      window.getSelection()?.removeAllRanges();
      setShowHighlightPopover(false);
      setSelectedText(null);
      setHighlightNote("");
    };

    const handleGenerateQuiz = async () => {
      if (!chapter) return;

      setIsGenerating(true);
      setProgress(0);
      setStatus("Initializing...");
      setErrors([]);

      try {
        // Generate new questions
        const result = await generateChapterAIQuiz(chapter, (prog, stat) => {
          setProgress(prog);
          setStatus(stat);
        });

        if (result.questions.length > 0) {
          setStatus("Quiz ready!");
          setTimeout(() => {
            onStartQuiz(result.questions);
          }, 500);
        } else {
          setErrors([
            "No questions were generated. Please try again or check your API configuration.",
          ]);
        }

        if (result.errors.length > 0) {
          setErrors(result.errors);
        }
      } catch (error) {
        console.error("AI Quiz generation failed:", error);
        setErrors([
          error instanceof Error ? error.message : "Unknown error occurred",
        ]);
      } finally {
        setIsGenerating(false);
      }
    };

    // Restore highlights in content
    useEffect(() => {
      if (!chapter || !contentRef.current) return;

      const highlights = studyData.highlights[chapter.id] || [];

      // Simple highlight restoration - wrap matching text
      highlights.forEach((highlight) => {
        const content = contentRef.current!;
        const walker = document.createTreeWalker(
          content,
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
            mark.className = "bg-yellow-200 cursor-pointer relative group";
            mark.setAttribute("data-highlight-id", highlight.id);
            mark.title = highlight.note || "Highlighted text";

            if (highlight.note) {
              mark.innerHTML = `${highlight.text}<span class="absolute bottom-full left-0 bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">${highlight.note}</span>`;
            }

            try {
              range.surroundContents(mark);
            } catch (e) {
              // Handle cases where range spans multiple elements
              console.warn("Could not restore highlight:", e);
            }
            break;
          }
        }
      });
    }, [chapter, studyData.highlights]);

    if (!chapter) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BookmarkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a chapter to start studying</p>
          </div>
        </div>
      );
    }

    const progress = studyData.progress[chapter.id];
    const isBookmarked = studyData.bookmarks[chapter.id];
    const highlights = studyData.highlights[chapter.id] || [];

    return (
      <div className="flex-1 flex flex-col relative overflow-auto">
        {/* Header */}
        <div className="border-b bg-white p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden flex-shrink-0 mt-1"
                onClick={onToggleSidebar}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold leading-tight">
                  {chapter.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge
                    variant={progress === "complete" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {progress === "complete"
                      ? "Complete"
                      : progress === "reading"
                        ? "Reading"
                        : "Not Started"}
                  </Badge>
                  {isBookmarked && (
                    <Badge variant="outline" className="text-xs">
                      <BookmarkIcon className="h-3 w-3 mr-1" />
                      Bookmarked
                    </Badge>
                  )}
                  {highlights.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Highlighter className="h-3 w-3 mr-1" />
                      {highlights.length}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant={progress === "reading" ? "default" : "outline"}
              size="sm"
              className="flex-shrink-0 text-xs sm:text-sm"
              onClick={() =>
                onUpdateProgress(
                  chapter.id,
                  progress === "reading" ? "complete" : "reading",
                )
              }
            >
              {progress === "complete" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Completed</span>
                  <span className="sm:hidden">Done</span>
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Mark Complete</span>
                  <span className="sm:hidden">Complete</span>
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleGenerateQuiz}>
              <Sparkles className="h-3 w-3 mr-1" />
              AI Quiz
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Progress */}

        {isGenerating && (
          <div ref={ref} className="flex-1">
            <div ref={contentRef} className="max-w-3xl mx-auto px-6 sm:mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 animate-spin text-primary" />
                      <span className="font-medium">
                        Generating AI Quiz Questions...
                      </span>
                    </div>
                    <Progress value={aiProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground">{status}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Errors */}

        {errors.length > 0 && (
          <div ref={ref} className="flex-1">
            <div ref={contentRef} className="max-w-3xl mx-auto px-6 sm:mt-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {errors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {/* Content */}
        <div ref={ref} className="flex-1">
          <div
            ref={contentRef}
            className="max-w-3xl mx-auto px-6 py-8 sm:py-10 prose prose-base sm:prose-lg prose-headings:mt-6 prose-headings:mb-2 prose-p:leading-relaxed prose-p:mt-2 prose-p:mb-4 prose-ul:mt-2 prose-ul:mb-4 prose-li:leading-relaxed prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:text-gray-600"
            dangerouslySetInnerHTML={{ __html: chapter.content }}
          />
        </div>

        {/* Highlight Popover */}
        {showHighlightPopover && selectedText && (
          <div
            className="fixed bg-white border rounded-lg shadow-lg p-3 z-50 w-72 sm:min-w-64 max-w-[calc(100vw-2rem)]"
            style={{
              left: Math.min(
                Math.max(16, popoverPosition.x - 144),
                window.innerWidth - 288 - 16,
              ),
              top:
                popoverPosition.y + 10 > window.innerHeight - 200
                  ? popoverPosition.y - 200
                  : popoverPosition.y + 10,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Highlight Text</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowHighlightPopover(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {selectedText.text}
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleAddHighlight(false)}
                >
                  <Highlighter className="h-4 w-4 mr-2" />
                  Highlight
                </Button>

                <Button
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleRemoveHighlight()}
                >
                  <Highlighter className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Add a note (optional)"
                  value={highlightNote}
                  onChange={(e) => setHighlightNote(e.target.value)}
                  className="text-xs"
                  rows={2}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleAddHighlight(true)}
                >
                  <StickyNote className="h-4 w-4 mr-2" />
                  Highlight + Note
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

ContentArea.displayName = "ContentArea";
