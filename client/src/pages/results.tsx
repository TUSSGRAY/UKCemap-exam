import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Home, RefreshCw, Target, Award, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Results() {
  const [, setLocation] = useLocation();
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState<"practice" | "exam" | "scenario">("practice");
  const [practiceAttempts, setPracticeAttempts] = useState(0);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [isSavingScore, setIsSavingScore] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentScore = Number(params.get("score")) || 0;
    const currentTotal = Number(params.get("total")) || 0;
    const currentMode = (params.get("mode") as "practice" | "exam" | "scenario") || "practice";
    const attemptId = params.get("attemptId") || '';
    
    setScore(currentScore);
    setTotal(currentTotal);
    setMode(currentMode);

    // Track practice attempts - only increment if this is a new attempt
    if (currentMode === "practice" && attemptId) {
      const lastAttemptId = localStorage.getItem('lastPracticeAttemptId');
      
      // Only increment if this is a different attempt
      if (lastAttemptId !== attemptId) {
        const attempts = parseInt(localStorage.getItem('practiceAttempts') || '0');
        const newAttempts = attempts + 1;
        localStorage.setItem('practiceAttempts', newAttempts.toString());
        localStorage.setItem('lastPracticeAttemptId', attemptId);
        setPracticeAttempts(newAttempts);
      } else {
        // Same attempt, just get current count
        setPracticeAttempts(parseInt(localStorage.getItem('practiceAttempts') || '0'));
      }
      
      // Check if user passed with 80% or more - redirect to certificate
      const percentage = currentTotal > 0 ? Math.round((currentScore / currentTotal) * 100) : 0;
      if (percentage >= 80) {
        setLocation(`/certificate?mode=${currentMode}&score=${currentScore}&total=${currentTotal}`);
      }
    }
    
    // For exam and scenario modes, show name dialog to save to leaderboard
    if (currentMode === "exam" || currentMode === "scenario") {
      // Check if we've already saved the score for this session
      const savedScoreKey = `highScoreSaved_${currentMode}_${attemptId}`;
      const alreadySaved = sessionStorage.getItem(savedScoreKey);
      
      if (!alreadySaved) {
        setShowNameDialog(true);
      } else {
        // Already saved, check if passed and redirect to certificate
        const percentage = currentTotal > 0 ? Math.round((currentScore / currentTotal) * 100) : 0;
        if (percentage >= 80) {
          setLocation(`/certificate?mode=${currentMode}&score=${currentScore}&total=${currentTotal}`);
        }
      }
    }
  }, [setLocation]);

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const isExamMode = mode === "exam";
  const isScenarioMode = mode === "scenario";
  const isPracticeMode = mode === "practice";
  // All modes now require 80% to pass
  const passThreshold = Math.ceil(total * 0.8);
  const passed = score >= passThreshold;
  const canRetryPractice = isPracticeMode && practiceAttempts < 2;
  const noMoreAttempts = isPracticeMode && practiceAttempts >= 2;

  const handleSaveScore = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name for the leaderboard",
        variant: "destructive",
      });
      return;
    }

    setIsSavingScore(true);

    try {
      await apiRequest("POST", "/api/high-scores", {
        name: playerName.trim(),
        score,
        total,
        mode,
      });

      // Mark as saved in session storage
      const params = new URLSearchParams(window.location.search);
      const attemptId = params.get("attemptId") || '';
      const savedScoreKey = `highScoreSaved_${mode}_${attemptId}`;
      sessionStorage.setItem(savedScoreKey, "true");

      toast({
        title: "Score saved!",
        description: "Your score has been added to the leaderboard",
      });

      setShowNameDialog(false);

      // If passed, redirect to certificate
      if (passed) {
        setLocation(`/certificate?mode=${mode}&score=${score}&total=${total}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save score. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingScore(false);
    }
  };

  const handleSkipLeaderboard = () => {
    // Mark as saved (skipped) in session storage
    const params = new URLSearchParams(window.location.search);
    const attemptId = params.get("attemptId") || '';
    const savedScoreKey = `highScoreSaved_${mode}_${attemptId}`;
    sessionStorage.setItem(savedScoreKey, "true");

    setShowNameDialog(false);

    // If passed, redirect to certificate
    if (passed) {
      setLocation(`/certificate?mode=${mode}&score=${score}&total=${total}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Name Dialog for Leaderboard */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent data-testid="dialog-leaderboard-name">
          <DialogHeader>
            <DialogTitle>Join the Weekly Leaderboard!</DialogTitle>
            <DialogDescription>
              Enter your name to add your score to this week's top performers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="player-name">Your Name</Label>
              <Input
                id="player-name"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveScore();
                  }
                }}
                data-testid="input-player-name"
                maxLength={50}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveScore}
                disabled={isSavingScore}
                className="flex-1"
                data-testid="button-save-score"
              >
                {isSavingScore ? "Saving..." : "Save to Leaderboard"}
              </Button>
              <Button
                onClick={handleSkipLeaderboard}
                variant="outline"
                disabled={isSavingScore}
                data-testid="button-skip-leaderboard"
              >
                Skip
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="mb-3">
            <p className="text-xs font-semibold text-primary tracking-wide uppercase">
              J&K Cemap Training
            </p>
          </div>
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
                    {isExamMode ? "🌟 Excellent! You're CeMAP-ready." : isScenarioMode ? "💼 Great work! You've mastered this scenario." : "👍 Good job! Keep revising."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isExamMode
                      ? "You've demonstrated a strong understanding of CeMAP topics."
                      : isScenarioMode
                      ? "You've shown strong application of CeMAP knowledge to real-world situations."
                      : "You're making great progress. Consider taking the full exam when ready."}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground mb-2">
                    📘 Keep studying - you're getting there!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isScenarioMode 
                      ? "Review this scenario carefully and try again. Focus on applying CeMAP principles to real-world situations."
                      : "Review the key CeMAP topics and try again. Practice makes perfect!"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Practice Mode - No More Attempts */}
        {noMoreAttempts && (
          <Card className="shadow-xl mb-6 border-orange-200 dark:border-orange-900" data-testid="card-no-attempts">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Practice Test Limit Reached
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You've completed your 2 practice attempts. Ready to fully prepare for the CeMAP 2025 Autumn Edition?
                  </p>
                  <p className="text-sm font-medium text-foreground mb-3">
                    Get our Complete Bundle Package:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Full Exam Mode: 50 authentic questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Scenario Quiz: 10 scenarios (50 questions)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Save 50p with the bundle</span>
                    </li>
                  </ul>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => setLocation('/checkout?type=bundle')}
                    data-testid="button-get-bundle"
                  >
                    Get Complete Bundle - £1.49
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Practice Mode - Can Retry */}
        {canRetryPractice && (
          <Card className="shadow-xl mb-6 border-primary/30" data-testid="card-retry-available">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-2">
                  One More Attempt Available
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You have {2 - practiceAttempts} more {2 - practiceAttempts === 1 ? 'attempt' : 'attempts'} at the practice test. Study the areas you need to improve and try again!
                </p>
                <Button
                  size="lg"
                  onClick={() => setLocation('/quiz/practice')}
                  data-testid="button-retry-practice"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Practice Test (Final Attempt)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => setLocation('/')}
            data-testid="button-home"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          {!isPracticeMode && (
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => setLocation(`/quiz/${mode}`)}
              data-testid="button-retake"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
