"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shuffle, ArrowUpDown } from "lucide-react";

interface ProgressIndicatorProps {
  currentIndex: number;
  total: number;
  isShuffled: boolean;
  onShuffleToggle: () => void;
}

export function ProgressIndicator({
  currentIndex,
  total,
  isShuffled,
  onShuffleToggle,
}: ProgressIndicatorProps) {
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {currentIndex + 1} of {total}
          </div>
          <Badge variant="outline" className="text-xs">
            {Math.round(progress)}%
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onShuffleToggle}
          className={`h-8 px-3 text-xs ${isShuffled ? "bg-primary/10" : ""}`}
        >
          {isShuffled ? (
            <>
              <Shuffle className="h-3 w-3 mr-1" />
              Shuffled
            </>
          ) : (
            <>
              <ArrowUpDown className="h-3 w-3 mr-1" />
              Sequential
            </>
          )}
        </Button>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
