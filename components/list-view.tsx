"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Flag,
  Check,
  X,
  Lightbulb,
  BookOpen,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { Flashcard, UserCardState } from "@/app/page";

// Import tracking functions
import {
  trackCardFlip,
  trackConfidenceRating,
  trackCardFlag,
} from "@/lib/learning-analytics";

interface ListViewProps {
  cards: Flashcard[];
  userCardStates: UserCardState;
  onUpdateCardState: (
    cardId: string,
    updates: Partial<UserCardState[string]>,
  ) => void;
}

export function ListView({
  cards,
  userCardStates,
  onUpdateCardState,
}: ListViewProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (cardId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
        trackCardFlip(cardId);
      }
      return newSet;
    });
  };

  const handleMarkKnown = (card: Flashcard, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentState = userCardStates[card.id];
    const newConfidence = Math.min((currentState?.confidence || 0) + 0.2, 1.0);
    onUpdateCardState(card.id, {
      known: true,
      confidence: Math.min((currentState?.confidence || 0) + 1, 5),
    });
    trackConfidenceRating(card.id, newConfidence);
  };

  const handleMarkUnknown = (card: Flashcard, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentState = userCardStates[card.id];
    const newConfidence = Math.max((currentState?.confidence || 0) - 0.2, 0.0);
    onUpdateCardState(card.id, {
      known: false,
      confidence: Math.max((currentState?.confidence || 0) - 1, 0),
    });
    trackConfidenceRating(card.id, newConfidence);
  };

  const handleToggleFlag = (card: Flashcard, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentState = userCardStates[card.id];
    const newFlaggedState = !(currentState?.flagged || false);
    onUpdateCardState(card.id, { flagged: !(currentState?.flagged || false) });
    trackCardFlag(card.id, newFlaggedState);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">All Cards ({cards.length})</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpandedCards(new Set())}
          className="text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Collapse All
        </Button>
      </div>

      <div className="space-y-3">
        {cards.map((card, index) => {
          const isExpanded = expandedCards.has(card.id);
          const cardState = userCardStates[card.id];

          return (
            <Card
              key={card.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-md"
              onClick={() => toggleCard(card.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {card.category}
                        </Badge>
                        {card.difficulty && (
                          <Badge
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
                      {cardState?.confidence !== undefined && (
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                i < cardState.confidence
                                  ? "bg-primary"
                                  : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <BookOpen className="h-3 w-3" />
                          Question
                        </div>
                        <div className="text-sm font-medium leading-relaxed">
                          {card.front}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="space-y-3 pt-3 border-t">
                          <div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Check className="h-3 w-3" />
                              Answer
                            </div>
                            <div className="text-sm leading-relaxed">
                              {card.back}
                            </div>
                          </div>

                          {card.example && (
                            <>
                              <Separator />
                              <div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                  <BookOpen className="h-3 w-3" />
                                  Example
                                </div>
                                <div className="text-xs text-muted-foreground italic leading-relaxed">
                                  {card.example}
                                </div>
                              </div>
                            </>
                          )}

                          {card.mnemonic && (
                            <>
                              <Separator />
                              <div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                  <Lightbulb className="h-3 w-3" />
                                  Memory Aid
                                </div>
                                <div className="text-xs font-medium text-primary">
                                  {card.mnemonic}
                                </div>
                              </div>
                            </>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="text-xs text-muted-foreground">
                              {card.course} • {card.module} • {card.subject}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => handleToggleFlag(card, e)}
                                className={`h-7 px-2 ${
                                  cardState?.flagged ? "bg-destructive/10" : ""
                                }`}
                              >
                                <Flag className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => handleMarkUnknown(card, e)}
                                className="h-7 px-2 text-destructive hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => handleMarkKnown(card, e)}
                                className="h-7 px-2 text-green-600 hover:text-green-600"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
