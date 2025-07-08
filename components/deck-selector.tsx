"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Flashcard } from "@/app/page";

export interface Deck {
  id: string;
  course: string;
  name: string;
  cards: Flashcard[];
}

interface DeckSelectorProps {
  decks: Deck[];
  currentDeckId: string;
  onDeckChange: (deckId: string) => void;
}

export function DeckSelector({
  decks,
  currentDeckId,
  onDeckChange,
}: DeckSelectorProps) {
  // Group decks by course
  const groupedDecks: Record<string, Deck[]> = decks.reduce(
    (acc, deck) => {
      const course = deck.course;
      if (!acc[course]) acc[course] = [];
      acc[course].push(deck);
      return acc;
    },
    {} as Record<string, Deck[]>,
  );

  // Sort decks in each course group by id
  Object.values(groupedDecks).forEach((group) => {
    group.sort((a, b) => a.id.localeCompare(b.id));
  });

  return (
    <Select value={currentDeckId} onValueChange={onDeckChange}>
      <SelectTrigger className="w-full h-9 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(groupedDecks).map(([course, decks]) => (
          <SelectGroup key={course}>
            <SelectLabel>{course}</SelectLabel>
            {decks.map((deck) => (
              <SelectItem key={deck.id} value={deck.id} className="text-sm">
                {deck.name} ({deck.cards.length} cards)
              </SelectItem>
            ))}
            <SelectSeparator />
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
