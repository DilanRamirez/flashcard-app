"use client";

import React from "react";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import type { Flashcard } from "@/app/page";
import { Paper } from "@mui/material";

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
  // Determine the currently selected deck object
  const currentDeck = decks.find((deck) => deck.id === currentDeckId);
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
    <Paper sx={{ width: "350px", maxWidth: "100vw" }}>
      <FormControl fullWidth size="small" sx={{ backgroundColor: "white" }}>
        <Select
          fullWidth
          labelId="deck-selector-label"
          id="deck-selector"
          value={currentDeck?.id || ""}
          onChange={(event) => onDeckChange(event.target.value as string)}
        >
          {Object.entries(groupedDecks).flatMap(([course, decks]) => [
            <ListSubheader key={`${course}-label`}>{course}</ListSubheader>,
            ...decks.map((deck) => (
              <MenuItem key={deck.id} value={deck.id}>
                {deck.name} ({deck.cards.length} cards)
              </MenuItem>
            )),
          ])}
        </Select>
      </FormControl>
    </Paper>
  );
}
