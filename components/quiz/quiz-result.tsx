import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  Clock,
  Target,
  RotateCcw,
  Home,
} from "lucide-react";
import type { QuizResult } from "@/types/quiz";

interface QuizResultsProps {
  result: QuizResult;
  onRetakeQuiz: () => void;
  onBackToHome: () => void;
}

export function QuizResults({
  result,
  onRetakeQuiz,
  onBackToHome,
}: QuizResultsProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const wrongAnswers = result.answers.filter((answer) => !answer.isCorrect);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <h1 className="text-lg font-bold">Quiz Results</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onRetakeQuiz}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Retake
              </Button>
              <Button variant="outline" size="sm" onClick={onBackToHome}>
                <Home className="h-4 w-4 mr-1" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Score Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div
                  className={`text-6xl font-bold ${getScoreColor(
                    result.percentage,
                  )}`}
                >
                  {result.percentage}%
                </div>
                <div className="text-lg text-muted-foreground">
                  {result.score} out of {result.totalQuestions} correct
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold text-green-600">
                    {result.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold text-red-600">
                    {result.totalQuestions - result.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold">
                    {formatTime(result.timeSpent)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Time
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold">
                    {formatTime(result.timeSpent / result.totalQuestions)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg/Question
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wrong Answers Review */}
          {wrongAnswers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Questions to Review ({wrongAnswers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {wrongAnswers.map((answer, index) => {
                  const question = result.questions.find(
                    (q) => q.id === answer.questionId,
                  );
                  if (!question) return null;

                  return (
                    <div key={answer.questionId} className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Badge variant="destructive" className="text-xs mt-1">
                          {index + 1}
                        </Badge>
                        <div className="flex-1 space-y-2">
                          <div className="font-medium">{question.question}</div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-muted-foreground">
                                Your answer:
                              </span>
                              <span className="text-red-600">
                                {typeof answer.userAnswer === "string"
                                  ? answer.userAnswer
                                  : JSON.stringify(answer.userAnswer)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-muted-foreground">
                                Correct answer:
                              </span>
                              <span className="text-green-600 font-medium">
                                {question.correctAnswer}
                              </span>
                            </div>
                          </div>

                          {question.type === "fill-in-blank" &&
                            question.originalText && (
                              <div className="p-3 bg-muted rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">
                                  Complete text:
                                </div>
                                <div className="text-sm font-mono">
                                  {question.correctAnswer}
                                </div>
                              </div>
                            )}

                          {answer.timeSpent && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTime(answer.timeSpent)}
                            </div>
                          )}
                        </div>
                      </div>
                      {index < wrongAnswers.length - 1 && <Separator />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* All Correct */}
          {wrongAnswers.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Perfect Score!</h3>
                <p className="text-muted-foreground">
                  You answered all questions correctly. Excellent work!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Button onClick={onRetakeQuiz} className="min-w-[120px]">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
            <Button variant="outline" onClick={onBackToHome}>
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
