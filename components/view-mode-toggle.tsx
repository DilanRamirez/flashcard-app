"use client"

import { Button } from "@/components/ui/button"
import { Grid3X3, List, Square } from "lucide-react"

interface ViewModeToggleProps {
  viewMode: "single" | "grid" | "list"
  onViewModeChange: (mode: "single" | "grid" | "list") => void
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center border rounded-md">
      <Button
        variant={viewMode === "single" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("single")}
        className="h-8 px-2 rounded-r-none border-r"
      >
        <Square className="h-3 w-3" />
        <span className="sr-only">Single card view</span>
      </Button>
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("grid")}
        className="h-8 px-2 rounded-none border-r"
      >
        <Grid3X3 className="h-3 w-3" />
        <span className="sr-only">Grid view</span>
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("list")}
        className="h-8 px-2 rounded-l-none"
      >
        <List className="h-3 w-3" />
        <span className="sr-only">List view</span>
      </Button>
    </div>
  )
}
