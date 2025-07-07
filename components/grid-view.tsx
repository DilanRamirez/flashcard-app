"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Flag, Check, X, Lightbulb, BookOpen, RotateCcw } from "lucide-react"
import type { Flashcard, UserCardState } from "@/app/page"

interface GridViewProps {
  cards: Flashcard[]
  userCardStates: UserCardState
  onUpdateCardState: (cardId: string, updates: Partial<UserCardState[string]>) => void
}

export function GridView({ cards, userCardStates, onUpdateCardState }: GridViewProps) {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())

  const toggleCard = (cardId: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }

  const handleMarkKnown = (card: Flashcard, e: React.MouseEvent) => {
    e.stopPropagation()
    const currentState = userCardStates[card.id]
    onUpdateCardState(card.id, {
      known: true,
      confidence: Math.min((currentState?.confidence || 0) + 1, 5),
    })
  }

  const handleMarkUnknown = (card: Flashcard, e: React.MouseEvent) => {
    e.stopPropagation()
    const currentState = userCardStates[card.id]
    onUpdateCardState(card.id, {
      known: false,
      confidence: Math.max((currentState?.confidence || 0) - 1, 0),
    })
  }

  const handleToggleFlag = (card: Flashcard, e: React.MouseEvent) => {
    e.stopPropagation()
    const currentState = userCardStates[card.id]
    onUpdateCardState(card.id, { flagged: !(currentState?.flagged || false) })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">All Cards ({cards.length})</h2>
        <Button variant="outline" size="sm" onClick={() => setFlippedCards(new Set())} className="text-xs">
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const isFlipped = flippedCards.has(card.id)
          const cardState = userCardStates[card.id]

          return (
            <Card
              key={card.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg active:scale-[0.98] min-h-[280px] ${
                isFlipped ? "bg-muted/50" : ""
              }`}
              onClick={() => toggleCard(card.id)}
            >
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-wrap gap-1">
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
                        <Flag className="h-2 w-2" />
                      </Badge>
                    )}
                    {cardState?.known && (
                      <Badge variant="default" className="text-xs">
                        <Check className="h-2 w-2" />
                      </Badge>
                    )}
                  </div>
                  {cardState?.confidence !== undefined && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${i < cardState.confidence ? "bg-primary" : "bg-muted"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  {!isFlipped ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        Question
                      </div>
                      <div className="text-sm font-medium leading-relaxed line-clamp-6">{card.front}</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Check className="h-3 w-3" />
                          Answer
                        </div>
                        <div className="text-sm leading-relaxed line-clamp-4">{card.back}</div>
                      </div>

                      {card.example && (
                        <>
                          <Separator />
                          <div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <BookOpen className="h-3 w-3" />
                              Example
                            </div>
                            <div className="text-xs text-muted-foreground italic line-clamp-2">{card.example}</div>
                          </div>
                        </>
                      )}

                      {card.mnemonic && (
                        <>
                          <Separator />
                          <div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <Lightbulb className="h-3 w-3" />
                              Memory Aid
                            </div>
                            <div className="text-xs font-medium text-primary line-clamp-1">{card.mnemonic}</div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {isFlipped && (
                  <div className="flex items-center justify-center gap-1 mt-3 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleToggleFlag(card, e)}
                      className={`h-7 px-2 ${cardState?.flagged ? "bg-destructive/10" : ""}`}
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
                )}

                <div className="text-center text-xs text-muted-foreground mt-2">{card.subject}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
