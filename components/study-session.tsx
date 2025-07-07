"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Check,
  Flag,
  RotateCcw,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";
import type { Flashcard, UserCardState } from "@/app/page";

interface StudySessionProps {
  cards: Flashcard[];
  userCardStates: UserCardState;
  onUpdateCardState: (
    cardId: string,
    updates: Partial<UserCardState[string]>
  ) => void;
  onExit: () => void;
}

export function StudySession({
  cards,
  userCardStates,
  onUpdateCardState,
  onExit,
}: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    flagged: 0,
    startTime: Date.now(),
  });

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;
  const isLastCard = currentIndex === cards.length - 1;

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          if (!isFlipped) {
            setIsFlipped(true);
          }
          break;
        case "1":
          if (isFlipped) {
            handleAnswer(false);
          }
          break;
        case "2":
          if (isFlipped) {
            handleAnswer(true);
          }
          break;
        case "f":
          if (isFlipped) {
            handleFlag();
          }
          break;
        case "Escape":
          onExit();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlipped, currentCard]);

  const handleAnswer = (correct: boolean) => {
    if (!currentCard) return;

    onUpdateCardState(currentCard.id, {
      known: correct,
      confidence: correct
        ? Math.min((userCardStates[currentCard.id]?.confidence || 0) + 1, 5)
        : Math.max((userCardStates[currentCard.id]?.confidence || 0) - 1, 0),
    });

    setSessionStats((prev) => ({
      ...prev,
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: correct ? prev.incorrect : prev.incorrect + 1,
    }));

    nextCard();
  };

  const handleFlag = () => {
    if (!currentCard) return;

    const isFlagged = userCardStates[currentCard.id]?.flagged || false;
    onUpdateCardState(currentCard.id, { flagged: !isFlagged });

    setSessionStats((prev) => ({
      ...prev,
      flagged: isFlagged ? prev.flagged - 1 : prev.flagged + 1,
    }));
  };

  const nextCard = () => {
    if (isLastCard) {
      // Session complete
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const sessionDuration = Math.floor(
    (Date.now() - sessionStats.startTime) / 1000
  );
  const minutes = Math.floor(sessionDuration / 60);
  const seconds = sessionDuration % 60;

  if (isLastCard && isFlipped) {
    // Session complete screen
    const accuracy =
      sessionStats.correct + sessionStats.incorrect > 0
        ? Math.round(
            (sessionStats.correct /
              (sessionStats.correct + sessionStats.incorrect)) *
              100
          )
        : 0;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <TrendingUp className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Session Complete!</h2>
              <p className="text-muted-foreground">Great job studying!</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {sessionStats.correct}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-600">
                  {sessionStats.incorrect}
                </div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Target className="h-4 w-4" />
                <span className="font-medium">{accuracy}% Accuracy</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            <Button onClick={onExit} className="w-full">
              Return to Deck
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">Study Session</h1>
              <Badge variant="outline" className="text-xs">
                {currentIndex + 1} / {cards.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onExit}
                className="h-8 px-3 text-xs bg-transparent"
              >
                <X className="h-3 w-3 mr-1" />
                Exit
              </Button>
            </div>
          </div>
          <div className="mt-2">
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 py-4">
        <div className="max-w-2xl mx-auto">
          <Card className="min-h-[320px] sm:min-h-[400px]">
            <CardContent className="p-4 sm:p-6">
              {!isFlipped ? (
                <div className="space-y-4 text-center">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">
                      {currentCard.category}
                    </Badge>
                    <h2 className="text-lg sm:text-xl font-medium leading-relaxed">
                      {currentCard.front}
                    </h2>
                  </div>
                  <div className="space-y-3 mt-8">
                    <Button
                      onClick={() => setIsFlipped(true)}
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reveal Answer
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Tap to reveal
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="text-base sm:text-lg leading-relaxed">
                      {currentCard.back}
                    </div>
                    {currentCard.example && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs font-medium mb-1">Example:</p>
                        <p className="text-xs text-muted-foreground italic leading-relaxed">
                          {currentCard.example}
                        </p>
                      </div>
                    )}
                    {currentCard.mnemonic && (
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-xs font-medium mb-1">Memory Aid:</p>
                        <p className="text-xs font-medium text-primary">
                          {currentCard.mnemonic}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 mt-6">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleAnswer(false)}
                        className="flex-1 h-12 text-red-600 hover:text-red-600"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Dont Know
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleFlag}
                        className={`h-12 px-4 ${
                          userCardStates[currentCard.id]?.flagged
                            ? "bg-yellow-100"
                            : ""
                        }`}
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleAnswer(true)}
                        className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Know It
                      </Button>
                    </div>

                    <div className="text-center text-xs text-muted-foreground">
                      Tap buttons or use keyboard: 1 (dont know), 2 (know it), F
                      (flag)
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mobile Session Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Card className="p-3 text-center">
              <div className="text-lg font-bold text-green-600">
                {sessionStats.correct}
              </div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-lg font-bold text-red-600">
                {sessionStats.incorrect}
              </div>
              <div className="text-xs text-muted-foreground">Incorrect</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-lg font-bold text-yellow-600">
                {sessionStats.flagged}
              </div>
              <div className="text-xs text-muted-foreground">Flagged</div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
