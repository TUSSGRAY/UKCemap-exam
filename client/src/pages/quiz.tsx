import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Home, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question, QuizMode } from "@shared/schema";
import AdBreakModal from "@/components/ad-break-modal";
import ReviewModal from "@/components/review-modal";
import QuestionCountSelector from "@/components/question-count-selector";
import { GoogleAdSenseAd } from "@/components/google-adsense-ad";

interface QuizProps {
  mode: QuizMode;
}

export default function Quiz({ mode }: QuizProps) {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAdBreak, setShowAdBreak] = useState(false);
  const [showGoogleAd, setShowGoogleAd] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [quizSessionId] = useState(() => Date.now());

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions", mode, questionCount, mode === "scenario" ? quizSessionId : null],
    enabled: isStarted,
    queryFn: async () => {
      const response = await fetch(`/api/questions?mode=${mode}&count=${questionCount}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    },
  });

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isPracticeMode = mode === "practice" || mode === "scenario";
  const isCorrect = selectedAnswer === currentQuestion?.answer;

  const handleStartQuiz = async (count: number) => {
    setQuestionCount(count);
    setIsStarted(true);
  };

  useEffect(() => {
    if (mode === "scenario") {
      setQuestionCount(150); // All 50 scenarios × 3 questions each
      setIsStarted(true);
    } else if (mode === "practice") {
      setQuestionCount(10); // Fixed 10 questions for practice mode
      setIsStarted(true);
    }
  }, [mode]);

  const handleAnswerSelect = (answer: string) => {
    if (!showFeedback) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer
    }));

    if (isPracticeMode) {
      setShowFeedback(true);
    } else {
      handleNext();
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    
    if (isLastQuestion) {
      const allAnswers = selectedAnswer && currentQuestion
        ? { ...answers, [currentQuestion.id]: selectedAnswer }
        : answers;
      const score = Object.entries(allAnswers).reduce((acc, [id, answer]) => {
        const question = questions.find(q => q.id === id);
        return acc + (question?.answer === answer ? 1 : 0);
      }, 0);
      
      // Include attemptId for practice mode to track unique attempts
      const attemptParam = mode === "practice" ? `&attemptId=${quizSessionId}` : '';
      setLocation(`/results?mode=${mode}&score=${score}&total=${questions.length}${attemptParam}`);
      return;
    }

    // Show review modal after question 15 (for exam and scenario modes only)
    if (nextIndex === 15 && (mode === "exam" || mode === "scenario")) {
      setShowReview(true);
      return;
    }

    // Show Google AdSense ads at questions 3, 6, and 9 for practice mode
    if ((nextIndex === 3 || nextIndex === 6 || nextIndex === 9) && mode === "practice") {
      setShowGoogleAd(true);
      return;
    }

    // Show ad at questions 30 and 90 for exam and scenario modes
    if ((nextIndex === 30 || nextIndex === 90) && (mode === "exam" || mode === "scenario")) {
      setShowAdBreak(true);
    } else {
      moveToNextQuestion();
    }
  };

  const moveToNextQuestion = () => {
    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const handleAdBreakComplete = () => {
    setShowAdBreak(false);
    moveToNextQuestion();
  };

  const handleGoogleAdComplete = () => {
    setShowGoogleAd(false);
    moveToNextQuestion();
  };

  const handleReviewComplete = () => {
    setShowReview(false);
    moveToNextQuestion();
  };

  const handleExitQuiz = () => {
    setLocation("/");
  };

  if (!isStarted && mode === "exam") {
    return (
      <QuestionCountSelector
        mode={mode}
        onStart={handleStartQuiz}
        onCancel={handleExitQuiz}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">No questions available</p>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExitQuiz}
            data-testid="button-exit-quiz"
          >
            <Home className="w-5 h-5" />
          </Button>
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs font-semibold text-primary tracking-wide uppercase">
              J&K Cemap Training
            </p>
            <Badge variant="secondary" className="text-xs font-medium" data-testid="badge-mode-indicator">
              {mode === "practice" ? "Practice Mode" : mode === "scenario" ? "Scenario Quiz" : "Full Exam"}
            </Badge>
          </div>
          <div className="w-10" />
        </div>
        <div className="max-w-4xl mx-auto px-6">
          <Progress value={progress} className="h-2" data-testid="progress-quiz" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-semibold text-foreground" data-testid="text-question-number">
              {currentIndex + 1}/{questions.length}
            </span>
            <Badge variant="outline" className="text-xs uppercase tracking-wide" data-testid="badge-topic">
              {currentQuestion.topic}
            </Badge>
          </div>
        </div>

        <Card className="shadow-lg" data-testid="card-question">
          <CardHeader className="space-y-6 p-8">
            {currentQuestion.scenario && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-4" data-testid="text-scenario">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
                  Client Scenario
                </h3>
                <p className="text-base leading-relaxed text-foreground">
                  {currentQuestion.scenario}
                </p>
              </div>
            )}
            <h2 className="text-2xl font-medium leading-relaxed text-foreground" data-testid="text-question">
              {currentQuestion.question}
            </h2>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="space-y-4 mb-8">
              {[
                { letter: "A", text: currentQuestion.optionA },
                { letter: "B", text: currentQuestion.optionB },
                { letter: "C", text: currentQuestion.optionC },
                { letter: "D", text: currentQuestion.optionD }
              ].map(option => (
                <button
                  key={option.letter}
                  onClick={() => handleAnswerSelect(option.letter)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full p-4 border-2 rounded-md text-left transition-all duration-150",
                    "hover-elevate active-elevate-2",
                    "flex items-start gap-4",
                    selectedAnswer === option.letter
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card",
                    showFeedback && option.letter === currentQuestion.answer && "border-green-500 bg-green-50 dark:bg-green-950",
                    showFeedback && selectedAnswer === option.letter && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-950"
                  )}
                  data-testid={`button-answer-${option.letter.toLowerCase()}`}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0",
                    selectedAnswer === option.letter
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background"
                  )}>
                    <span className="text-sm font-semibold">{option.letter}</span>
                  </div>
                  <span className="text-lg flex-1 mt-0.5">{option.text}</span>
                </button>
              ))}
            </div>

            {showFeedback && isPracticeMode && (
              <div
                className={cn(
                  "p-4 rounded-md mb-6 flex items-start gap-3 animate-in slide-in-from-top-2 duration-200",
                  isCorrect
                    ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900"
                    : "bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-900"
                )}
                data-testid="feedback-message"
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Correct!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Well done, you got this one right.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-orange-900 dark:text-orange-100">
                        Incorrect
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        The correct answer is <span className="font-semibold">{currentQuestion.answer}</span>
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {!showFeedback ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="w-full"
                size="lg"
                data-testid="button-submit-answer"
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="w-full"
                size="lg"
                data-testid="button-next-question"
              >
                {isLastQuestion ? "View Results" : "Next Question"}
              </Button>
            )}
          </CardContent>
        </Card>
      </main>

      <AdBreakModal
        isOpen={showAdBreak}
        onComplete={handleAdBreakComplete}
        duration={mode === "exam" || mode === "scenario" ? 30 : 10}
      />

      {showGoogleAd && (
        <GoogleAdSenseAd onComplete={handleGoogleAdComplete} />
      )}
      
      <ReviewModal
        isOpen={showReview}
        onClose={handleReviewComplete}
        questionNumber={currentIndex + 1}
      />
    </div>
  );
}
