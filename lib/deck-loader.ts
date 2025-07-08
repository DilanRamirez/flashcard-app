import type { Flashcard } from "@/app/page";
import { Deck } from "@/components/deck-selector";

// Function to load decks from various sources
export async function loadDecks(): Promise<Deck[]> {
  const allDecks = [];

  // Try to load additional decks from public URLs (if available)
  const additionalDeckUrls = [
    // Add URLs to your JSON files here if hosted elsewhere
    "/decks/module-1-1.json",
    "/decks/module-1-2.json",
    "/decks/module-1-3.json",
    "/decks/module-1-4.json",
    "/decks/module-1-5.json",
    "/decks/module-1-6.json",
    "/decks/module-2-1.json",
  ];

  for (const url of additionalDeckUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const deckData = await response.json();
        let cards: Flashcard[];
        let deckName: string;
        let deckId: string;
        let course: string;

        if (Array.isArray(deckData)) {
          cards = deckData;
          deckName =
            url.split("/").pop()?.replace(".json", "").replace(/[-_]/g, " ") ||
            "Custom Deck";
          deckId = url.split("/").pop()?.replace(".json", "") || "custom";
          course = cards[0].course;
        } else if (deckData.cards && Array.isArray(deckData.cards)) {
          cards = deckData.cards;
          deckName = deckData.name || "Custom Deck";
          deckId =
            deckData.id ||
            url.split("/").pop()?.replace(".json", "") ||
            "custom";
          // ensure course is always set, fallback to deckData.course or first card's course
          course =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (deckData as any).course || cards[0]?.course || "Unknown Course";
        } else {
          continue;
        }

        allDecks.push({
          id: deckId,
          name: deckName,
          cards: cards,
          course: course,
        });
      }
    } catch (error) {
      console.warn(`Failed to load deck from ${url}:`, error);
    }
  }

  return allDecks;
}

// Function to validate deck format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateDeckData(data: any): {
  valid: boolean;
  error?: string;
} {
  if (Array.isArray(data)) {
    // Simple array format
    if (data.length === 0) {
      return { valid: false, error: "Deck cannot be empty" };
    }

    for (const card of data) {
      if (!card.id || !card.front || !card.back) {
        return {
          valid: false,
          error: "Each card must have id, front, and back properties",
        };
      }
    }
    return { valid: true };
  } else if (data && typeof data === "object" && data.cards) {
    // Object with metadata format
    if (!Array.isArray(data.cards)) {
      return { valid: false, error: "Cards property must be an array" };
    }

    if (data.cards.length === 0) {
      return { valid: false, error: "Deck cannot be empty" };
    }

    for (const card of data.cards) {
      if (!card.id || !card.front || !card.back) {
        return {
          valid: false,
          error: "Each card must have id, front, and back properties",
        };
      }
    }
    return { valid: true };
  } else {
    return {
      valid: false,
      error:
        "Invalid deck format. Expected array of cards or object with cards array.",
    };
  }
}
