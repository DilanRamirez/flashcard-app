import type { Flashcard } from "@/app/page";
import { QuizConfig, QuizQuestion } from "@/types/quiz";

export function filterCards(
  allCards: Flashcard[],
  config: QuizConfig
): Flashcard[] {
  return allCards.filter((card) => {
    let keep = true;

    if (config.subjects.length > 0) {
      keep = keep && config.subjects.includes(card.subject);
    }
    if (config.courses.length > 0) {
      keep = keep && config.courses.includes(card.course);
    }
    if (config.modules.length > 0) {
      keep = keep && config.modules.includes(card.module);
    }
    if (config.categories.length > 0) {
      keep = keep && config.categories.includes(card.category);
    }
    if (config.tags.length > 0) {
      keep =
        keep && (card.tags?.some((tag) => config.tags.includes(tag)) ?? false);
    }

    return keep;
  });
}

export function generateQuiz(
  allCards: Flashcard[],
  config: QuizConfig
): QuizQuestion[] {
  const filteredCards = filterCards(allCards, config);
  if (filteredCards.length === 0) {
    return [];
  }

  // Shuffle and limit cards
  const shuffledCards = [...filteredCards].sort(() => Math.random() - 0.5);
  const selectedCards = shuffledCards.slice(
    0,
    Math.min(config.questionCount, filteredCards.length)
  );

  const questions: QuizQuestion[] = [];
  const questionTypes =
    config.questionTypes.length > 0
      ? config.questionTypes
      : ["multiple-choice"];

  selectedCards.forEach((card, index) => {
    // Cycle through question types or pick randomly
    const questionType = questionTypes[index % questionTypes.length];

    switch (questionType) {
      case "multiple-choice":
        questions.push(generateMultipleChoice(card, filteredCards));
        break;
      case "fill-in-blank":
        questions.push(generateFillInBlank(card));
        break;
      case "true-false":
        questions.push(generateTrueFalse(card, filteredCards));
        break;
      case "matching":
        // For matching, we need multiple cards
        if (index === 0 && selectedCards.length >= 4) {
          questions.push(generateMatching(selectedCards.slice(0, 4)));
        }
        break;
    }
  });

  // Remove any null questions and ensure we have questions
  return questions.filter(Boolean);
}

function generateMultipleChoice(
  card: Flashcard,
  allCards: Flashcard[]
): QuizQuestion {
  const correctAnswer = card.back;

  // Get distractors from same category or with shared tags
  const potentialDistractors = allCards.filter(
    (c) =>
      c.id !== card.id &&
      (c.category === card.category ||
        (card.tags && c.tags && card.tags.some((tag) => c.tags?.includes(tag))))
  );

  // Get 3 random distractors
  const shuffledDistractors = potentialDistractors.sort(
    () => Math.random() - 0.5
  );
  const distractors = shuffledDistractors.slice(0, 3).map((c) => c.back);

  // If we don't have enough distractors, get from any other cards
  while (distractors.length < 3 && distractors.length < allCards.length - 1) {
    const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
    if (randomCard.id !== card.id && !distractors.includes(randomCard.back)) {
      distractors.push(randomCard.back);
    }
  }

  // Shuffle options
  const options = [correctAnswer, ...distractors].sort(
    () => Math.random() - 0.5
  );

  return {
    id: `mc-${card.id}`,
    type: "multiple-choice",
    cardId: card.id,
    question: card.front,
    correctAnswer,
    options,
  };
}

function generateFillInBlank(card: Flashcard): QuizQuestion {
  const text = card.back;
  const words = text.split(/\s+/);

  // Find key terms to blank out
  let keyWords: string[] = [];

  // First try to use tags as key words
  if (card.tags) {
    keyWords = card.tags.filter((tag) =>
      text.toLowerCase().includes(tag.toLowerCase())
    );
  }

  // If no tag matches, find the longest words
  if (keyWords.length === 0) {
    const sortedWords = words
      .filter(
        (word) =>
          word.length > 3 &&
          !/^(the|and|or|but|in|on|at|to|for|of|with|by)$/i.test(word)
      )
      .sort((a, b) => b.length - a.length);
    keyWords = sortedWords.slice(0, Math.min(2, sortedWords.length));
  }

  // Create blanked text
  let blankedText = text;
  const blanks: string[] = [];

  keyWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    if (regex.test(blankedText)) {
      blankedText = blankedText.replace(regex, "______");
      blanks.push(word.toLowerCase());
    }
  });

  return {
    id: `fib-${card.id}`,
    type: "fill-in-blank",
    cardId: card.id,
    question: card.front,
    correctAnswer: card.back,
    originalText: blankedText,
    blanks,
  };
}

function generateTrueFalse(
  card: Flashcard,
  allCards: Flashcard[]
): QuizQuestion {
  const isTrue = Math.random() > 0.5;
  let statement = card.back;

  if (!isTrue) {
    // Create a false statement by swapping key terms
    const words = statement.split(/\s+/);
    const potentialReplacements = allCards
      .filter((c) => c.id !== card.id && c.category === card.category)
      .flatMap((c) => c.back.split(/\s+/))
      .filter((word) => word.length > 3);

    if (potentialReplacements.length > 0) {
      // Find a word to replace
      const keyWord = words.find((word) => word.length > 4);
      if (keyWord) {
        const replacement =
          potentialReplacements[
            Math.floor(Math.random() * potentialReplacements.length)
          ];
        statement = statement.replace(keyWord, replacement);
      }
    }
  }

  return {
    id: `tf-${card.id}`,
    type: "true-false",
    cardId: card.id,
    question: `True or False: ${statement}`,
    correctAnswer: isTrue ? "True" : "False",
    isTrue,
  };
}

function generateMatching(cards: Flashcard[]): QuizQuestion {
  const pairs = cards.map((card) => ({
    left: card.front,
    right: card.back,
    cardId: card.id,
  }));

  // Shuffle the right column
  const shuffledRights = [...pairs.map((p) => p.right)].sort(
    () => Math.random() - 0.5
  );
  const shuffledPairs = pairs.map((pair, index) => ({
    ...pair,
    right: shuffledRights[index],
  }));

  return {
    id: `match-${cards.map((c) => c.id).join("-")}`,
    type: "matching",
    cardId: cards[0].id, // Use first card's ID as primary
    question: "Match each question with its correct answer:",
    correctAnswer: JSON.stringify(
      pairs.reduce((acc, pair) => {
        acc[pair.left] = pair.right;
        return acc;
      }, {} as { [key: string]: string })
    ),
    pairs: shuffledPairs,
  };
}

export function getAvailableFilters(cards: Flashcard[]) {
  const subjects = [...new Set(cards.map((c) => c.subject))].sort();
  const courses = [...new Set(cards.map((c) => c.course))].sort();
  const modules = [...new Set(cards.map((c) => c.module))].sort();
  const categories = [...new Set(cards.map((c) => c.category))].sort();
  const tags = [...new Set(cards.flatMap((c) => c.tags || []))].sort();

  return { subjects, courses, modules, categories, tags };
}
