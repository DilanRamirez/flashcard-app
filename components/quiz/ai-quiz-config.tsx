/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Sparkles, AlertCircle } from "lucide-react";
import type { Flashcard } from "@/app/page";
import type { QuizConfig } from "@/types/quiz";
import { getAvailableFilters } from "@/lib/quiz-generator";
import {
  generateAIQuiz,
  generateCacheKey,
  getCachedAIQuiz,
  setCachedAIQuiz,
} from "@/lib/ai-quiz-generator";

interface AIQuizSetupProps {
  cards: Flashcard[];
  onStartQuiz: (questions: any[]) => void;
  onCancel: () => void;
}

export function AIQuizSetup({
  cards,
  onStartQuiz,
  onCancel,
}: AIQuizSetupProps) {
  const [config, setConfig] = useState<QuizConfig>({
    subjects: [],
    courses: [],
    modules: [],
    categories: [],
    tags: [],
    questionTypes: ["multiple-choice"], // AI only supports multiple choice for now
    questionCount: 10,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [useCache, setUseCache] = useState(true);

  const filters = getAvailableFilters(cards);

  const addFilter = (
    type: keyof Pick<
      QuizConfig,
      "subjects" | "courses" | "modules" | "categories" | "tags"
    >,
    value: string,
  ) => {
    if (value && !config[type].includes(value)) {
      setConfig((prev) => ({
        ...prev,
        [type]: [...prev[type], value],
      }));
    }
  };

  const removeFilter = (
    type: keyof Pick<
      QuizConfig,
      "subjects" | "courses" | "modules" | "categories" | "tags"
    >,
    value: string,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item !== value),
    }));
  };

  const filteredCardCount = cards.filter((card) => {
    let keep = true;
    if (config.subjects.length > 0)
      keep = keep && config.subjects.includes(card.subject);
    if (config.courses.length > 0)
      keep = keep && config.courses.includes(card.course);
    if (config.modules.length > 0)
      keep = keep && config.modules.includes(card.module);
    if (config.categories.length > 0)
      keep = keep && config.categories.includes(card.category);
    if (config.tags.length > 0)
      keep =
        keep && (card.tags?.some((tag) => config.tags.includes(tag)) ?? false);
    return keep;
  }).length;

  const canStartQuiz = filteredCardCount > 0 && config.questionCount > 0;

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setProgress(0);
    setStatus("Initializing...");
    setErrors([]);

    try {
      // Check cache first
      const cacheKey = generateCacheKey(config);
      const questions = useCache ? getCachedAIQuiz(cacheKey) : null;

      if (questions && questions.length > 0) {
        setStatus("Using cached questions...");
        setProgress(100);
        setTimeout(() => {
          onStartQuiz(questions);
        }, 500);
        return;
      }

      // Generate new questions
      const result = await generateAIQuiz(cards, config, (prog, stat) => {
        setProgress(prog);
        setStatus(stat);
      });

      if (result.questions.length > 0) {
        // Cache the results
        if (useCache) {
          setCachedAIQuiz(cacheKey, result.questions);
        }

        setStatus("Quiz ready!");
        setTimeout(() => {
          onStartQuiz(result.questions);
        }, 500);
      } else {
        setErrors([
          "No questions were generated. Please try again or check your API configuration.",
        ]);
      }

      if (result.errors.length > 0) {
        setErrors(result.errors);
      }
    } catch (error) {
      console.error("AI Quiz generation failed:", error);
      setErrors([
        error instanceof Error ? error.message : "Unknown error occurred",
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold">AI Quiz Generator</h1>
              <Badge variant="secondary" className="text-xs">
                Powered by Gemini
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isGenerating}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 py-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* API Key Warning */}
          {!process.env.NEXT_PUBLIC_GEMINI_API_KEY && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Gemini API key not configured. Add{" "}
                <code>NEXT_PUBLIC_GEMINI_API_KEY</code> to your environment
                variables.
              </AlertDescription>
            </Alert>
          )}

          {/* Progress */}
          {isGenerating && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-spin text-primary" />
                    <span className="font-medium">
                      Generating AI Quiz Questions...
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{status}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Content Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subjects */}
              <div className="space-y-2">
                <Label>Subjects</Label>
                <Select onValueChange={(value) => addFilter("subjects", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add subject filter..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {config.subjects.map((subject) => (
                    <Badge
                      key={subject}
                      variant="secondary"
                      className="text-xs"
                    >
                      {subject}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeFilter("subjects", subject)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <Label>Categories</Label>
                <Select
                  onValueChange={(value) => addFilter("categories", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add category filter..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {config.categories.map((category) => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="text-xs"
                    >
                      {category}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeFilter("categories", category)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <Select onValueChange={(value) => addFilter("tags", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add tag filter..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.tags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {config.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeFilter("tags", tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Settings */}
          <Card>
            <CardHeader>
              <CardTitle>AI Quiz Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="questionCount">Number of Questions</Label>
                <Input
                  id="questionCount"
                  type="number"
                  min="1"
                  max={Math.min(filteredCardCount, 50)}
                  value={config.questionCount}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      questionCount: Math.min(
                        Number.parseInt(e.target.value) || 1,
                        filteredCardCount,
                      ),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Available cards with current filters: {filteredCardCount}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useCache"
                  checked={useCache}
                  onCheckedChange={(checked) => setUseCache(checked === true)}
                />
                <Label htmlFor="useCache" className="text-sm">
                  Use cached questions when available (faster)
                </Label>
              </div>

              <div className="p-3 bg-muted rounded-lg text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium">AI Enhancement Features:</span>
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    • Intelligent multiple-choice questions with plausible
                    distractors
                  </li>
                  <li>• Context-aware wrong answers from related concepts</li>
                  <li>• Difficulty-matched question complexity</li>
                  <li>• Enhanced question phrasing for clarity</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateQuiz}
              disabled={
                !canStartQuiz ||
                isGenerating ||
                !process.env.NEXT_PUBLIC_GEMINI_API_KEY
              }
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating
                ? "Generating..."
                : `Generate AI Quiz (${Math.min(
                    config.questionCount,
                    filteredCardCount,
                  )} questions)`}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isGenerating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
