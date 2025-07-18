"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Settings, Trash2, Download, Upload } from "lucide-react";
import type { Preferences } from "@/types/study";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: Preferences;
  onPreferencesChange: (preferences: Preferences) => void;
  onResetData: () => void;
}

export function SettingsPanel({
  open,
  onOpenChange,
  preferences,
  onPreferencesChange,
  onResetData,
}: SettingsPanelProps) {
  const updatePreference = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) => {
    onPreferencesChange({ ...preferences, [key]: value });
  };

  const exportData = () => {
    const data = {
      preferences,
      studyData: JSON.parse(localStorage.getItem("awsStudyApp_v1") || "{}"),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aws-study-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.preferences) {
            onPreferencesChange(data.preferences);
          }
          if (data.studyData) {
            localStorage.setItem(
              "awsStudyApp_v1",
              JSON.stringify(data.studyData),
            );
            window.location.reload(); // Reload to apply imported data
          }
        } catch (error) {
          alert("Invalid backup file format");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Theme Settings */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Appearance</Label>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-600">Theme</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value: "light" | "dark" | "auto") =>
                    updatePreference("theme", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-600">Font Size</Label>
                <Select
                  value={preferences.fontSize}
                  onValueChange={(value: "small" | "med" | "large") =>
                    updatePreference("fontSize", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="med">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-600">Font Family</Label>
                <Select
                  value={preferences.fontFamily}
                  onValueChange={(
                    value: "default" | "mono" | "open-dyslexic",
                  ) => updatePreference("fontFamily", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="mono">Monospace</SelectItem>
                    <SelectItem value="open-dyslexic">OpenDyslexic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-600 mb-2 block">
                  Line Height: {preferences.lineHeight}
                </Label>
                <Slider
                  value={[preferences.lineHeight]}
                  onValueChange={([value]) =>
                    updatePreference("lineHeight", value)
                  }
                  min={1.2}
                  max={2.0}
                  step={0.1}
                  className="mt-2 touch-manipulation"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Data Management */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Data Management</Label>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={exportData}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Study Data
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={importData}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Study Data
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset All Study Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your progress, bookmarks,
                      highlights, and notes. This action cannot be undone.
                      Consider exporting your data first.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onResetData}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Reset Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <Separator />

          {/* App Info */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">About</Label>
            <div className="text-xs text-gray-600 space-y-1">
              <p>AWS Cloud Practitioner Study App</p>
              <p>Version 1.0.0</p>
              <p>All data stored locally in your browser</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
