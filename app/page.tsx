/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useCallback } from "react";
import { FlashcardViewer } from "@/components/flashcard-viewer";
import { FilterPanel } from "@/components/filter-panel";
import { ProgressIndicator } from "@/components/progress-indicator";
import { Deck, DeckSelector } from "@/components/deck-selector";
import { StudySession } from "@/components/study-session";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent, Button, Typography } from "@mui/material";
import { Box, Container, Stack } from "@mui/material";
import { CircularProgress } from "@mui/material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography as MuiTypography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { GridView } from "@/components/grid-view";
import { ListView } from "@/components/list-view";
import { ViewModeToggle } from "@/components/view-mode-toggle";
import { DeckManager } from "@/components/deck-manager";
import { loadDecks } from "@/lib/deck-loader";

import MenuBookIcon from "@mui/icons-material/MenuBook";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SettingsIcon from "@mui/icons-material/Settings";
import DescriptionIcon from "@mui/icons-material/Description";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  example?: string;
  mnemonic?: string;
  category: string;
  subject: string;
  course: string;
  module: string;
  difficulty?:
    | "easy"
    | "medium"
    | "hard"
    | "Beginner"
    | "Intermediate"
    | "Advanced";
  tags?: string[];
}

export interface UserCardState {
  [cardId: string]: {
    known: boolean;
    flagged: boolean;
    confidence: number;
    lastReviewed?: string;
  };
}

export interface AppState {
  currentDeckId: string;
  currentCardIndex: number;
  isShuffled: boolean;
  searchQuery: string;
  filters: {
    category: string;
    subject: string;
    course: string;
    module: string;
    difficulty: string;
  };
  userCardStates: UserCardState;
  showFilters: boolean;
  studyMode: boolean;
  viewMode: "single" | "grid" | "list";
  showDeckManager: boolean;
}

export default function FlashcardApp() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAllDecks, setShowAllDecks] = useState(false);
  const [appState, setAppState] = useLocalStorage<AppState>(
    "flashcard-app-state",
    {
      currentDeckId: "",
      currentCardIndex: 0,
      isShuffled: false,
      searchQuery: "",
      filters: {
        category: "",
        subject: "",
        course: "",
        module: "",
        difficulty: "",
      },
      userCardStates: {},
      showFilters: false,
      studyMode: false,
      viewMode: "single",
      showDeckManager: false,
    }
  );

  useEffect(() => {
    initializeDecks();
  }, []);

  const initializeDecks = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const loadedDecks = await loadDecks();
      setDecks(loadedDecks);

      // Set initial deck if none selected
      if (
        loadedDecks.length > 0 &&
        !loadedDecks.find((deck) => deck.id === appState.currentDeckId)
      ) {
        setAppState((prev) => ({ ...prev, currentDeckId: loadedDecks[0].id }));
      }
    } catch (error) {
      console.error("Error loading decks:", error);
      setLoadError("Failed to load flashcard decks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomDeck = (deckData: any, filename: string) => {
    try {
      let cards: Flashcard[];
      let deckName: string;
      let deckId: string;

      if (Array.isArray(deckData)) {
        cards = deckData;
        deckName = filename.replace(".json", "").replace(/[-_]/g, " ");
        deckId = filename.replace(".json", "");
      } else if (deckData.cards && Array.isArray(deckData.cards)) {
        cards = deckData.cards;
        deckName =
          deckData.name || filename.replace(".json", "").replace(/[-_]/g, " ");
        deckId = deckData.id || filename.replace(".json", "");
      } else {
        throw new Error("Invalid deck format");
      }

      const newDeck: Deck = {
        id: deckId,
        name: deckName,
        course: typeof deckData.course === "string" ? deckData.course : "",
        cards: cards,
      };

      setDecks((prev) => {
        const filtered = prev.filter((deck) => deck.id !== deckId);
        return [...filtered, newDeck];
      });

      // Switch to the new deck
      setAppState((prev) => ({
        ...prev,
        currentDeckId: deckId,
        currentCardIndex: 0,
      }));

      return true;
    } catch (error) {
      console.error("Error adding custom deck:", error);
      return false;
    }
  };

  const currentDeck =
    decks.find((deck) => deck.id === appState.currentDeckId) || decks[0];

  const filteredCards =
    currentDeck?.cards.filter((card) => {
      const matchesSearch =
        !appState.searchQuery ||
        card.front.toLowerCase().includes(appState.searchQuery.toLowerCase()) ||
        card.back.toLowerCase().includes(appState.searchQuery.toLowerCase()) ||
        card.category
          .toLowerCase()
          .includes(appState.searchQuery.toLowerCase()) ||
        card.subject.toLowerCase().includes(appState.searchQuery.toLowerCase());

      const matchesFilters =
        (!appState.filters.category ||
          card.category === appState.filters.category) &&
        (!appState.filters.subject ||
          card.subject === appState.filters.subject) &&
        (!appState.filters.course || card.course === appState.filters.course) &&
        (!appState.filters.module || card.module === appState.filters.module) &&
        (!appState.filters.difficulty ||
          card.difficulty === appState.filters.difficulty);

      return matchesSearch && matchesFilters;
    }) || [];

  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

  useEffect(() => {
    if (appState.isShuffled) {
      const indices = Array.from({ length: filteredCards.length }, (_, i) => i);
      setShuffledIndices(indices.sort(() => Math.random() - 0.5));
    } else {
      setShuffledIndices(
        Array.from({ length: filteredCards.length }, (_, i) => i)
      );
    }
  }, [appState.isShuffled, filteredCards.length]);

  const displayCards = appState.isShuffled
    ? shuffledIndices.map((i) => filteredCards[i])
    : filteredCards;

  const currentCard = displayCards[appState.currentCardIndex];

  const goToNext = useCallback(() => {
    if (appState.currentCardIndex < displayCards.length - 1) {
      setAppState((prev) => ({
        ...prev,
        currentCardIndex: prev.currentCardIndex + 1,
      }));
    }
  }, [appState.currentCardIndex, displayCards.length, setAppState]);

  const goToPrevious = useCallback(() => {
    if (appState.currentCardIndex > 0) {
      setAppState((prev) => ({
        ...prev,
        currentCardIndex: prev.currentCardIndex - 1,
      }));
    }
  }, [appState.currentCardIndex, setAppState]);

  const goToCard = useCallback(
    (index: number) => {
      if (index >= 0 && index < displayCards.length) {
        setAppState((prev) => ({ ...prev, currentCardIndex: index }));
      }
    },
    [displayCards.length, setAppState]
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (appState.studyMode) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goToPrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          goToNext();
          break;
        case "Home":
          e.preventDefault();
          goToCard(0);
          break;
        case "End":
          e.preventDefault();
          goToCard(displayCards.length - 1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    goToNext,
    goToPrevious,
    goToCard,
    displayCards.length,
    appState.studyMode,
  ]);

  const updateCardState = (
    cardId: string,
    updates: Partial<UserCardState[string]>
  ) => {
    setAppState((prev) => ({
      ...prev,
      userCardStates: {
        ...prev.userCardStates,
        [cardId]: {
          ...prev.userCardStates[cardId],
          ...updates,
          lastReviewed: new Date().toISOString(),
        },
      },
    }));
  };

  const resetFilters = () => {
    setAppState((prev) => ({
      ...prev,
      searchQuery: "",
      filters: {
        category: "",
        subject: "",
        course: "",
        module: "",
        difficulty: "",
      },
      currentCardIndex: 0,
    }));
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress aria-label="Loading decks" />
      </Box>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <Card sx={{ width: "100%", maxWidth: 400 }}>
          <CardContent sx={{ p: 3, textAlign: "center" }}>
            <div style={{ color: "#d32f2f" }}>
              <MenuBookIcon sx={{ fontSize: 48, mb: 2 }} />
              <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>
                Failed to Load Decks
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#888", marginTop: 8 }}>
                {loadError}
              </p>
            </div>
            <Button onClick={initializeDecks} sx={{ width: "100%", mt: 2 }}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <Card sx={{ width: "100%", maxWidth: 400 }}>
          <CardContent sx={{ p: 3, textAlign: "center" }}>
            <MenuBookIcon sx={{ fontSize: 48, color: "#888" }} />
            <div>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>
                No Flashcard Decks Found
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#888", marginTop: 8 }}>
                Use the Deck Manager to upload JSON files or create custom
                decks.
              </p>
            </div>
            <Button
              onClick={initializeDecks}
              variant="outlined"
              sx={{ width: "100%", mt: 2 }}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (appState.studyMode) {
    return (
      <StudySession
        cards={displayCards}
        userCardStates={appState.userCardStates}
        onUpdateCardState={updateCardState}
        onExit={() => setAppState((prev) => ({ ...prev, studyMode: false }))}
      />
    );
  }

  // Hick's Law: deck limiting state
  const visibleDecks = showAllDecks ? decks : decks.slice(0, 5);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container
        maxWidth="xl"
        sx={{
          py: 1,
          bgcolor: "primary.main",
          color: "#fff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: "100%", mb: 1.5 }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <MenuBookIcon fontSize="medium" />
              <Typography variant="h6">Flashcards</Typography>
            </Box>
          </Stack>
          <Box sx={{ overflowX: "auto", width: "100%" }}>
            <Stack
              direction={{ xs: "row", sm: "row" }}
              spacing={{ xs: 0.5, sm: 1 }}
              alignItems="center"
              sx={{ width: "100%", mb: 1 }}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  setAppState((prev) => ({ ...prev, studyMode: true }))
                }
                disabled={displayCards.length === 0}
                aria-label="Start study session"
                sx={{
                  fontSize: "0.75rem",
                  color: displayCards.length === 0 ? "#888" : "inherit",
                  borderColor: "white.main",
                  py: 0.5,
                }}
              >
                <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />
                Study
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  setAppState((prev) => ({
                    ...prev,
                    showFilters: !prev.showFilters,
                  }))
                }
                aria-label="Show filters"
                sx={{
                  fontSize: "0.75rem",
                  color: displayCards.length === 0 ? "#888" : "inherit",
                  borderColor: "white.main",
                  py: 0.5,
                }}
              >
                <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                Filter
              </Button>
              <Button
                color="primary"
                variant="outlined"
                size="small"
                onClick={() =>
                  setAppState((prev) => ({
                    ...prev,
                    showDeckManager: !prev.showDeckManager,
                  }))
                }
                aria-label="Show deck manager"
                sx={{
                  fontSize: "0.75rem",
                  color: displayCards.length === 0 ? "#888" : "inherit",
                  borderColor: "white.main",
                  py: 0.5,
                }}
              >
                <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                Decks
              </Button>
              <ViewModeToggle
                viewMode={appState.viewMode}
                onViewModeChange={(mode) =>
                  setAppState((prev) => ({ ...prev, viewMode: mode }))
                }
              />
            </Stack>
          </Box>
        </Box>
        <Box sx={{ mb: 1.5 }}>
          <DeckSelector
            decks={visibleDecks}
            currentDeckId={appState.currentDeckId}
            onDeckChange={(deckId) =>
              setAppState((prev) => ({
                ...prev,
                currentDeckId: deckId,
                currentCardIndex: 0,
              }))
            }
          />
          {decks.length > 5 && (
            <Button
              size="small"
              onClick={() => setShowAllDecks((prev) => !prev)}
              sx={{ mt: 1 }}
              aria-label={showAllDecks ? "Show less decks" : "Show all decks"}
            >
              {showAllDecks ? "Show Less" : "Show All Decks"}
            </Button>
          )}
        </Box>
      </Container>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Stack spacing={2}>
          {(appState.showFilters || appState.showDeckManager) && (
            <Stack spacing={2}>
              {appState.showFilters && (
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="filters-content"
                    id="filters-header"
                  >
                    <MuiTypography>Filters</MuiTypography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Card sx={{ p: 2 }}>
                      <FilterPanel
                        cards={currentDeck?.cards || []}
                        searchQuery={appState.searchQuery}
                        filters={appState.filters}
                        onSearchChange={(query) =>
                          setAppState((prev) => ({
                            ...prev,
                            searchQuery: query,
                            currentCardIndex: 0,
                          }))
                        }
                        onFilterChange={(filters) =>
                          setAppState((prev) => ({
                            ...prev,
                            filters,
                            currentCardIndex: 0,
                          }))
                        }
                        onReset={resetFilters}
                      />
                    </Card>
                  </AccordionDetails>
                </Accordion>
              )}
              {appState.showDeckManager && (
                <DeckManager
                  onAddDeck={addCustomDeck}
                  onRefreshDecks={initializeDecks}
                />
              )}
            </Stack>
          )}
          {displayCards.length === 0 ? (
            <Card sx={{ p: 3, textAlign: "center" }}>
              <p style={{ color: "#888", fontSize: "0.875rem" }}>
                No cards match your current filters.
              </p>
              <Button
                onClick={resetFilters}
                sx={{ mt: 2 }}
                size="small"
                aria-label="Reset filters"
              >
                Reset Filters
              </Button>
            </Card>
          ) : (
            <Stack spacing={2}>
              {appState.viewMode === "single" && (
                <>
                  <ProgressIndicator
                    currentIndex={appState.currentCardIndex}
                    total={displayCards.length}
                    isShuffled={appState.isShuffled}
                    onShuffleToggle={() =>
                      setAppState((prev) => ({
                        ...prev,
                        isShuffled: !prev.isShuffled,
                        currentCardIndex: 0,
                      }))
                    }
                  />
                  <FlashcardViewer
                    card={currentCard}
                    cardState={appState.userCardStates[currentCard?.id]}
                    onNext={goToNext}
                    onPrevious={goToPrevious}
                    onUpdateCardState={(updates) =>
                      currentCard && updateCardState(currentCard.id, updates)
                    }
                    canGoNext={
                      appState.currentCardIndex < displayCards.length - 1
                    }
                    canGoPrevious={appState.currentCardIndex > 0}
                  />
                </>
              )}
              {appState.viewMode === "grid" && (
                <GridView
                  cards={displayCards}
                  userCardStates={appState.userCardStates}
                  onUpdateCardState={updateCardState}
                />
              )}
              {appState.viewMode === "list" && (
                <ListView
                  cards={displayCards}
                  userCardStates={appState.userCardStates}
                  onUpdateCardState={updateCardState}
                />
              )}
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
