import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trophy } from "lucide-react";
import type { QuizMode } from "@shared/schema";

interface QuestionCountSelectorProps {
  mode: QuizMode;
  onStart: (count: number) => void;
  onCancel: () => void;
}

export default function QuestionCountSelector({ mode, onStart, onCancel }: QuestionCountSelectorProps) {
  const [selectedCount, setSelectedCount] = useState(5);
  const isExamMode = mode === "exam";

  if (isExamMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <Card className="max-w-lg w-full shadow-xl" data-testid="card-exam-confirm">
          <CardHeader className="space-y-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Full CeMAP Exam</CardTitle>
            <CardDescription className="text-base">
              You're about to start the complete certification practice test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Questions</span>
                <Badge variant="secondary" className="font-semibold">100</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pass Mark</span>
                <Badge variant="secondary" className="font-semibold">80/100</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Time Estimate</span>
                <Badge variant="secondary">60-90 mins</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Results will be shown at the end. Good luck!
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                data-testid="button-cancel-exam"
              >
                Cancel
              </Button>
              <Button
                onClick={() => onStart(100)}
                className="flex-1"
                data-testid="button-begin-exam"
              >
                Begin Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const countOptions = [1, 3, 5, 7, 10];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="max-w-lg w-full shadow-xl" data-testid="card-practice-config">
        <CardHeader className="space-y-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Practice Mode</CardTitle>
          <CardDescription className="text-base">
            How many questions would you like to practice?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-5 gap-3">
            {countOptions.map(count => (
              <button
                key={count}
                onClick={() => setSelectedCount(count)}
                className={`
                  p-4 rounded-md border-2 transition-all duration-150
                  hover-elevate active-elevate-2
                  ${selectedCount === count
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                  }
                `}
                data-testid={`button-count-${count}`}
              >
                <span className="text-2xl font-bold">{count}</span>
              </button>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-center text-muted-foreground">
              Selected: <span className="font-semibold text-foreground">{selectedCount} questions</span>
            </p>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Estimated time: {selectedCount * 1.5} minutes
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              data-testid="button-cancel-practice"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onStart(selectedCount)}
              className="flex-1"
              data-testid="button-start-practice"
            >
              Start Practice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
