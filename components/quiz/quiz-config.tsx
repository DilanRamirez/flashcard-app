"use client";

import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Play, Settings } from "lucide-react";
import type { Flashcard } from "@/app/page";
import { getAvailableFilters } from "@/lib/quiz-generator";
import { QuestionType, QuizConfig } from "@/types/quiz";
import { Checkbox } from "@mui/material";

interface QuizConfigProps {
  cards: Flashcard[];
  onStartQuiz: (config: QuizConfig) => void;
  onCancel: () => void;
}

const questionTypeLabels: Record<QuestionType, string> = {
  "multiple-choice": "Multiple Choice",
  "fill-in-blank": "Fill in the Blank",
  "true-false": "True/False",
  "multiple-response": "Multiple Response",
  matching: "Matching",
};

export function QuizSetup({ cards, onStartQuiz, onCancel }: QuizConfigProps) {
  const [config, setConfig] = useState<QuizConfig>({
    subjects: [],
    courses: [],
    modules: [],
    categories: [],
    tags: [],
    questionTypes: ["multiple-choice"],
    questionCount: 10,
  });

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

  const toggleQuestionType = (type: QuestionType) => {
    setConfig((prev) => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter((t) => t !== type)
        : [...prev.questionTypes, type],
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

  const canStartQuiz = filteredCardCount > 0 && config.questionTypes.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <h1 className="text-lg font-bold">Quiz Configuration</h1>
            </div>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 py-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Question Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(Object.keys(questionTypeLabels) as QuestionType[]).map(
                (type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={config.questionTypes.includes(type)}
                      onChange={() => toggleQuestionType(type)}
                    />
                    <Label htmlFor={type}>{questionTypeLabels[type]}</Label>
                  </div>
                ),
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
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

              {/* Courses */}
              <div className="space-y-2">
                <Label>Courses</Label>
                <Select onValueChange={(value) => addFilter("courses", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add course filter..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.courses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {config.courses.map((course) => (
                    <Badge key={course} variant="secondary" className="text-xs">
                      {course}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeFilter("courses", course)}
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

          <Card>
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="questionCount">Number of Questions</Label>
                <Input
                  id="questionCount"
                  type="number"
                  min="1"
                  max={filteredCardCount}
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
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={() => onStartQuiz(config)}
              disabled={!canStartQuiz}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Quiz ({Math.min(
                config.questionCount,
                filteredCardCount,
              )}{" "}
              questions)
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
