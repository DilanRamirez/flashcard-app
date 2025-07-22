"use client";

import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import { Sidebar } from "./sidebar";
import { ContentArea } from "./content-area";
import { SearchPanel } from "./search-panel";
import { SettingsPanel } from "./settings-panel";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useMarkdownLoader } from "@/hooks/use-markdown-loader";
import { useHighlighting } from "@/hooks/use-highlighting";
import { useSearch } from "@/hooks/use-search";
import type { StudyData, Chapter, Preferences } from "@/types/study";

export const defaultPreferences: Preferences = {
  theme: "light",
  fontSize: "med",
  fontFamily: "default",
  lineHeight: 1.6,
};

interface StudyAppProps {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onStartQuiz: (questions: any[]) => void;
}
export function StudyApp({ onClose, onStartQuiz }: StudyAppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Local storage hooks
  const [studyData, setStudyData] = useLocalStorage<StudyData>(
    "awsStudyApp_v1",
    {
      progress: {},
      bookmarks: {},
      highlights: {},
      lastVisited: null,
    },
  );

  const [preferences, setPreferences] = useLocalStorage<Preferences>(
    "awsStudyApp_preferences",
    defaultPreferences,
  );

  // Compute classes and styles based on user preferences
  const themeClasses =
    preferences.theme === "dark"
      ? "bg-gray-900 text-gray-100"
      : "bg-white text-gray-900";

  const fontSizeClasses =
    preferences.fontSize === "small"
      ? "text-sm"
      : preferences.fontSize === "med"
        ? "text-base"
        : "text-lg";

  const fontFamilyClasses =
    preferences.fontFamily === "default"
      ? "font-sans"
      : `font-${preferences.fontFamily}`;

  const lineHeightStyle = { lineHeight: preferences.lineHeight };

  // Load markdown content
  const { content, loading, error } = useMarkdownLoader(
    "decks/aws-cloud-practitioner/AWS-Cloud-Practitioner.md",
  );

  // Search functionality
  const { searchResults, searchTerm, setSearchTerm } = useSearch(chapters);

  // Highlighting functionality
  const { addHighlight, removeHighlight } = useHighlighting(
    studyData,
    setStudyData,
  );

  // Parse markdown and extract chapters
  useEffect(() => {
    if (!content) return;

    const processMarkdown = async () => {
      const markdownString =
        typeof content === "string" ? content : await content;

      const chapterLinkRegex =
        /^- \[Chapter (\d+): (.*?)\]\(#(chapter-\d+.*?)\)$/gm;

      const tocMatch = markdownString.match(
        /## Core Cloud Concepts[\s\S]+?## End/,
      );
      if (!tocMatch) return;

      const toc = tocMatch[0];
      const matches = Array.from(toc.matchAll(chapterLinkRegex));

      const extractedChapters: Chapter[] = matches.map((match, index) => {
        const chapterNumber = match[1];
        const title = match[2];
        const slug = match[3];

        // Extract corresponding markdown content section by slug
        const sectionRegex = new RegExp(
          `(^|\\n)#+\\s*Chapter ${chapterNumber}: .*?\\n([\\s\\S]*?)(?=\\n#+\\s*Chapter \\d+:|\\Z)`,
          "g",
        );
        const sectionMatch = markdownString.match(sectionRegex);
        const rawContent = sectionMatch ? sectionMatch[0] : "";
        const chapterContent = marked.parse(rawContent);

        return {
          id: slug,
          title: `Chapter ${chapterNumber}: ${title}`,
          content: chapterContent as string,
          order: index,
        };
      });

      setChapters(extractedChapters);

      if (
        studyData.lastVisited &&
        extractedChapters.find((c) => c.id === studyData.lastVisited)
      ) {
        setCurrentChapter(studyData.lastVisited);
      } else if (extractedChapters.length > 0) {
        setCurrentChapter(extractedChapters[0].id);
      }
    };

    processMarkdown();
  }, [content, studyData.lastVisited]);

  // At the top of your component, add a ref to track the first render:
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip writing to localStorage on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      // Only update storage when preferences have actually changed
      const key = "awsStudyApp_preferences";
      const serialized = JSON.stringify(preferences);
      const existing = localStorage.getItem(key);
      if (existing !== serialized) {
        localStorage.setItem(key, serialized);
      }
    }
    // (Theme and font application to document.documentElement is now handled via component classes/styles)
  }, [preferences]);

  // Navigate to chapter
  const navigateToChapter = (chapterId: string) => {
    setCurrentChapter(chapterId);
    setStudyData((prev) => ({ ...prev, lastVisited: chapterId }));
    setSidebarOpen(false);

    // Scroll to top of content
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  // Update progress
  const updateProgress = (
    chapterId: string,
    status: "reading" | "complete",
  ) => {
    setStudyData((prev) => ({
      ...prev,
      progress: { ...prev.progress, [chapterId]: status },
    }));
  };

  // Toggle bookmark
  const toggleBookmark = (chapterId: string) => {
    setStudyData((prev) => ({
      ...prev,
      bookmarks: {
        ...prev.bookmarks,
        [chapterId]: !prev.bookmarks[chapterId],
      },
    }));
  };

  // Reset all data
  const resetData = () => {
    setStudyData({
      progress: {},
      bookmarks: {},
      highlights: {},
      lastVisited: null,
    });
    setCurrentChapter(chapters.length > 0 ? chapters[0].id : null);
  };

  // Navigate to the next chapter
  const handleNextChapter = () => {
    if (!currentChapter) return;
    const currentIndex = chapters.findIndex((c) => c.id === currentChapter);
    if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
      navigateToChapter(chapters[currentIndex + 1].id);
    }
  };

  const onPreviousChapter = () => {
    if (!currentChapter) return;
    const currentIndex = chapters.findIndex((c) => c.id === currentChapter);
    if (currentIndex > 0) {
      navigateToChapter(chapters[currentIndex - 1].id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AWS Study Content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Content
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Make sure the markdown file exists at:
            /decks/aws-cloud-practitioner/AWS-Cloud-Practitioner.md
          </p>
        </div>
      </div>
    );
  }

  const currentChapterData = chapters.find((c) => c.id === currentChapter);

  return (
    <div
      className={`flex h-screen ${themeClasses} ${fontSizeClasses} ${fontFamilyClasses}`}
      style={lineHeightStyle}
    >
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        chapters={chapters}
        currentChapter={currentChapter}
        studyData={studyData}
        onNavigate={navigateToChapter}
        onToggleBookmark={toggleBookmark}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        themeClasses={themeClasses}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col ${themeClasses} ${fontSizeClasses} ${fontFamilyClasses}`}
        style={lineHeightStyle}
      >
        <ContentArea
          themeClasses={themeClasses}
          ref={contentRef}
          chapter={currentChapterData}
          studyData={studyData}
          onUpdateProgress={updateProgress}
          onAddHighlight={addHighlight}
          onRemoveHighlight={removeHighlight}
          onClose={onClose}
          onStartQuiz={onStartQuiz}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNextChapter={handleNextChapter}
          onPreviousChapter={onPreviousChapter}
        />
      </div>

      {/* Search Panel */}
      <SearchPanel
        open={searchOpen}
        onOpenChange={setSearchOpen}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        searchResults={searchResults}
        onNavigate={navigateToChapter}
      />

      {/* Settings Panel */}
      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        preferences={preferences}
        onPreferencesChange={setPreferences}
        onResetData={resetData}
      />
    </div>
  );
}
