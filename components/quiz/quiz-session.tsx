/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Clock, ArrowRight } from "lucide-react";
import type { QuizQuestion, QuizAnswer, QuizResult } from "@/types/quiz";
import { trackQuizAnswer } from "@/lib/learning-analytics";

interface QuizSessionProps {
  questions: QuizQuestion[];
  onComplete: (result: QuizResult) => void;
  onExit: () => void;
}

interface UseQuizReturn {
  current: QuizQuestion;
  index: number;
  isLast: boolean;
  progress: number;
  answer: any;
  setAnswer: (val: any) => void;
  submit: () => void;
}

/**
 * Encapsulates quiz state and logic: navigation, timing, scoring.
 */
function useQuiz(
  questions: QuizQuestion[],
  onComplete: (res: QuizResult) => void,
): UseQuizReturn {
  const [idx, setIdx] = useState(0);
  const [responses, setResponses] = useState<QuizAnswer[]>([]);
  const [answer, setAnswer] = useState<any>([]);
  const [quizStart] = useState(() => Date.now());
  const [questionStart, setQuestionStart] = useState(() => Date.now());

  const current = questions[idx];
  const isLast = idx === questions.length - 1;
  const progress = ((idx + 1) / questions.length) * 100;

  useEffect(() => {
    setQuestionStart(Date.now());
    setAnswer(current.type === "multiple-response" ? [] : "");
  }, [idx, current.type]);

  const submit = useCallback(() => {
    // Guard: require valid selection
    if (!answer || (Array.isArray(answer) && answer.length === 0)) return;

    const elapsed = Date.now() - questionStart;
    let correct = false;

    switch (current.type) {
      case "multiple-choice":
      case "true-false":
        correct = answer === current.correctAnswer;
        break;
      case "multiple-response":
        const selection = answer as string[];
        const expected = JSON.parse(current.correctAnswer) as string[];
        correct =
          selection.length === expected.length &&
          expected.every((opt) => selection.includes(opt));
        break;
      case "fill-in-blank":
        const words = (answer as string).toLowerCase().split(/\s+/);
        correct = (current.blanks || []).every((w) =>
          words.some((x) => x.includes(w)),
        );
        break;
      case "matching":
        const userMap = answer as Record<string, string>;
        const correctMap = JSON.parse(current.correctAnswer);
        correct = Object.entries(correctMap).every(
          ([key, val]) => userMap[key] === val,
        );
        break;
    }

    const entry: QuizAnswer = {
      questionId: current.id,
      userAnswer: answer,
      isCorrect: correct,
      timeSpent: elapsed,
    };

    trackQuizAnswer(current.id, correct);
    setResponses((prev) => [...prev, entry]);

    if (isLast) {
      const totalTime = Date.now() - quizStart;
      const score = [...responses, entry].filter((r) => r.isCorrect).length;
      onComplete({
        score,
        totalQuestions: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        answers: [...responses, entry],
        questions,
        timeSpent: totalTime,
        completedAt: new Date().toISOString(),
      });
    } else {
      setIdx((i) => i + 1);
    }
  }, [
    answer,
    current,
    isLast,
    onComplete,
    questions,
    questionStart,
    quizStart,
    responses,
  ]);

  return { current, index: idx, isLast, progress, answer, setAnswer, submit };
}

/** Displays question count and progress bar, plus an Exit button. */
const QuizHeader = ({
  index,
  total,
  onExit,
}: {
  index: number;
  total: number;
  onExit: () => void;
}) => (
  <header className="sticky top-0 z-50 bg-card border-b">
    <div className="container mx-auto flex items-center justify-between p-3">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5" />
        <h2 className="text-lg font-semibold">
          {`Question ${index + 1} of ${total}`}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline">{`${index + 1}/${total}`}</Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={onExit}
          data-cy="exit-quiz"
        >
          Exit
        </Button>
      </div>
    </div>
    <Progress value={((index + 1) / total) * 100} className="h-2" />
  </header>
);

const MCQ = ({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
    {options.map((opt, i) => (
      <div key={i} className="flex items-center gap-2">
        <RadioGroupItem id={`opt-${i}`} value={opt} />
        <Label htmlFor={`opt-${i}`}>{opt}</Label>
      </div>
    ))}
  </RadioGroup>
);

const MultiResponse = ({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) => (
  <div className="space-y-2">
    {options.map((opt, i) => (
      <div key={i} className="flex items-center gap-2">
        <Checkbox
          id={`chk-${i}`}
          checked={value.includes(opt)}
          onCheckedChange={(checked) => {
            const next = checked
              ? [...value, opt]
              : value.filter((v) => v !== opt);
            onChange(next);
          }}
        />
        <Label htmlFor={`chk-${i}`}>{opt}</Label>
      </div>
    ))}
  </div>
);

const TrueFalse = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => <MCQ options={["True", "False"]} value={value} onChange={onChange} />;

const FillBlank = ({
  text,
  value,
  onChange,
}: {
  text: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="space-y-2">
    <Label>Fill in the blank:</Label>
    <pre className="p-2 bg-muted rounded">{text}</pre>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Your answer"
      className="w-full"
      data-cy="fill-blank"
    />
  </div>
);

const Matching = ({
  pairs,
  value,
  onChange,
}: {
  pairs: { left: string; right: string }[];
  value: Record<string, string>;
  onChange: (map: Record<string, string>) => void;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {pairs.map((p, i) => (
      <div key={i} className="space-y-1">
        <Label>{p.left}</Label>
        <select
          className="w-full p-2 border rounded"
          value={value[p.left] || ""}
          onChange={(e) => onChange({ ...value, [p.left]: e.target.value })}
          data-cy={`match-${i}`}
        >
          <option value="">Select...</option>
          {pairs.map((opt, j) => (
            <option key={j} value={opt.right}>
              {opt.right}
            </option>
          ))}
        </select>
      </div>
    ))}
  </div>
);

const QuestionRenderer = ({
  question,
  answer,
  onAnswer,
}: {
  question: QuizQuestion;
  answer: any;
  onAnswer: (v: any) => void;
}) => {
  switch (question.type) {
    case "multiple-choice":
      return (
        <MCQ
          options={question.options || []}
          value={answer as string}
          onChange={onAnswer}
        />
      );
    case "multiple-response":
      return (
        <MultiResponse
          options={question.options || []}
          value={answer as string[]}
          onChange={onAnswer}
        />
      );
    case "true-false":
      return <TrueFalse value={answer as string} onChange={onAnswer} />;
    case "fill-in-blank":
      return (
        <FillBlank
          text={question.originalText || ""}
          value={answer as string}
          onChange={onAnswer}
        />
      );
    case "matching":
      return (
        <Matching
          pairs={question.pairs || []}
          value={answer as Record<string, string>}
          onChange={onAnswer}
        />
      );
    default:
      return null;
  }
};

/**
 * Ensures the user has provided a valid response before enabling Next.
 */
function canAdvance(question: QuizQuestion, answer: any): boolean {
  if (question.type === "matching") {
    return question.pairs?.every((p) => Boolean(answer[p.left])) ?? false;
  }
  return Array.isArray(answer) ? answer.length > 0 : Boolean(answer);
}

/**
 * Renders the quiz UI, driving state via useQuiz and declarative components.
 */
export function QuizSession({
  questions,
  onComplete,
  onExit,
}: QuizSessionProps) {
  const { current, index, isLast, answer, setAnswer, submit } = useQuiz(
    questions,
    onComplete,
  );

  return (
    <div className="min-h-screen bg-background">
      <QuizHeader index={index} total={questions.length} onExit={onExit} />
      <main className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>{current.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <QuestionRenderer
              question={current}
              answer={answer}
              onAnswer={setAnswer}
            />
            <div className="flex justify-end">
              <Button
                onClick={submit}
                disabled={!canAdvance(current, answer)}
                data-cy="next-question"
              >
                {isLast ? "Finish" : "Next"}{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
