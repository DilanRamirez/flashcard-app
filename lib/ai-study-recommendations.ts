/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Flashcard } from "@/app/page";
import { ai, GEMINI_API_KEY } from "./ai-quiz-generator";
import { CardStats, StudyPlan } from "./learning-analytics";

interface AIStudyRecommendation extends StudyPlan {
  personalized_tips: string[];
  learning_style_insights: string;
  motivation_message: string;
  weekly_goals: string[];
  study_schedule: {
    day: string;
    focus: string;
    duration_minutes: number;
    card_ids: string[];
  }[];
}

// Build AI prompt for study recommendations
function buildStudyRecommendationPrompt(
  cardStats: { [cardId: string]: CardStats },
  cards: Flashcard[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userPreferences?: any,
): string {
  // Prepare card performance data
  const cardPerformance = cards.map((card) => {
    const stats = cardStats[card.id] || {
      confidence: 0.5,
      flagged: false,
      times_seen: 0,
      answered_correctly: null,
      quiz_attempts: 0,
      quiz_correct: 0,
    };

    return {
      id: card.id,
      category: card.category,
      subject: card.subject,
      difficulty: card.difficulty,
      confidence: stats.confidence,
      times_seen: stats.times_seen,
      flagged: stats.flagged,
      quiz_accuracy:
        (stats.quiz_attempts ?? 0) > 0
          ? (stats.quiz_correct ?? 0) / (stats.quiz_attempts ?? 0)
          : null,
      last_seen: stats.last_seen,
    };
  });

  // Calculate category performance
  const categoryPerformance: {
    [category: string]: {
      avg_confidence: number;
      card_count: number;
      weak_cards: number;
    };
  } = {};

  cardPerformance.forEach((card) => {
    if (!categoryPerformance[card.category]) {
      categoryPerformance[card.category] = {
        avg_confidence: 0,
        card_count: 0,
        weak_cards: 0,
      };
    }
    categoryPerformance[card.category].avg_confidence += card.confidence;
    categoryPerformance[card.category].card_count++;
    if (card.confidence < 0.4 || card.flagged) {
      categoryPerformance[card.category].weak_cards++;
    }
  });

  // Calculate averages
  Object.keys(categoryPerformance).forEach((category) => {
    const data = categoryPerformance[category];
    data.avg_confidence = data.avg_confidence / data.card_count;
  });

  return `You are an expert learning coach and educational psychologist. Analyze the student's flashcard performance data and create a personalized study plan.

**Student Performance Data:**
Total Cards: ${cards.length}
Cards Studied: ${cardPerformance.filter((c) => c.times_seen > 0).length}
Average Confidence: ${(
    cardPerformance.reduce((sum, c) => sum + c.confidence, 0) /
    cardPerformance.length
  ).toFixed(2)}

**Category Performance:**
${Object.entries(categoryPerformance)
  .map(
    ([category, data]) =>
      `- ${category}: ${data.card_count} cards, ${(
        data.avg_confidence * 100
      ).toFixed(0)}% confidence, ${data.weak_cards} weak cards`,
  )
  .join("\n")}

**Individual Card Performance (showing challenging cards):**
${cardPerformance
  .filter((card) => card.confidence < 0.6 || card.flagged)
  .slice(0, 10)
  .map(
    (card) =>
      `- ${card.category}: Confidence ${(card.confidence * 100).toFixed(
        0,
      )}%, Seen ${card.times_seen} times${card.flagged ? " (FLAGGED)" : ""}`,
  )
  .join("\n")}

Please provide a comprehensive study plan in JSON format:

{
  "high_priority_cards": ["card_id1", "card_id2"],
  "review_topics": ["category1", "category2"],
  "mastered_cards": ["card_id3", "card_id4"],
  "skipped_cards": ["card_id5"],
  "suggested_strategy": "Detailed strategy explanation",
  "focus_areas": [
    {
      "category": "category_name",
      "priority": "high|medium|low",
      "reason": "explanation",
      "card_count": 10
    }
  ],
  "next_review_date": "2025-07-09T10:00:00Z",
  "estimated_study_time": 30,
  "personalized_tips": [
    "Specific tip 1 based on performance patterns",
    "Specific tip 2 for improvement",
    "Specific tip 3 for motivation"
  ],
  "learning_style_insights": "Analysis of the student's learning patterns and suggested approaches",
  "motivation_message": "Encouraging message highlighting progress and next steps",
  "weekly_goals": [
    "Specific goal 1 for this week",
    "Specific goal 2 for this week",
    "Specific goal 3 for this week"
  ],
  "study_schedule": [
    {
      "day": "Monday",
      "focus": "High priority cards in Security category",
      "duration_minutes": 20,
      "card_ids": ["card_id1", "card_id2"]
    }
  ],
  "generated_at": "${new Date().toISOString()}"
}

Guidelines:
- Prioritize cards with confidence < 0.4 or flagged cards
- Consider spaced repetition principles
- Balance challenging content with confidence-building
- Provide actionable, specific recommendations
- Be encouraging and motivational
- Consider the student's current performance trends`;
}

// Call Gemini API for study recommendations
async function callGeminiForStudyPlan(
  prompt: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    if (
      !result.candidates ||
      !result.candidates[0] ||
      !result.candidates[0].content?.parts ||
      !result.candidates[0].content.parts[0]?.text
    ) {
      throw new Error("Invalid response format from Gemini API");
    }

    const generatedText = result.candidates[0].content.parts[0].text;
    return { success: true, data: generatedText };
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown API error",
    };
  }
}

// Parse AI study plan response
function parseAIStudyPlan(responseText: string): AIStudyRecommendation | null {
  try {
    // Clean up the response
    let cleanText = responseText.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/```json\n?/, "").replace(/\n?```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/```\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleanText);

    // Validate required fields
    if (
      !parsed.high_priority_cards ||
      !Array.isArray(parsed.high_priority_cards)
    ) {
      throw new Error("Invalid study plan format");
    }

    return parsed as AIStudyRecommendation;
  } catch (error) {
    console.error("Failed to parse AI study plan:", error);
    console.error("Raw response:", responseText);
    return null;
  }
}

// Generate AI-powered study recommendations
export async function generateAIStudyPlan(
  cardStats: { [cardId: string]: CardStats },
  cards: Flashcard[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userPreferences?: any,
): Promise<{ success: boolean; plan?: AIStudyRecommendation; error?: string }> {
  if (!GEMINI_API_KEY) {
    return { success: false, error: "Gemini API key not configured" };
  }

  try {
    const prompt = buildStudyRecommendationPrompt(
      cardStats,
      cards,
      userPreferences,
    );
    const apiResult = await callGeminiForStudyPlan(prompt);

    if (!apiResult.success) {
      return { success: false, error: apiResult.error };
    }

    const plan = parseAIStudyPlan(apiResult.data);

    if (!plan) {
      return {
        success: false,
        error: "Failed to parse study plan from AI response",
      };
    }

    // Store the plan
    localStorage.setItem("ai_study_plan", JSON.stringify(plan));

    return { success: true, plan };
  } catch (error) {
    console.error("Error generating AI study plan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Get cached AI study plan
export function getCachedAIStudyPlan(): AIStudyRecommendation | null {
  try {
    const cached = localStorage.getItem("ai_study_plan");
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}
