"use client";

import { Box, Button } from "@mui/material";
import { Grid3X3, List, Square } from "lucide-react";

interface ViewModeToggleProps {
  viewMode: "single" | "grid" | "list";
  onViewModeChange: (mode: "single" | "grid" | "list") => void;
}

export function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: ViewModeToggleProps) {
  return (
    <Box
      sx={{ width: "100%", display: "flex", gap: 0.5, mt: "7px !important" }}
    >
      <Button
        size="small"
        onClick={() => onViewModeChange("single")}
        sx={{
          width: "100%",
          fontSize: "0.75rem",
          border: "#fff 0.5px solid",
          color: viewMode === "single" ? "#000" : "white.main",
          backgroundColor: viewMode === "single" ? "#eee" : "primary.main",

          py: 0.5,
        }}
      >
        <Square className="h-4 w-4" />
        <span className="sr-only">Single card view</span>
      </Button>
      <Button
        size="small"
        onClick={() => onViewModeChange("grid")}
        sx={{
          width: "100%",
          fontSize: "0.75rem",
          border: "#fff 0.5px solid",
          color: viewMode === "grid" ? "#000" : "white.main",
          backgroundColor: viewMode === "grid" ? "#eee" : "primary.main",
          py: 0.5,
        }}
      >
        <Grid3X3 className="h-4 w-4" />
        <span className="sr-only">Grid view</span>
      </Button>
      <Button
        size="small"
        onClick={() => onViewModeChange("list")}
        sx={{
          width: "100%",
          fontSize: "0.75rem",
          border: "#fff 0.5px solid",
          color: viewMode === "list" ? "#000" : "white.main",
          backgroundColor: viewMode === "list" ? "#eee" : "primary.main",
          py: 0.5,
          px: 1,
        }}
      >
        <List className="h-4 w-4" />
        <span className="sr-only">List view</span>
      </Button>
    </Box>
  );
}
