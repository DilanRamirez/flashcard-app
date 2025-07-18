export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Highlight {
  id: string;
  text: string;
  startPath: string;
  startOffset: number;
  endPath: string;
  endOffset: number;
  note: string;
  createdAt: number;
}

export interface StudyData {
  progress: Record<string, "reading" | "complete">;
  bookmarks: Record<string, boolean>;
  highlights: Record<string, Highlight[]>;
  lastVisited: string | null;
}

export interface Preferences {
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "med" | "large";
  fontFamily: "default" | "mono" | "open-dyslexic";
  lineHeight: number;
}

export interface SearchResult {
  chapterId: string;
  chapterTitle: string;
  snippet: string;
  relevance: number;
}
