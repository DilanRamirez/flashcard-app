import type { Flashcard } from "@/app/page";
import { aiExamPrompt } from "@/components/exam/prompt";
import type { QuizQuestion, QuizConfig } from "@/types/quiz";
import { Chapter } from "@/types/study";
import { GoogleGenAI } from "@google/genai";

export const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("Gemini API key not configured");
}
export const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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

  return `You are an AWS certification quiz generator. Below are ${flashcards.length} flashcards. For each, generate a high-quality multiple-choice quiz question in the style of official AWS certification exams 
  (Cloud Practitioner, Solutions Architect Associate, etc.).

Instructions:
- Use a scenario or short context, as in real AWS exam questions.
- Rephrase the flashcard question into a clear, engaging quiz-style question
- Use the flashcard answer as the correct answer (may rephrase for clarity)
- Create 3 plausible, challenging distractors that are related but clearly wrong
- ${difficultyInstruction}
- Ensure distractors are from the same domain/context as the correct answer
- Make the tone and logic match real AWS exam questions (no overly simple wording).
- The choices must NOT be obvious or silly; each should be a reasonable option.
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

/**
 * Generate an AI-powered quiz for a single chapter.
 *
 * @param chapter - The chapter to quiz on.
 * @param onProgress - Optional callback for progress updates.
 * @returns A promise resolving to generated questions and any errors.
 */
export async function generateChapterAIQuiz(
  chapter: Chapter,
  onProgress?: (progress: number, status: string) => void,
): Promise<{ questions: QuizQuestion[]; errors: string[] }> {
  // 1. Check API key
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment.",
    );
  }

  const allQuestions: QuizQuestion[] = [];
  const errors: string[] = [];

  onProgress?.(0, `Starting quiz generation for chapter "${chapter.title}"...`);

  try {
    // 3a. Call your AI service with a prompt tailored to chapter context
    const aiResponse = await callGeminiAPI(
      `You are an AWS certification quiz generator. You will be provided with a single Chapter object containing:
- id: the unique chapter identifier
- title: the chapter’s title
- content: the full text of the chapter
- order: the chapter’s position in the course sequence

Format for each chapter:
	1.	Chapter Title  
	2.	Chapter Subtitle (a one-line overview)  
	3.	For each flashcard in the chapter, always use the same Story N: [Metaphor-themed Title] for each term or concept but update it to align with the term and concept.  
	•	Customer Request: Turn the question into a simple, relatable request in your chosen metaphor.  
	•	Everyday Example: Weave the example into a super-clear, low-complexity scenario.    
	•	Metaphor Mapping: Briefly connect AWS services or components back to the story elements.  
	•	Mnemonic: “[mnemonic phrase]”  
	•	Bullet glossary items for that card:  
	•	[Metaphor-themed phrase]: One-line “real-world” summary.  
	•	[Original term]: Formal AWS definition.  
	4.	After all stories, add:  
	•	🔁 Quick Recap: One or two sentences per story that reinforce the metaphor and AWS mapping.  
	•	📘 Glossary: List every bolded term with its AWS definition.

Your task is to generate high-quality, scenario-driven multiple-choice questions styled exactly like official AWS certification exams (Cloud Practitioner).

Instructions:
1. **Chapter Header**  
   1.1. **Chapter Title** (use ${chapter.title})  
   1.2. **Chapter Subtitle** – synthesize a concise one-line overview of the chapter’s key focus, drawn from ${chapter.content}.  
2. **Question Generation**  
   - Use realistic AWS-exam scenarios or short contexts rooted in the chapter’s content.  
   - Rephrase each flashcard-style concept into a clear, engaging question.  
   - Provide **3 plausible, domain-relevant distractors** alongside the correct answer.  
   - Match the tone, complexity, and logical style of real AWS exam items—no trivial language.  
   - Ensure each choice is a reasonable, non-obvious option.  
3. **Metadata Tagging**  
   - In each question’s "metadata" block, set "subject" to the chapter title.  
   - Generate a unique "original_card_id" by combining the chapter’s id and a per-question sequence (e.g. "{chapter.id}-1", "{chapter.id}-2", …).  
4. **Progressive Context**  
   - If you need to refer to the chapter’s sequence, you may mention order in your internal logic, but don’t output it—focus on title and content.

### Chapter Content:
${chapter.content}

### Required Output Format (Raw JSON only) not markdown:
[
  {
    "question": "Clear, engaging multiple-choice question",
    "choices": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Exact text of correct choice",
    "difficulty": "beginner | intermediate | expert",
    "metadata": {
      "subject": "${chapter.title}",
      "course": "generate a course based on chapter context", 
      "category": "generate a category based on chapter context",
      "original_card_id": "generate a unique ID for this question"
    }
  }
]

`,
    );

    if (aiResponse.success) {
      let cleanJson = aiResponse.data.trim();
      if (cleanJson.startsWith("```json")) {
        // Remove markdown code block if present
        cleanJson = cleanJson.replace(/```json\n?/, "").replace(/\n?```$/, "");
      }
      // 3b. Convert from raw AI schema into your app's QuizQuestion[]
      const formatted = JSON.parse(cleanJson).map(convertAIQuestionToAppFormat);
      allQuestions.push(...formatted);
    } else {
      errors.push(`Chunk ${1}: ${aiResponse.error}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    errors.push(`Chunk ${1}: ${err.message}`);
  }

  onProgress?.(100, "AI quiz generation complete!");
  return { questions: allQuestions, errors };
}

export const aiExamGenerator = async (
  numQuestions: number,
  onProgress?: (progress: number, status: string) => void,
) => {
  // 1. Check API key
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment.",
    );
  }

  const allQuestions: QuizQuestion[] = [];
  const errors: string[] = [];
  onProgress?.(0, `Starting exam generation for ${numQuestions} questions...`);

  try {
    const prompt = aiExamPrompt(numQuestions);
    const aiResponse = await callGeminiAPI(prompt);
    if (aiResponse.success) {
      let cleanJson = aiResponse.data.trim();
      if (cleanJson.startsWith("```json")) {
        // Remove markdown code block if present
        cleanJson = cleanJson.replace(/```json\n?/, "").replace(/\n?```$/, "");
      }
      // 3b. Convert from raw AI schema into your app's QuizQuestion[]
      const formatted = JSON.parse(cleanJson).map(convertAIQuestionToAppFormat);
      allQuestions.push(...formatted);
    } else {
      errors.push(`Chunk ${1}: ${aiResponse.error}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    errors.push(`Chunk ${1}: ${err.message}`);
  }
  onProgress?.(100, "AI quiz generation complete!");
  return { questions: allQuestions, errors };
};
