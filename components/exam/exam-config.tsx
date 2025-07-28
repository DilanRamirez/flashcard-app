import { aiExamGenerator } from "@/lib/ai-quiz-generator";
import {
  Card,
  CardContent,
  TextField,
  Box,
  Typography,
  Stack,
} from "@mui/material";
import { AlertCircle, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import React, { FC, useRef, useState } from "react";
import { Button } from "../ui/button";

interface ExamConfigProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onStartQuiz: (questions: any[]) => void;
  onClose?: () => void;
}
const ExamConfig: FC<ExamConfigProps> = ({ onStartQuiz, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiProgress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const ref = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setProgress(0);
    setStatus("Initializing...");
    setErrors([]);

    try {
      // Generate new questions
      const result = await aiExamGenerator(questionCount, (prog, stat) => {
        setProgress(prog);
        setStatus(stat);
      });

      if (result.questions.length > 0) {
        setStatus("Quiz ready!");
        setTimeout(() => {
          onStartQuiz(result.questions);
        }, 500);
      } else {
        setErrors([
          "No questions were generated. Please try again or check your API configuration.",
        ]);
      }

      if (result.errors.length > 0) {
        setErrors(result.errors);
      }
    } catch (error) {
      console.error("AI Quiz generation failed:", error);
      setErrors([
        error instanceof Error ? error.message : "Unknown error occurred",
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`w-full h-full flex flex-col relative overflow-auto`}>
      <Box
        className="w-full h-20 flex flex-col justify-center px-6"
        sx={{ backgroundColor: "#333333", color: "#ffffff" }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <div className="text-center">
            <Typography variant="h5">AI Quiz Generator</Typography>
          </div>
          <Button
            onClick={onClose}
            className="mt-2"
            variant="outline"
            style={{ color: "#000" }}
          >
            <span className="text-sm">Close</span>
          </Button>
        </Stack>
      </Box>
      {!isGenerating && (
        <Box className="max-w-md mx-auto px-6 py-4 w-full">
          <Card>
            <CardContent className="space-y-4">
              <Typography variant="body2" marginBottom={5}>
                Enter the number of questions below and click Generate Quiz to
                begin.
              </Typography>
              <Box className="flex flex-col gap-4">
                <TextField
                  label="Number of Questions"
                  type="number"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  inputProps={{ min: 1, max: 100 }}
                  fullWidth
                />
                <Button variant="outline" onClick={handleGenerateQuiz}>
                  Generate Quiz
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Progress */}

      {isGenerating && (
        <div ref={ref} className="flex-1">
          <div ref={contentRef} className="max-w-3xl mx-auto px-6 sm:mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-spin text-primary" />
                    <span className="font-medium">
                      Generating AI Quiz Questions...
                    </span>
                  </div>
                  <Progress value={aiProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{status}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Errors */}

      {errors.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white p-4 rounded shadow-lg z-50 flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1 space-y-1">
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setErrors([])}
            className="text-white"
          >
            ×
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExamConfig;
