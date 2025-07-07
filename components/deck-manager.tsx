"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, FileText, RefreshCw, Upload, Plus } from "lucide-react";
import { validateDeckData } from "@/lib/deck-loader";

interface DeckManagerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddDeck: (deckData: any, filename: string) => boolean;
  onRefreshDecks: () => void;
}

export function DeckManager({ onAddDeck, onRefreshDecks }: DeckManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [showJsonInput, setShowJsonInput] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      alert("Please select a JSON file");
      return;
    }

    try {
      setIsUploading(true);
      const text = await file.text();
      const data = JSON.parse(text);

      const validation = validateDeckData(data);
      if (!validation.valid) {
        alert(`Invalid deck format: ${validation.error}`);
        return;
      }

      const success = onAddDeck(data, file.name);
      if (success) {
        alert(`Deck "${file.name}" loaded successfully!`);
      } else {
        alert("Failed to load deck. Please check the format.");
      }
    } catch (error) {
      console.error("Error uploading deck:", error);
      alert("Error loading deck file. Please check the JSON format.");
    } finally {
      setIsUploading(false);
      event.target.value = ""; // Reset file input
    }
  };

  const handleJsonSubmit = () => {
    if (!jsonInput.trim()) {
      alert("Please enter JSON data");
      return;
    }

    try {
      const data = JSON.parse(jsonInput);
      const validation = validateDeckData(data);

      if (!validation.valid) {
        alert(`Invalid deck format: ${validation.error}`);
        return;
      }

      const filename = data.name
        ? `${data.name.toLowerCase().replace(/\s+/g, "-")}.json`
        : "custom-deck.json";
      const success = onAddDeck(data, filename);

      if (success) {
        alert("Deck loaded successfully!");
        setJsonInput("");
        setShowJsonInput(false);
      } else {
        alert("Failed to load deck. Please check the format.");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("Invalid JSON format. Please check your syntax.");
    }
  };

  const downloadSampleDeck = () => {
    const sampleDeck = {
      name: "Sample Geography Deck",
      description: "A sample flashcard deck to get you started",
      category: "Geography",
      cards: [
        {
          id: "geo-1",
          front: "What is the capital of France?",
          back: "Paris",
          example: "Paris is located in northern France on the Seine River.",
          mnemonic: "Paris = City of Light",
          category: "European Capitals",
          subject: "World Geography",
          course: "Geography 101",
          module: "Module 1",
          difficulty: "Beginner",
          tags: ["geography", "capitals", "europe"],
        },
        {
          id: "geo-2",
          front: "What is the largest ocean on Earth?",
          back: "Pacific Ocean",
          example:
            "The Pacific Ocean covers about 46% of the world's water surface.",
          mnemonic: "Pacific = Peaceful and Huge",
          category: "Physical Geography",
          subject: "World Geography",
          course: "Geography 101",
          module: "Module 1",
          difficulty: "Beginner",
          tags: ["geography", "oceans", "physical"],
        },
      ],
    };

    const blob = new Blob([JSON.stringify(sampleDeck, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-deck.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Deck Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="deck-upload">Upload JSON File</Label>
          <div className="flex items-center gap-2">
            <Input
              id="deck-upload"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="flex-1"
            />
            <Button onClick={onRefreshDecks} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Upload a JSON file containing flashcard data
          </p>
        </div>

        <div className="space-y-2">
          <Label>Paste JSON Data</Label>
          <div className="space-y-2">
            <Button
              onClick={() => setShowJsonInput(!showJsonInput)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showJsonInput ? "Hide" : "Show"} JSON Input
            </Button>

            {showJsonInput && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Paste your JSON deck data here..."
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="min-h-[120px] font-mono text-sm"
                />
                <Button
                  onClick={handleJsonSubmit}
                  className="w-full"
                  disabled={!jsonInput.trim()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Load Deck from JSON
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Quick Actions</Label>
          <div className="flex gap-2">
            <Button onClick={downloadSampleDeck} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Sample
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>JSON Format</Label>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Supported formats:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>
                Array of cards: <code>[{"{card1, card2, ...}"}]</code>
              </li>
              <li>
                Object with metadata:{" "}
                <code>{`{"name": "...", "cards": [...]}`}</code>
              </li>
            </ul>
            <p className="mt-2">
              Each card must have: <code>id</code>, <code>front</code>,{" "}
              <code>back</code>
            </p>
            <p>
              Optional fields: <code>example</code>, <code>mnemonic</code>,{" "}
              <code>category</code>, <code>subject</code>, <code>course</code>,{" "}
              <code>module</code>, <code>difficulty</code>, <code>tags</code>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
