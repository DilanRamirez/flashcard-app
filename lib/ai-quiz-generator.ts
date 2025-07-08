import type { Flashcard } from "@/app/page";
import type { QuizQuestion, QuizConfig } from "@/types/quiz";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("Gemini API key not configured");
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

interface AIQuizQuestion {
  question: string;
  choices: string[];
  correct_answer: string;
  difficulty: "beginner" | "intermediate" | "expert";
  metadata: {
    subject: string;
    course: string;
    category: string;
    original_card_id: string;
  };
}

interface BatchResult {
  questions: AIQuizQuestion[];
  success: boolean;
  error?: string;
}

// Chunk flashcards into optimal batches for Gemini
export function chunkFlashcards(
  cards: Flashcard[],
  batchSize = 6,
): Flashcard[][] {
  const chunks: Flashcard[][] = [];
  for (let i = 0; i < cards.length; i += batchSize) {
    chunks.push(cards.slice(i, i + batchSize));
  }
  return chunks;
}

// Build the optimal prompt for Gemini
function buildGeminiPrompt(
  flashcards: Flashcard[],
  targetDifficulty?: string,
): string {
  const difficultyInstruction = targetDifficulty
    ? `- Target difficulty level: ${targetDifficulty}`
    : `- Match the original flashcard difficulty level, or use "intermediate" if not specified`;

  const flashcardList = flashcards
    .map(
      (card, index) => `
${index + 1}. Subject: ${card.subject}
   Course: ${card.course}
   Category: ${card.category}
   Question: ${card.front}
   Answer: ${card.back}
   Difficulty: ${card.difficulty || "intermediate"}
   Card ID: ${card.id}`,
    )
    .join("\n");

  return `You are an expert quiz generator. Below are ${flashcards.length} flashcards. For each, generate a high-quality multiple-choice quiz question.

Instructions:
- Rephrase the flashcard question into a clear, engaging quiz-style question
- Use the flashcard answer as the correct answer (may rephrase for clarity)
- Create 3 plausible, challenging distractors that are related but clearly wrong
- ${difficultyInstruction}
- Ensure distractors are from the same domain/context as the correct answer
- Return ONLY valid JSON in the exact format shown below

### Flashcards:
${flashcardList}

### Required Output Format (JSON only):
[
  {
    "question": "Clear, engaging multiple-choice question",
    "choices": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Exact text of correct choice",
    "difficulty": "beginner | intermediate | expert",
    "metadata": {
      "subject": "subject from flashcard",
      "course": "course from flashcard", 
      "category": "category from flashcard",
      "original_card_id": "card id from flashcard"
    }
  }
]`;
}

// Call Gemini API with proper error handling
async function callGeminiAPI(
  prompt: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!GEMINI_API_KEY) {
    return { success: false, error: "Gemini API key not configured" };
  }

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

// Parse and validate Gemini JSON response
function parseGeminiResponse(responseText: string): AIQuizQuestion[] {
  try {
    // Clean up the response - remove markdown code blocks if present
    let cleanText = responseText.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/```json\n?/, "").replace(/\n?```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/```\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleanText);

    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array");
    }

    // Validate each question
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return parsed.filter((q: any) => {
      return (
        q.question &&
        Array.isArray(q.choices) &&
        q.choices.length === 4 &&
        q.correct_answer &&
        q.choices.includes(q.correct_answer) &&
        q.difficulty &&
        q.metadata &&
        q.metadata.original_card_id
      );
    });
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    console.error("Raw response:", responseText);
    return [];
  }
}

// Process a single batch of flashcards
async function processBatch(
  flashcards: Flashcard[],
  targetDifficulty?: string,
  retries = 2,
): Promise<BatchResult> {
  const prompt = buildGeminiPrompt(flashcards, targetDifficulty);

  for (let attempt = 0; attempt <= retries; attempt++) {
    const apiResult = await callGeminiAPI(prompt);

    if (!apiResult.success) {
      if (attempt === retries) {
        return { success: false, questions: [], error: apiResult.error };
      }
      continue;
    }

    const questions = parseGeminiResponse(apiResult.data);

    if (questions.length > 0) {
      return { success: true, questions };
    }

    if (attempt === retries) {
      return {
        success: false,
        questions: [],
        error: "Failed to parse valid questions from AI response",
      };
    }
  }

  return { success: false, questions: [], error: "Max retries exceeded" };
}

// Convert AI questions to app format
function convertAIQuestionToAppFormat(
  aiQuestion: AIQuizQuestion,
): QuizQuestion {
  return {
    id: `ai-mc-${aiQuestion.metadata.original_card_id}-${Date.now()}`,
    type: "multiple-choice",
    cardId: aiQuestion.metadata.original_card_id,
    question: aiQuestion.question,
    correctAnswer: aiQuestion.correct_answer,
    options: aiQuestion.choices,
  };
}

// Main AI quiz generation function
export async function generateAIQuiz(
  flashcards: Flashcard[],
  config: QuizConfig,
  onProgress?: (progress: number, status: string) => void,
): Promise<{ questions: QuizQuestion[]; errors: string[] }> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment.",
    );
  }

  // Filter cards based on config (reuse existing filter logic)
  const filteredCards = flashcards.filter((card) => {
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
  });

  if (filteredCards.length === 0) {
    return { questions: [], errors: ["No cards match the selected filters"] };
  }

  // Limit to requested question count
  const selectedCards = filteredCards
    .sort(() => Math.random() - 0.5)
    .slice(0, config.questionCount);

  // Group cards by subject/course for better context
  const groupedCards = groupCardsByContext(selectedCards);
  const batches: Flashcard[][] = [];

  // Create batches from groups
  Object.values(groupedCards).forEach((group) => {
    const groupBatches = chunkFlashcards(group, 6);
    batches.push(...groupBatches);
  });

  const allQuestions: QuizQuestion[] = [];
  const errors: string[] = [];
  let processedBatches = 0;

  onProgress?.(0, "Starting AI quiz generation...");

  // Process batches with progress tracking
  for (const batch of batches) {
    onProgress?.(
      (processedBatches / batches.length) * 100,
      `Processing batch ${processedBatches + 1} of ${batches.length}...`,
    );

    const result = await processBatch(batch);

    if (result.success) {
      const convertedQuestions = result.questions.map(
        convertAIQuestionToAppFormat,
      );
      allQuestions.push(...convertedQuestions);
    } else {
      errors.push(`Batch ${processedBatches + 1}: ${result.error}`);
    }

    processedBatches++;

    // Small delay to avoid rate limiting
    if (processedBatches < batches.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  onProgress?.(100, "AI quiz generation complete!");

  return { questions: allQuestions, errors };
}

// Group cards by subject/course for better AI context
function groupCardsByContext(cards: Flashcard[]): {
  [key: string]: Flashcard[];
} {
  return cards.reduce(
    (groups, card) => {
      const key = `${card.subject}-${card.course}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(card);
      return groups;
    },
    {} as { [key: string]: Flashcard[] },
  );
}

// Cache management for AI-generated questions
const AI_QUIZ_CACHE_KEY = "ai-quiz-cache";

export function getCachedAIQuiz(cacheKey: string): QuizQuestion[] | null {
  try {
    const cached = localStorage.getItem(`${AI_QUIZ_CACHE_KEY}-${cacheKey}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

export function setCachedAIQuiz(
  cacheKey: string,
  questions: QuizQuestion[],
): void {
  try {
    localStorage.setItem(
      `${AI_QUIZ_CACHE_KEY}-${cacheKey}`,
      JSON.stringify(questions),
    );
  } catch (error) {
    console.warn("Failed to cache AI quiz:", error);
  }
}

// Generate cache key from config
export function generateCacheKey(config: QuizConfig): string {
  const configStr = JSON.stringify({
    subjects: config.subjects.sort(),
    courses: config.courses.sort(),
    modules: config.modules.sort(),
    categories: config.categories.sort(),
    tags: config.tags.sort(),
    questionCount: config.questionCount,
  });

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < configStr.length; i++) {
    const char = configStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}
