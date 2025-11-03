import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Home, RefreshCw, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Results() {
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState<"practice" | "exam">("practice");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setScore(Number(params.get("score")) || 0);
    setTotal(Number(params.get("total")) || 0);
    setMode((params.get("mode") as "practice" | "exam") || "practice");
  }, []);

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const isExamMode = mode === "exam";
  const passThreshold = isExamMode ? Math.ceil(total * 0.8) : Math.ceil(total * 0.6);
  const passed = score >= passThreshold;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              passed ? "bg-green-100 dark:bg-green-950" : "bg-orange-100 dark:bg-orange-950"
            }`}>
              <Trophy className={`w-10 h-10 ${
                passed ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
              }`} />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-results-title">
            Quiz Complete!
          </h1>

          <Badge
            variant={passed ? "default" : "secondary"}
            className="text-lg px-6 py-2 mb-6"
            data-testid="badge-pass-fail"
          >
            {passed ? "PASSED" : "NEEDS IMPROVEMENT"}
          </Badge>
        </div>

        <Card className="shadow-xl mb-8" data-testid="card-score">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Your Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-48 h-48 rounded-full border-8 border-primary/20 bg-primary/5 mb-4">
                <div>
                  <div className="text-6xl font-bold font-mono text-foreground" data-testid="text-score">
                    {score}/{total}
                  </div>
                  <div className="text-2xl font-semibold text-muted-foreground" data-testid="text-percentage">
                    {percentage}%
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Overall Performance</span>
                <span className="font-semibold">{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-3" data-testid="progress-performance" />
            </div>

            {isExamMode && (
              <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="font-medium">Pass Mark</span>
                  </div>
                  <span className="font-semibold">{passThreshold}/{total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your Score</span>
                  <span className={`font-semibold ${passed ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}>
                    {score}/{total}
                  </span>
                </div>
                {!passed && (
                  <p className="text-sm text-muted-foreground pt-2 border-t">
                    You need {passThreshold - score} more correct {passThreshold - score === 1 ? "answer" : "answers"} to pass
                  </p>
                )}
              </div>
            )}

            <div className="pt-4 border-t space-y-2">
              {passed ? (
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground mb-2">
                    {isExamMode ? "🌟 Excellent! You're CeMAP-ready." : "👍 Good job! Keep revising."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isExamMode
                      ? "You've demonstrated a strong understanding of CeMAP topics."
                      : "You're making great progress. Consider taking the full exam when ready."}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground mb-2">
                    📘 Keep studying - you're getting there!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Review the key CeMAP topics and try again. Practice makes perfect!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" data-testid="link-home">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link href={`/quiz/${mode}`} data-testid="link-retake">
            <Button size="lg" className="w-full sm:w-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
          </Link>
          {!isExamMode && (
            <Link href="/quiz/exam" data-testid="link-try-exam">
              <Button variant="default" size="lg" className="w-full sm:w-auto">
                <Trophy className="w-4 h-4 mr-2" />
                Try Full Exam
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
