import type { QuizQuestion } from "@/types/quiz";
import { ai, GEMINI_API_KEY } from "./ai-quiz-generator";

export interface QuestionExplanation {
  questionId: string;
  correctAnswerExplanation: string;
  incorrectAnswerExplanation: string;
  commonMisconceptions: string[];
  keyLearningPoints: string[];
  relatedConcepts: string[];
}

// Build explanation prompt for Gemini
function buildExplanationPrompt(
  question: QuizQuestion,
  userAnswer: string,
  correctAnswer: string,
): string {
  const options = question.options || [];
  const optionsList = options
    .map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`)
    .join("\n");

  return `You are an expert educator. A student answered a quiz question incorrectly and needs a detailed explanation to understand their mistake and learn the correct concept.

**Question:** ${question.question}

**Answer Options:**
${optionsList}

**Student's Answer:** ${userAnswer}
**Correct Answer:** ${correctAnswer}

Please provide a comprehensive explanation that helps the student learn. Return your response as valid JSON in this exact format:

{
  "correctAnswerExplanation": "Detailed explanation of why the correct answer is right, including the underlying concepts and reasoning",
  "incorrectAnswerExplanation": "Specific explanation of why the student's chosen answer is wrong, addressing the misconception",
  "commonMisconceptions": [
    "Common misconception 1 that leads to this type of error",
    "Common misconception 2 related to this topic",
    "Common misconception 3 if applicable"
  ],
  "keyLearningPoints": [
    "Key concept 1 the student should remember",
    "Key concept 2 that helps distinguish correct from incorrect answers",
    "Key concept 3 for deeper understanding"
  ],
  "relatedConcepts": [
    "Related concept 1 that connects to this topic",
    "Related concept 2 for broader understanding",
    "Related concept 3 if relevant"
  ]
}

Guidelines:
- Be encouraging and educational, not condescending
- Focus on understanding concepts, not just memorization
- Explain the logic and reasoning behind answers
- Address why the incorrect answer might seem plausible
- Keep explanations clear and concise but thorough
- Use examples when helpful for understanding`;
}

// Call Gemini API for explanation
async function callGeminiForExplanation(
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

// Parse explanation response
function parseExplanationResponse(
  responseText: string,
): Partial<QuestionExplanation> | null {
  try {
    // Clean up the response - remove markdown code blocks if present
    let cleanText = responseText.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/```json\n?/, "").replace(/\n?```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/```\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleanText);

    // Validate required fields
    if (
      !parsed.correctAnswerExplanation ||
      !parsed.incorrectAnswerExplanation ||
      !Array.isArray(parsed.commonMisconceptions) ||
      !Array.isArray(parsed.keyLearningPoints) ||
      !Array.isArray(parsed.relatedConcepts)
    ) {
      throw new Error("Invalid explanation format");
    }

    return parsed;
  } catch (error) {
    console.error("Failed to parse explanation response:", error);
    console.error("Raw response:", responseText);
    return null;
  }
}

// Generate explanation for a wrong answer
export async function generateQuestionExplanation(
  question: QuizQuestion,
  userAnswer: string,
): Promise<{
  success: boolean;
  explanation?: QuestionExplanation;
  error?: string;
}> {
  if (!GEMINI_API_KEY) {
    return { success: false, error: "Gemini API key not configured" };
  }

  if (!question.correctAnswer) {
    return { success: false, error: "Question missing correct answer" };
  }

  try {
    const prompt = buildExplanationPrompt(
      question,
      userAnswer,
      question.correctAnswer,
    );
    const apiResult = await callGeminiForExplanation(prompt);

    if (!apiResult.success) {
      return { success: false, error: apiResult.error };
    }

    const parsedExplanation = parseExplanationResponse(apiResult.data);

    if (!parsedExplanation) {
      return {
        success: false,
        error: "Failed to parse explanation from AI response",
      };
    }

    const explanation: QuestionExplanation = {
      questionId: question.id,
      correctAnswerExplanation:
        parsedExplanation.correctAnswerExplanation || "",
      incorrectAnswerExplanation:
        parsedExplanation.incorrectAnswerExplanation || "",
      commonMisconceptions: parsedExplanation.commonMisconceptions || [],
      keyLearningPoints: parsedExplanation.keyLearningPoints || [],
      relatedConcepts: parsedExplanation.relatedConcepts || [],
    };

    return { success: true, explanation };
  } catch (error) {
    console.error("Error generating explanation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Cache management for explanations
const EXPLANATION_CACHE_KEY = "quiz-explanations-cache";

export function getCachedExplanation(
  questionId: string,
  userAnswer: string,
): QuestionExplanation | null {
  try {
    const cached = localStorage.getItem(EXPLANATION_CACHE_KEY);
    if (!cached) return null;

    const cache = JSON.parse(cached);
    const key = `${questionId}-${userAnswer}`;
    return cache[key] || null;
  } catch {
    return null;
  }
}

export function setCachedExplanation(
  questionId: string,
  userAnswer: string,
  explanation: QuestionExplanation,
): void {
  try {
    const cached = localStorage.getItem(EXPLANATION_CACHE_KEY);
    const cache = cached ? JSON.parse(cached) : {};
    const key = `${questionId}-${userAnswer}`;
    cache[key] = explanation;
    localStorage.setItem(EXPLANATION_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn("Failed to cache explanation:", error);
  }
}
