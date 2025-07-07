"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, ArrowRight } from "lucide-react";
import type { QuizQuestion, QuizAnswer, QuizResult } from "@/types/quiz";

interface QuizSessionProps {
  questions: QuizQuestion[];
  onComplete: (result: QuizResult) => void;
  onExit: () => void;
}

export function QuizSession({
  questions,
  onComplete,
  onExit,
}: QuizSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<
    string | string[] | { [key: string]: string }
  >("");
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setCurrentAnswer("");
  }, [currentQuestionIndex]);

  const handleAnswer = () => {
    if (!currentAnswer) return;

    const timeSpent = Date.now() - questionStartTime;
    let isCorrect = false;

    // Check correctness based on question type
    switch (currentQuestion.type) {
      case "multiple-choice":
        isCorrect = currentAnswer === currentQuestion.correctAnswer;
        break;
      case "fill-in-blank":
        const userWords = (currentAnswer as string).toLowerCase().split(/\s+/);
        const correctWords = currentQuestion.blanks || [];
        isCorrect = correctWords.every((word) =>
          userWords.some(
            (userWord) => userWord.includes(word) || word.includes(userWord)
          )
        );
        break;
      case "true-false":
        isCorrect = currentAnswer === currentQuestion.correctAnswer;
        break;
      case "matching":
        const userMatches = currentAnswer as { [key: string]: string };
        const correctMatches = JSON.parse(currentQuestion.correctAnswer);
        isCorrect = Object.keys(correctMatches).every(
          (key) => userMatches[key] === correctMatches[key]
        );
        break;
    }

    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      userAnswer: currentAnswer,
      isCorrect,
      timeSpent,
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Complete quiz
      const totalTime = Date.now() - startTime;
      const score = newAnswers.filter((a) => a.isCorrect).length;
      const result: QuizResult = {
        score,
        totalQuestions: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        answers: newAnswers,
        questions,
        timeSpent: totalTime,
        completedAt: new Date().toISOString(),
      };
      onComplete(result);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
            <RadioGroup
              value={currentAnswer as string}
              onValueChange={setCurrentAnswer}
              className="space-y-3"
            >
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "fill-in-blank":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-mono leading-relaxed">
                {currentQuestion.originalText}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Fill in the blank(s):</Label>
              <Input
                value={currentAnswer as string}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="w-full"
              />
            </div>
          </div>
        );

      case "true-false":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
            <RadioGroup
              value={currentAnswer as string}
              onValueChange={setCurrentAnswer}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="True" id="true" />
                <Label htmlFor="true" className="cursor-pointer">
                  True
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="False" id="false" />
                <Label htmlFor="false" className="cursor-pointer">
                  False
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case "matching":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Questions:</h4>
                {currentQuestion.pairs?.map((pair, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm">
                    {pair.left}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Match with:</h4>
                {currentQuestion.pairs?.map((pair, index) => (
                  <div key={index} className="space-y-1">
                    <Label className="text-xs">{pair.left}</Label>
                    <select
                      className="w-full p-2 border rounded text-sm"
                      value={
                        (currentAnswer as { [key: string]: string })[
                          pair.left
                        ] || ""
                      }
                      onChange={(e) =>
                        setCurrentAnswer((prev) => ({
                          ...(prev as { [key: string]: string }),
                          [pair.left]: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select answer...</option>
                      {currentQuestion.pairs?.map((p, i) => (
                        <option key={i} value={p.right}>
                          {p.right}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    if (!currentAnswer) return false;

    switch (currentQuestion.type) {
      case "matching":
        const matches = currentAnswer as { [key: string]: string };
        return (
          currentQuestion.pairs?.every((pair) => matches[pair.left]) || false
        );
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <h1 className="text-lg font-bold">Quiz in Progress</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {currentQuestionIndex + 1} of {questions.length}
              </Badge>
              <Button variant="outline" size="sm" onClick={onExit}>
                Exit Quiz
              </Button>
            </div>
          </div>
          <div className="mt-2">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 py-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Question {currentQuestionIndex + 1}
                  <Badge variant="secondary" className="text-xs">
                    {currentQuestion.type.replace("-", " ")}
                  </Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderQuestion()}

              <div className="flex justify-end">
                <Button
                  onClick={handleAnswer}
                  disabled={!canProceed()}
                  className="min-w-[120px]"
                >
                  {isLastQuestion ? "Finish Quiz" : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
