"use client";

import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import { Sidebar } from "./sidebar";
import { ContentArea } from "./content-area";
import { SearchPanel } from "./search-panel";
import { SettingsPanel } from "./settings-panel";
import { BackToTop } from "./back-to-top";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useMarkdownLoader } from "@/hooks/use-markdown-loader";
import { useHighlighting } from "@/hooks/use-highlighting";
import { useSearch } from "@/hooks/use-search";
import type { StudyData, Chapter, Preferences } from "@/types/study";

const defaultPreferences: Preferences = {
  theme: "light",
  fontSize: "med",
  fontFamily: "default",
  lineHeight: 1.6,
};

export function StudyApp() {
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
        const chapterContent = sectionMatch ? sectionMatch[0] : "";

        return {
          id: slug,
          title: `Chapter ${chapterNumber}: ${title}`,
          content: chapterContent,
          order: index,
        };
      });

      console.log("Extracted Chapters:", extractedChapters);

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

  // Apply theme and preferences
  useEffect(() => {
    const root = document.documentElement;
    root.className = `theme-${preferences.theme} font-${preferences.fontSize} font-family-${preferences.fontFamily}`;
    root.style.setProperty("--line-height", preferences.lineHeight.toString());
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
    <div className="flex h-screen bg-background text-foreground">
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
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <ContentArea
          ref={contentRef}
          chapter={currentChapterData}
          studyData={studyData}
          onUpdateProgress={updateProgress}
          onAddHighlight={addHighlight}
          onRemoveHighlight={removeHighlight}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
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

      {/* Back to Top */}
      <BackToTop containerRef={contentRef} />
    </div>
  );
}
