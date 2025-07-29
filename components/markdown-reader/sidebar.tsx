"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  CheckCircle,
  Circle,
  Search,
  Settings,
  BookmarkIcon,
} from "lucide-react";
import type { Chapter, StudyData } from "@/types/study";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  themeClasses: string;
  onOpenChange: (open: boolean) => void;
  chapters: Chapter[];
  currentChapter: string | null;
  studyData: StudyData;
  onNavigate: (chapterId: string) => void;
  onToggleBookmark: (chapterId: string) => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({
  open,
  themeClasses,
  onOpenChange,
  chapters,
  currentChapter,
  studyData,
  onNavigate,
  onToggleBookmark,
  onOpenSearch,
  onOpenSettings,
}: SidebarProps) {
  // Group chapters by domain (simplified - you might want to enhance this)
  const groupedChapters = {
    "Core Cloud Concepts": chapters.filter((c) => c.order >= 0 && c.order <= 1),
    "Compute Services & Scaling": chapters.filter(
      (c) => c.order >= 2 && c.order <= 5,
    ),
    "Messaging & Queuing": chapters.filter((c) => c.order >= 6 && c.order <= 7),
    "Global Infrastructure": chapters.filter(
      (c) => c.order >= 8 && c.order <= 10,
    ),
    "Access & Management": chapters.filter(
      (c) => c.order >= 11 && c.order <= 14,
    ),
    "Storage Services": chapters.filter((c) => c.order >= 15 && c.order <= 16),
    "Database Services": chapters.filter((c) => c.order >= 17 && c.order <= 22),
    "Security & Compliance": chapters.filter(
      (c) => c.order >= 23 && c.order <= 34,
    ),
    "Billing & Pricing": chapters.filter((c) => c.order >= 31 && c.order <= 34),
    "Support & Migration": chapters.filter(
      (c) => c.order >= 35 && c.order <= 38,
    ),
    "Architecture & Best Practices": chapters.filter(
      (c) => c.order >= 39 && c.order <= 39,
    ),
    "Cloud Value Proposition": chapters.filter(
      (c) => c.order >= 40 && c.order <= 40,
    ),
    "Certification Preparation": chapters.filter(
      (c) => c.order >= 41 && c.order <= 43,
    ),
  };

  const getProgressIcon = (chapterId: string) => {
    const status = studyData.progress[chapterId];
    if (status === "complete") {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (status === "reading") {
      return <Circle className="h-4 w-4 text-blue-600 fill-current" />;
    }
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  const getCompletionStats = () => {
    const total = chapters.length;
    const completed = Object.values(studyData.progress).filter(
      (status) => status === "complete",
    ).length;
    const reading = Object.values(studyData.progress).filter(
      (status) => status === "reading",
    ).length;
    return { total, completed, reading };
  };

  const stats = getCompletionStats();

  const SidebarContent = () => (
    <div className={`flex flex-col h-full w-full px-5 ${themeClasses}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          AWS Cloud Practitioner
        </h1>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>
              {stats.completed}/{stats.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={`p-4 border-b space-y-2 ${themeClasses}`}>
        <Button
          variant="outline"
          className="w-full justify-start bg-transparent"
          onClick={onOpenSearch}
        >
          <Search className="h-4 w-4 mr-2" />
          Search Content
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start bg-transparent"
          onClick={onOpenSettings}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Table of Contents */}
      <ScrollArea className={`flex-1 ${themeClasses}`}>
        <div className={`p-4 space-y-4 ${themeClasses}`}>
          {Object.entries(groupedChapters).map(([domain, domainChapters]) => (
            <div key={domain}>
              <h3
                className={`font-medium text-sm mb-2 uppercase tracking-wide ${themeClasses}`}
              >
                {domain}
              </h3>
              <div className={`space-y-1 ${themeClasses}`}>
                {domainChapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className={cn(
                      "group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors touch-manipulation",
                      `min-h-[48px] ${themeClasses}`, // Ensure minimum touch target size
                      currentChapter === chapter.id &&
                        `bg-blue-50 border border-blue-200 ${themeClasses}`,
                    )}
                    onClick={() => onNavigate(chapter.id)}
                  >
                    {getProgressIcon(chapter.id)}
                    <span
                      className={`flex-1 text-sm ${themeClasses}`}
                      title={chapter.title}
                    >
                      {chapter.title}
                    </span>
                    <div
                      className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${themeClasses}`}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 ${themeClasses}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(chapter.id);
                        }}
                      >
                        <BookmarkIcon
                          className={cn(
                            `h-3 w-3  ${themeClasses}`,
                            studyData.bookmarks[chapter.id]
                              ? `text-yellow-600 fill-current ${themeClasses}`
                              : `text-gray-400 ${themeClasses}`,
                          )}
                        />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className={`p-4 border-t ${themeClasses}`}>
        <div className={`flex gap-2 text-xs ${themeClasses}`}>
          <Badge variant="outline" className={`flex ${themeClasses}`}>
            {stats.completed} Complete
          </Badge>
          <Badge variant="outline" className={`flex ${themeClasses}`}>
            {stats.reading} Reading
          </Badge>
          <Badge variant="outline" className={`flex ${themeClasses}`}>
            {
              Object.keys(studyData.bookmarks).filter(
                (id) => studyData.bookmarks[id],
              ).length
            }{" "}
            Bookmarked
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-full sm:w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 border-r bg-white">
        <SidebarContent />
      </div>
    </>
  );
}
