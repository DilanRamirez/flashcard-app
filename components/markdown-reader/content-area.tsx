"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { useWithSpeech } from "@/hooks/use-with-speech";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Circle,
  BookmarkIcon,
  Highlighter,
  Sparkles,
  AlertCircle,
  Menu,
  Play,
  Pause,
  StopCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import type { Chapter, StudyData, Highlight } from "@/types/study";
import "../../styles/markdown.css"; // Import custom markdown styles
import { generateChapterAIQuiz } from "@/lib/ai-quiz-generator";
import { Card, CardContent } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { prepareChapterForSpeech } from "@/lib/utils";
import { NoteAdd, PlayArrow } from "@mui/icons-material";

interface ContentAreaProps {
  chapter: Chapter | undefined;
  studyData: StudyData;
  themeClasses: string;
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
  onNextChapter: () => void;
  onPreviousChapter: () => void;
}

export const ContentArea = forwardRef<HTMLDivElement, ContentAreaProps>(
  (
    {
      chapter,
      studyData,
      themeClasses,
      onUpdateProgress,
      onToggleSidebar,
      onStartQuiz,
      onClose,
      onNextChapter,
      onPreviousChapter,
    },
    ref,
  ) => {
    const contentRef = useRef<HTMLDivElement>(null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [aiProgress, setProgress] = useState(0);
    const [status, setStatus] = useState("");
    const [errors, setErrors] = useState<string[]>([]);

    // Chapter notes
    const [note, setNote] = useState<string>("");
    // Note editor UI state
    const [showNoteEditor, setShowNoteEditor] = useState(false);
    const [noteEditorValue, setNoteEditorValue] = useState<string>("");

    // Speech integration
    const {
      synthesisSupported,
      speaking,
      paused,
      speak,
      pauseSpeaking,
      resumeSpeaking,
      cancelSpeaking,
    } = useWithSpeech();

    // Load note from localStorage
    useEffect(() => {
      if (!chapter) return;
      const saved = localStorage.getItem(`notes_${chapter.id}`) || "";
      setNote(saved);
    }, [chapter]);

    // Open note editor
    const handleAddNotes = () => {
      if (!chapter) return;
      setNoteEditorValue(note);
      setShowNoteEditor(true);
    };

    const handleSaveNotes = () => {
      if (!chapter) return;
      localStorage.setItem(`notes_${chapter.id}`, noteEditorValue);
      setNote(noteEditorValue);
      setShowNoteEditor(false);
    };

    const handleCancelNotes = () => {
      setShowNoteEditor(false);
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
      <div
        className={`flex-1 flex flex-col relative overflow-auto p-relative ${themeClasses}`}
      >
        {/* Header */}
        <div className={`border-b p-3 sm:p-4 ${themeClasses}`}>
          <div className="flex-col justify-center align-center">
            <div className="flex items-center justify-left gap-3 min-w-0 flex-1 mb-2">
              <div className="flex items-center justify-left gap-3 flex-1 min-w-0 mb-2">
                <h1 className="text-lg sm:text-xl font-semibold leading-tight">
                  {chapter.title}
                </h1>

                <Badge
                  variant={progress === "complete" ? "outline" : "secondary"}
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

            <div
              className={`flex items-center justify-left gap-1 ${themeClasses}`}
            >
              {/* Menu button visible only on mobile */}
              <Button
                variant="outline"
                size="sm"
                className={`flex-shrink-0 text-xs sm:text-sm ${themeClasses} block sm:hidden`}
                onClick={onToggleSidebar}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Button
                variant={progress === "reading" ? "default" : "outline"}
                size="sm"
                className={`flex-shrink-0 text-xs sm:text-sm ${themeClasses}`}
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
              <Button
                variant="outline"
                size="sm"
                className={`flex-shrink-0 text-xs sm:text-sm ${themeClasses}`}
                onClick={handleGenerateQuiz}
              >
                <Sparkles className="h-3 w-3 mr-1" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`flex-shrink-0 text-xs sm:text-sm ${themeClasses}`}
                onClick={handleAddNotes}
              >
                <NoteAdd className="h-3 w-3 mr-1" />
              </Button>
              {!speaking ? (
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex-shrink-0 text-xs sm:text-sm ${themeClasses}`}
                  onClick={() =>
                    synthesisSupported &&
                    speak(prepareChapterForSpeech(chapter))
                  }
                  disabled={!synthesisSupported}
                >
                  <PlayArrow className="h-3 w-3 mr-1" />
                </Button>
              ) : paused ? (
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex-shrink-0 text-xs sm:text-sm ${themeClasses}`}
                  onClick={() => synthesisSupported && resumeSpeaking()}
                  disabled={!synthesisSupported}
                >
                  <Play className="h-3 w-3 mr-1" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex-shrink-0 text-xs sm:text-sm ${themeClasses}`}
                  onClick={() => synthesisSupported && pauseSpeaking()}
                  disabled={!synthesisSupported}
                >
                  <Pause className="h-3 w-3 mr-1" />
                </Button>
              )}
              {speaking && (
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex-shrink-0 text-xs sm:text-sm ${themeClasses}`}
                  onClick={() => synthesisSupported && cancelSpeaking()}
                  disabled={!synthesisSupported}
                >
                  <StopCircle className="h-3 w-3 mr-1" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className={`flex-shrink-0 text-xs sm:text-sm ${themeClasses}`}
                onClick={onClose}
              >
                Close
              </Button>
            </div>
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
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white p-4 rounded shadow-lg z-50 flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setErrors([])}
              className="text-white"
            >
              ×
            </Button>
          </div>
        )}

        {showNoteEditor && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
            <div className="bg-white p-6 rounded w-11/12 sm:w-96">
              <h2 className="text-lg font-semibold mb-2">
                Notes for {chapter.title}
              </h2>
              <Textarea
                value={noteEditorValue}
                onChange={(e) => setNoteEditorValue(e.target.value)}
                rows={6}
                className="w-full mb-4"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancelNotes}>
                  Cancel
                </Button>
                <Button onClick={handleSaveNotes}>Save</Button>
              </div>
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

        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-22 z-1 flex items-center justify-center"
          onClick={onPreviousChapter}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-10 z-1 flex items-center justify-center"
          onClick={onNextChapter}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  },
);

ContentArea.displayName = "ContentArea";
