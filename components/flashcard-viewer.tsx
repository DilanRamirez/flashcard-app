"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Flag,
  Check,
  X,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import type { Flashcard, UserCardState } from "@/app/page";

// Import the tracking functions
import {
  trackCardFlip,
  trackConfidenceRating,
  trackCardFlag,
} from "@/lib/learning-analytics";

interface FlashcardViewerProps {
  card: Flashcard;
  cardState?: UserCardState[string];
  onNext: () => void;
  onPrevious: () => void;
  onUpdateCardState: (updates: Partial<UserCardState[string]>) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export function FlashcardViewer({
  card,
  cardState,
  onNext,
  onPrevious,
  onUpdateCardState,
  canGoNext,
  canGoPrevious,
}: FlashcardViewerProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card?.id]);

  // Touch swipe handling
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && canGoNext) {
      onNext();
    }
    if (isRightSwipe && canGoPrevious) {
      onPrevious();
    }
  };

  // Keyboard navigation for card flipping
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  if (!card) return null;

  // In the FlashcardViewer component, add tracking to the flip handler
  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
    if (card && isFlipped) {
      // Track the flip interaction when revealing the answer
      trackCardFlip(card.id, isFlipped);
    }
  };

  const handleToggleFlag = () => {
    const newFlaggedState = !(cardState?.flagged || false);
    onUpdateCardState({ flagged: newFlaggedState });
    trackCardFlag(card.id, newFlaggedState);
  };

  const handleMarkKnown = () => {
    const newConfidence = Math.min((cardState?.confidence || 0) + 0.2, 1.0);
    onUpdateCardState({ known: true, confidence: newConfidence });
    trackConfidenceRating(card.id, newConfidence);
  };

  const handleMarkUnknown = () => {
    const newConfidence = Math.max((cardState?.confidence || 0) - 0.2, 0.0);
    onUpdateCardState({ known: false, confidence: newConfidence });
    trackConfidenceRating(card.id, newConfidence);
  };

  return (
    <div className="space-y-3">
      {/* Card */}
      <div className="relative">
        <Card
          className={`min-h-[320px] sm:min-h-[400px] cursor-pointer transition-all duration-300 hover:shadow-lg active:scale-[0.98] ${
            isFlipped ? "bg-muted/50" : ""
          }`}
          onClick={handleCardFlip}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {card.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {card.subject}
                </Badge>
                {card.difficulty && (
                  <Badge
                    style={{ backgroundColor: "#333333" }}
                    variant={
                      card.difficulty === "Beginner"
                        ? "default"
                        : card.difficulty === "Intermediate"
                          ? "secondary"
                          : "destructive"
                    }
                    className="text-xs"
                  >
                    {card.difficulty}
                  </Badge>
                )}
                {cardState?.flagged && (
                  <Badge variant="destructive" className="text-xs">
                    <Flag className="h-2 w-2 mr-1" />
                    Flagged
                  </Badge>
                )}
                {cardState?.known && (
                  <Badge variant="default" className="text-xs">
                    <Check className="h-2 w-2 mr-1" />
                    Known
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(!isFlipped);
                }}
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-4">
              {!isFlipped ? (
                // Front side
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    Question
                  </div>
                  <div className="text-lg sm:text-xl font-medium leading-relaxed">
                    {card.front}
                  </div>
                  <div className="text-center text-xs text-muted-foreground mt-6">
                    Tap to reveal answer • Swipe to navigate
                  </div>
                </div>
              ) : (
                // Back side
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Check className="h-3 w-3" />
                      Answer
                    </div>
                    <div className="text-base sm:text-lg leading-relaxed">
                      {card.back}
                    </div>
                  </div>

                  {card.example && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <BookOpen className="h-3 w-3" />
                          Example
                        </div>
                        <div className="text-sm text-muted-foreground italic leading-relaxed">
                          {card.example}
                        </div>
                      </div>
                    </>
                  )}

                  {card.mnemonic && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Lightbulb className="h-3 w-3" />
                          Memory Aid
                        </div>
                        <div className="text-sm font-medium text-primary">
                          {card.mnemonic}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Confidence indicator */}
        {cardState?.confidence !== undefined && (
          <div className="absolute top-3 right-3 flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i < cardState.confidence ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Navigation and Actions */}
      <div className="space-y-3">
        {/* Action buttons - only show when flipped */}
        {isFlipped && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFlag}
              className={`h-10 px-3 ${
                cardState?.flagged ? "bg-destructive/10" : ""
              }`}
            >
              <Flag className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkUnknown}
              className="h-10 px-4 text-destructive hover:text-destructive bg-transparent"
            >
              <X className="h-4 w-4 mr-1" />
              Dont Know
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkKnown}
              className="h-10 px-4 text-green-600 hover:text-green-600 bg-transparent"
            >
              <Check className="h-4 w-4 mr-1" />
              Know It
            </Button>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="flex items-center gap-2 h-10 px-4 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            variant="outline"
            onClick={onNext}
            disabled={!canGoNext}
            className="flex items-center gap-2 h-10 px-4 bg-transparent"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Course info */}
      <div className="text-center text-xs text-muted-foreground">
        {card.course} • {card.module}
      </div>
    </div>
  );
}
