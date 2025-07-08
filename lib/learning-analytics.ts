export interface CardStats {
  confidence: number;
  flagged: boolean;
  times_seen: number;
  answered_correctly: boolean | null;
  last_seen: string;
  known?: boolean; // Optional field to indicate if the card is known
  // Optional extended fields for advanced analytics
  confidence_history?: { date: string; value: number }[];
  quiz_attempts?: number;
  quiz_correct?: number;
  study_time_seconds?: number;
}

export interface StudyPlan {
  high_priority_cards: string[];
  review_topics: string[];
  mastered_cards: string[];
  skipped_cards: string[];
  suggested_strategy: string;
  focus_areas: {
    category: string;
    priority: "high" | "medium" | "low";
    reason: string;
    card_count: number;
  }[];
  next_review_date: string;
  estimated_study_time: number;
  generated_at: string;
}

export interface QuizStats {
  total_attempts: number;
  correct_answers: number;
  accuracy_rate: number;
  average_time_per_question: number;
  weak_categories: string[];
  strong_categories: string[];
}

// Storage keys
const FLASHCARD_STATS_KEY = "flashcard_stats";
const STUDY_PLAN_KEY = "study_plan";
const QUIZ_HISTORY_KEY = "quiz_history";

// Initialize or get card stats with exact schema
export function getCardStats(cardId: string): CardStats {
  const allStats = JSON.parse(
    localStorage.getItem(FLASHCARD_STATS_KEY) || "{}",
  );
  return (
    allStats[cardId] || {
      confidence: 0.5,
      flagged: false,
      times_seen: 0,
      answered_correctly: null,
      last_seen: new Date().toISOString(),
      // Optional extended fields
      confidence_history: [],
      quiz_attempts: 0,
      quiz_correct: 0,
      study_time_seconds: 0,
    }
  );
}

// Update card statistics with exact schema matching
export function updateCardStats(
  cardId: string,
  updates: Partial<CardStats>,
): void {
  const allStats = JSON.parse(
    localStorage.getItem(FLASHCARD_STATS_KEY) || "{}",
  );
  const current = getCardStats(cardId);

  const updated: CardStats = {
    ...current,
    ...updates,
    times_seen:
      updates.times_seen !== undefined
        ? updates.times_seen
        : current.times_seen + 1,
    last_seen: new Date().toISOString(),
  };

  // Update confidence history if confidence changed (optional feature)
  if (
    updates.confidence !== undefined &&
    updates.confidence !== current.confidence &&
    current.confidence_history
  ) {
    updated.confidence_history = [
      ...(current.confidence_history || []),
      {
        date: new Date().toISOString().split("T")[0],
        value: updates.confidence,
      },
    ].slice(-30); // Keep last 30 entries
  }

  allStats[cardId] = updated;
  localStorage.setItem(FLASHCARD_STATS_KEY, JSON.stringify(allStats));
}

// Get all card statistics
export function getAllCardStats(): { [cardId: string]: CardStats } {
  return JSON.parse(localStorage.getItem(FLASHCARD_STATS_KEY) || "{}");
}

// Track quiz performance
export function updateQuizStats(
  cardId: string,
  isCorrect: boolean,
  timeSpent: number,
): void {
  const current = getCardStats(cardId);
  updateCardStats(cardId, {
    quiz_attempts: (current.quiz_attempts ?? 0) + 1,
    quiz_correct: (current.quiz_correct ?? 0) + (isCorrect ? 1 : 0),
    answered_correctly: isCorrect,
    confidence: isCorrect
      ? Math.min(current.confidence + 0.1, 1.0)
      : Math.max(current.confidence - 0.15, 0.0),
    study_time_seconds:
      (current.study_time_seconds ?? 0) + Math.floor(timeSpent / 1000),
  });
}

// Track flashcard interaction
export function trackCardInteraction(
  cardId: string,
  interactionType: "flip" | "flag" | "unflag" | "confidence",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any,
): void {
  const current = getCardStats(cardId);

  switch (interactionType) {
    case "flip":
      updateCardStats(cardId, {
        study_time_seconds: current.study_time_seconds + (data?.timeSpent || 5),
      });
      break;
    case "flag":
      updateCardStats(cardId, { flagged: true });
      break;
    case "unflag":
      updateCardStats(cardId, { flagged: false });
      break;
    case "confidence":
      updateCardStats(cardId, {
        confidence: data?.confidence || current.confidence,
      });
      break;
  }
}

// Specific tracking functions for each interaction type
export function trackCardFlip(cardId: string, isFlipped: boolean): void {
  updateCardStats(cardId, { flagged: isFlipped });
}

export function trackConfidenceRating(
  cardId: string,
  confidence: number,
): void {
  updateCardStats(cardId, { confidence });
}

export function trackCardFlag(cardId: string, flagged: boolean): void {
  updateCardStats(cardId, { flagged });
}

export function trackQuizAnswer(cardId: string, isCorrect: boolean): void {
  const current = getCardStats(cardId);
  updateCardStats(cardId, {
    answered_correctly: isCorrect,
    quiz_attempts: (current.quiz_attempts || 0) + 1,
    quiz_correct: (current.quiz_correct || 0) + (isCorrect ? 1 : 0),
  });
}

// Generate local study recommendations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateLocalStudyPlan(cards: any[]): StudyPlan {
  const allStats = getAllCardStats();
  const highPriority: string[] = [];
  const mastered: string[] = [];
  const reviewTopics = new Set<string>();
  const focusAreas: StudyPlan["focus_areas"] = [];

  // Categorize cards by performance
  const categoryStats: {
    [category: string]: { total: number; weak: number; strong: number };
  } = {};

  cards.forEach((card) => {
    const stats = allStats[card.id] || getCardStats(card.id);

    // Initialize category tracking
    if (!categoryStats[card.category]) {
      categoryStats[card.category] = { total: 0, weak: 0, strong: 0 };
    }
    categoryStats[card.category].total++;

    // Determine card priority
    const isWeak =
      stats.confidence < 0.4 ||
      stats.answered_correctly === false ||
      stats.flagged ||
      ((stats.quiz_attempts ?? 0) > 0 &&
        (stats.quiz_correct ?? 0) / (stats.quiz_attempts ?? 1) < 0.6);

    const isMastered =
      stats.confidence > 0.8 &&
      stats.answered_correctly === true &&
      !stats.flagged &&
      stats.times_seen >= 3;

    if (isWeak) {
      highPriority.push(card.id);
      reviewTopics.add(card.category);
      categoryStats[card.category].weak++;
    } else if (isMastered) {
      mastered.push(card.id);
      categoryStats[card.category].strong++;
    }
  });

  // Generate focus areas
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const weakPercentage = stats.weak / stats.total;
    let priority: "high" | "medium" | "low" = "low";
    let reason = "Good progress in this area";

    if (weakPercentage > 0.5) {
      priority = "high";
      reason = `${Math.round(weakPercentage * 100)}% of cards need attention`;
    } else if (weakPercentage > 0.25) {
      priority = "medium";
      reason = `${Math.round(weakPercentage * 100)}% of cards could use review`;
    }

    focusAreas.push({
      category,
      priority,
      reason,
      card_count: stats.total,
    });
  });

  // Sort focus areas by priority
  focusAreas.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  // Generate strategy suggestion
  const totalCards = cards.length;
  const weakCards = highPriority.length;
  const masteredCards = mastered.length;

  let strategy = "Continue your steady progress! ";
  if (weakCards > totalCards * 0.3) {
    strategy += `Focus on the ${weakCards} high-priority cards first. `;
  }
  if (masteredCards > totalCards * 0.5) {
    strategy +=
      "You've mastered many cards - consider challenging yourself with quizzes. ";
  }
  if (reviewTopics.size > 0) {
    strategy += `Pay special attention to: ${Array.from(reviewTopics)
      .slice(0, 3)
      .join(", ")}.`;
  }

  const plan: StudyPlan = {
    high_priority_cards: highPriority,
    review_topics: Array.from(reviewTopics),
    mastered_cards: mastered,
    skipped_cards: mastered, // Cards that can be skipped in regular study
    suggested_strategy: strategy,
    focus_areas: focusAreas,
    next_review_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    estimated_study_time: Math.max(highPriority.length * 2, 10), // 2 minutes per high-priority card, min 10 minutes
    generated_at: new Date().toISOString(),
  };

  localStorage.setItem(STUDY_PLAN_KEY, JSON.stringify(plan));
  return plan;
}

// Get stored study plan
export function getStoredStudyPlan(): StudyPlan | null {
  const stored = localStorage.getItem(STUDY_PLAN_KEY);
  return stored ? JSON.parse(stored) : null;
}

// Extract quiz statistics
export function extractQuizStats(): QuizStats {
  const allStats = getAllCardStats();
  const cardStats = Object.values(allStats);

  const totalAttempts = cardStats.reduce(
    (sum, stats) => sum + (stats?.quiz_attempts ?? 0),
    0,
  );
  const correctAnswers = cardStats.reduce(
    (sum, stats) => sum + (stats?.quiz_correct ?? 0),
    0,
  );

  return {
    total_attempts: totalAttempts,
    correct_answers: correctAnswers,
    accuracy_rate: totalAttempts > 0 ? correctAnswers / totalAttempts : 0,
    average_time_per_question: 0, // Would need to track this separately
    weak_categories: [],
    strong_categories: [],
  };
}

// Clear all analytics data
export function clearAnalyticsData(): void {
  localStorage.removeItem(FLASHCARD_STATS_KEY);
  localStorage.removeItem(STUDY_PLAN_KEY);
  localStorage.removeItem(QUIZ_HISTORY_KEY);
}

// Get learning insights
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export function getLearningInsights(cards: any[]): {
  totalStudyTime: number;
  cardsStudied: number;
  averageConfidence: number;
  improvementTrend: "improving" | "stable" | "declining";
  streakDays: number;
} {
  const allStats = getAllCardStats();
  const cardStats = Object.values(allStats);

  const totalStudyTime = cardStats.reduce(
    (sum, stats) => sum + (stats.study_time_seconds ?? 0),
    0,
  );
  const cardsStudied = cardStats.filter((stats) => stats.times_seen > 0).length;
  const averageConfidence =
    cardStats.length > 0
      ? cardStats.reduce((sum, stats) => sum + stats.confidence, 0) /
        cardStats.length
      : 0.5;

  // Calculate improvement trend (simplified)
  const recentConfidence = cardStats
    .filter((stats) => (stats.confidence_history?.length ?? 0) > 1)
    .map((stats) => {
      const history = stats.confidence_history!;
      return history[history.length - 1].value - history[0].value;
    });

  const avgImprovement =
    recentConfidence.length > 0
      ? recentConfidence.reduce((sum, diff) => sum + diff, 0) /
        recentConfidence.length
      : 0;

  let improvementTrend: "improving" | "stable" | "declining" = "stable";
  if (avgImprovement > 0.1) improvementTrend = "improving";
  else if (avgImprovement < -0.1) improvementTrend = "declining";

  return {
    totalStudyTime,
    cardsStudied,
    averageConfidence,
    improvementTrend,
    streakDays: 0, // Would need to implement streak tracking
  };
}
