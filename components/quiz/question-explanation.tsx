"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BookOpen,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { QuizQuestion } from "@/types/quiz";
import {
  generateQuestionExplanation,
  getCachedExplanation,
  QuestionExplanation,
  setCachedExplanation,
} from "@/lib/ai-explanation-generator";
import WrapWithMarkdown from "../wrap-with-markdown";

interface QuestionExplanationProps {
  question: QuizQuestion;
  userAnswer: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function QuestionExplanationComponent({
  question,
  userAnswer,
  isExpanded = false,
  onToggle,
}: QuestionExplanationProps) {
  const [explanation, setExplanation] = useState<QuestionExplanation | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerateExplanation = async () => {
    if (hasGenerated || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = getCachedExplanation(question.id, userAnswer);
      if (cached) {
        setExplanation(cached);
        setHasGenerated(true);
        setIsLoading(false);
        return;
      }

      // Generate new explanation
      const result = await generateQuestionExplanation(question, userAnswer);

      if (result.success && result.explanation) {
        setExplanation(result.explanation);
        setCachedExplanation(question.id, userAnswer, result.explanation);
        setHasGenerated(true);
      } else {
        setError(result.error || "Failed to generate explanation");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium">Incorrect Answer</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <XCircle className="h-5 w-5 text-red-600" />
            Question Analysis
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Answer Comparison */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-muted-foreground whitespace-normal break-words">
              Your answer:
            </span>
            <Badge className="text-xs whitespace-normal break-words px-4 py-1">
              {userAnswer}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-muted-foreground whitespace-normal break-words">
              Correct answer:
            </span>
            <Badge
              variant="default"
              className="text-xs bg-green-600 whitespace-normal break-words px-4 py-1"
            >
              {question.correctAnswer}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Generate Explanation Button */}
        {!hasGenerated && !isLoading && (
          <div className="text-center">
            <Button
              onClick={handleGenerateExplanation}
              className="gap-2"
              disabled={!process.env.NEXT_PUBLIC_GEMINI_API_KEY}
            >
              <Sparkles className="h-4 w-4" />
              Get AI Explanation
            </Button>
            {!process.env.NEXT_PUBLIC_GEMINI_API_KEY && (
              <p className="text-xs text-muted-foreground mt-2">
                Gemini API key required for explanations
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Generating explanation...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Explanation Content */}
        {explanation && (
          <div className="space-y-4">
            {/* Why Correct Answer is Right */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-sm">
                  Why the correct answer is right:
                </h4>
              </div>
              <div className="pl-6 text-sm text-muted-foreground leading-relaxed">
                <WrapWithMarkdown text={explanation.correctAnswerExplanation} />
              </div>
            </div>

            <Separator />

            {/* Why User's Answer is Wrong */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <h4 className="font-medium text-sm">
                  Why your answer is incorrect:
                </h4>
              </div>
              <div className="pl-6 text-sm text-muted-foreground leading-relaxed">
                <WrapWithMarkdown
                  text={explanation.incorrectAnswerExplanation}
                />
              </div>
            </div>

            <Separator />

            {/* Common Misconceptions */}
            {explanation.commonMisconceptions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <h4 className="font-medium text-sm">
                    Common misconceptions:
                  </h4>
                </div>
                <ul className="pl-6 space-y-1">
                  {explanation.commonMisconceptions.map(
                    (misconception, index) => (
                      <li
                        key={index}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-yellow-600 mt-2">•</span>
                        {<WrapWithMarkdown text={misconception} />}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

            <Separator />

            {/* Key Learning Points */}
            {explanation.keyLearningPoints.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-sm">Key learning points:</h4>
                </div>
                <ul className="pl-6 space-y-1">
                  {explanation.keyLearningPoints.map((point, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-blue-600 mt-2">•</span>
                      <WrapWithMarkdown text={point} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Concepts */}
            {explanation.relatedConcepts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                  <h4 className="font-medium text-sm">
                    Related concepts to explore:
                  </h4>
                </div>
                <div className="pl-6 flex flex-wrap gap-1">
                  {explanation.relatedConcepts.map((concept, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-blue-600 mt-2">•</span>
                      <WrapWithMarkdown text={concept} />
                    </li>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
