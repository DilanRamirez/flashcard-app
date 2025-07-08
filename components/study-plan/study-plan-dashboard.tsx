"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  TrendingUp,
  Clock,
  Flag,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  BookOpen,
  Brain,
  Zap,
} from "lucide-react";
import type { Flashcard } from "@/app/page";
import type { StudyPlan } from "@/lib/learning-analytics";
import {
  generateLocalStudyPlan,
  getStoredStudyPlan,
  getAllCardStats,
  getLearningInsights,
} from "@/lib/learning-analytics";
import {
  generateAIStudyPlan,
  getCachedAIStudyPlan,
} from "@/lib/ai-study-recommendations";

interface StudyPathDashboardProps {
  cards: Flashcard[];
  onFilterCards: (cardIds: string[]) => void;
  onClose: () => void;
}

export function StudyPathDashboard({
  cards,
  onFilterCards,
  onClose,
}: StudyPathDashboardProps) {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiPlan, setAiPlan] = useState<any>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const insights = getLearningInsights(cards);
  const cardStats = getAllCardStats();

  useEffect(() => {
    // Load existing plans
    const localPlan = getStoredStudyPlan();
    const cachedAIPlan = getCachedAIStudyPlan();

    if (localPlan) {
      setStudyPlan(localPlan);
    } else {
      generateLocalPlan();
    }

    if (cachedAIPlan) {
      setAiPlan(cachedAIPlan);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateLocalPlan = () => {
    const plan = generateLocalStudyPlan(cards);
    setStudyPlan(plan);
  };

  const generateAIPlan = async () => {
    setIsGeneratingAI(true);
    setError(null);

    try {
      const result = await generateAIStudyPlan(cardStats, cards);

      if (result.success && result.plan) {
        setAiPlan(result.plan);
      } else {
        setError(result.error || "Failed to generate AI study plan");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getImprovementIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declining":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold">Personalized Study Path</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={generateLocalPlan}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 py-4">
        <div className="max-w-6xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recommendations">Study Plan</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Learning Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold">
                          {formatTime(insights.totalStudyTime)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Study Time
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold">
                          {insights.cardsStudied}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Cards Studied
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold">
                          {Math.round(insights.averageConfidence * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg Confidence
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      {getImprovementIcon(insights.improvementTrend)}
                      <div>
                        <div className="text-2xl font-bold capitalize">
                          {insights.improvementTrend}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Trend
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              {studyPlan && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-red-200 bg-red-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Flag className="h-4 w-4 text-red-600" />
                        High Priority
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600 mb-2">
                        {studyPlan.high_priority_cards.length}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Cards need attention
                      </p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          onFilterCards(studyPlan.high_priority_cards)
                        }
                      >
                        Study Now
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Mastered
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {studyPlan.mastered_cards.length}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Cards mastered
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => onFilterCards(studyPlan.mastered_cards)}
                      >
                        Review
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Study Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {studyPlan.estimated_study_time}m
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Recommended today
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full bg-transparent"
                      >
                        Start Session
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Study Plan Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              {studyPlan && (
                <>
                  {/* Strategy */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Recommended Strategy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {studyPlan.suggested_strategy}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Focus Areas */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Focus Areas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {studyPlan.focus_areas.map((area, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${getPriorityColor(
                            area.priority,
                          )}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{area.category}</div>
                            <Badge
                              variant="outline"
                              className={getPriorityColor(area.priority)}
                            >
                              {area.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {area.reason}
                          </p>
                          <div className="text-xs text-muted-foreground mt-1">
                            {area.card_count} cards in this category
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Review Topics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Topics to Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {studyPlan.review_topics.map((topic, index) => (
                          <Badge key={index} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="ai-insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI-Powered Study Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!process.env.NEXT_PUBLIC_GEMINI_API_KEY && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Gemini API key required for AI insights. Add{" "}
                        <code>NEXT_PUBLIC_GEMINI_API_KEY</code> to your
                        environment.
                      </AlertDescription>
                    </Alert>
                  )}

                  {!aiPlan && !isGeneratingAI && (
                    <div className="text-center py-8">
                      <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Get Personalized AI Insights
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Let AI analyze your learning patterns and create a
                        customized study plan.
                      </p>
                      <Button
                        onClick={generateAIPlan}
                        disabled={!process.env.NEXT_PUBLIC_GEMINI_API_KEY}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate AI Study Plan
                      </Button>
                    </div>
                  )}

                  {isGeneratingAI && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">
                        Analyzing your learning patterns...
                      </p>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {aiPlan && (
                    <div className="space-y-6">
                      {/* Motivation Message */}
                      <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Zap className="h-5 w-5 text-primary mt-1" />
                            <div>
                              <h4 className="font-medium mb-2">
                                Motivation Boost
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {aiPlan.motivation_message}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Learning Style Insights */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Learning Style Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {aiPlan.learning_style_insights}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Personalized Tips */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Personalized Tips
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {aiPlan.personalized_tips?.map(
                              (tip: string, index: number) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                  <span className="text-sm text-muted-foreground leading-relaxed">
                                    {tip}
                                  </span>
                                </li>
                              ),
                            )}
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Weekly Goals */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            This Weeks Goals
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {aiPlan.weekly_goals?.map(
                              (goal: string, index: number) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-muted-foreground leading-relaxed">
                                    {goal}
                                  </span>
                                </li>
                              ),
                            )}
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Study Schedule */}
                      {aiPlan.study_schedule && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">
                              Suggested Schedule
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {aiPlan.study_schedule.map(
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (day: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                  >
                                    <div>
                                      <div className="font-medium">
                                        {day.day}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {day.focus}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-medium">
                                        {day.duration_minutes}m
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {day.card_ids?.length || 0} cards
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Confidence</span>
                        <span>
                          {Math.round(insights.averageConfidence * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={insights.averageConfidence * 100}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Cards Studied</span>
                        <span>
                          {insights.cardsStudied} / {cards.length}
                        </span>
                      </div>
                      <Progress
                        value={(insights.cardsStudied / cards.length) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studyPlan?.focus_areas.map((area, index) => {
                      const categoryCards = cards.filter(
                        (card) => card.category === area.category,
                      );
                      const studiedCards = categoryCards.filter(
                        (card) => cardStats[card.id]?.times_seen > 0,
                      );
                      const avgConfidence =
                        studiedCards.length > 0
                          ? studiedCards.reduce(
                              (sum, card) =>
                                sum + (cardStats[card.id]?.confidence || 0.5),
                              0,
                            ) / studiedCards.length
                          : 0.5;

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{area.category}</span>
                            <span>{Math.round(avgConfidence * 100)}%</span>
                          </div>
                          <Progress
                            value={avgConfidence * 100}
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            {studiedCards.length} / {categoryCards.length} cards
                            studied
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
