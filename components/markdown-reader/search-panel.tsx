"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, FileText } from "lucide-react";
import type { SearchResult } from "@/types/study";

interface SearchPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  searchResults: SearchResult[];
  onNavigate: (chapterId: string) => void;
}

export function SearchPanel({
  open,
  onOpenChange,
  searchTerm,
  onSearchTermChange,
  searchResults,
  onNavigate,
}: SearchPanelProps) {
  const handleNavigate = (chapterId: string) => {
    onNavigate(chapterId);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Content
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search chapters and content..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {searchTerm && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {searchResults.length} results found
              </span>
              {searchResults.length > 0 && (
                <Badge variant="secondary">{searchTerm}</Badge>
              )}
            </div>
          )}

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3">
              {searchResults.map((result, index) => (
                <div
                  key={`${result.chapterId}-${index}`}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors touch-manipulation min-h-[60px]"
                  onClick={() => handleNavigate(result.chapterId)}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate mb-1">
                        {result.chapterTitle}
                      </h4>
                      <p
                        className="text-xs text-gray-600 line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html: result.snippet.replace(
                            new RegExp(`(${searchTerm})`, "gi"),
                            '<mark class="bg-yellow-200">$1</mark>',
                          ),
                        }}
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Match {index + 1}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {searchTerm && searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No results found for {searchTerm}</p>
                  <p className="text-xs mt-1">
                    Try different keywords or check spelling
                  </p>
                </div>
              )}

              {!searchTerm && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Start typing to search content</p>
                  <p className="text-xs mt-1">
                    Search across all chapters and highlights
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
