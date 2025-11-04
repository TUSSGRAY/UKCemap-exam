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
import QuestionCountSelector from "@/components/question-count-selector";

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
  const [isStarted, setIsStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [quizSessionId] = useState(() => Date.now());

  useEffect(() => {
    if (mode === "exam") {
      // Check for bundle or exam-specific access
      const bundleToken = localStorage.getItem('bundleAccessToken');
      const examToken = localStorage.getItem('examAccessToken');
      const accessToken = bundleToken || examToken;
      
      if (!accessToken) {
        setLocation('/checkout?type=exam');
        return;
      }
      
      // Verify access token with server (authoritative source)
      fetch('/api/check-exam-access', {
        headers: {
          'X-Access-Token': accessToken
        }
      })
        .then(res => res.json())
        .then(data => {
          if (!data.hasAccess) {
            if (bundleToken) localStorage.removeItem('bundleAccessToken');
            if (examToken) localStorage.removeItem('examAccessToken');
            setLocation('/checkout?type=exam');
          }
        })
        .catch(() => {
          setLocation('/checkout?type=exam');
        });
    }

    if (mode === "scenario") {
      // Check for bundle or scenario-specific access
      const bundleToken = localStorage.getItem('bundleAccessToken');
      const scenarioToken = localStorage.getItem('scenarioAccessToken');
      const accessToken = bundleToken || scenarioToken;
      
      if (!accessToken) {
        setLocation('/checkout?type=scenario');
        return;
      }
      
      // Verify access token with server (authoritative source)
      fetch('/api/check-scenario-access', {
        headers: {
          'X-Access-Token': accessToken
        }
      })
        .then(res => res.json())
        .then(data => {
          if (!data.hasAccess) {
            if (bundleToken) localStorage.removeItem('bundleAccessToken');
            if (scenarioToken) localStorage.removeItem('scenarioAccessToken');
            setLocation('/checkout?type=scenario');
          }
        })
        .catch(() => {
          setLocation('/checkout?type=scenario');
        });
    }
  }, [mode, setLocation]);

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions", mode, questionCount, mode === "scenario" ? quizSessionId : null],
    enabled: isStarted,
    queryFn: async () => {
      const headers: Record<string, string> = {};
      
      // Include access token for exam and scenario modes
      if (mode === "exam") {
        const bundleToken = localStorage.getItem('bundleAccessToken');
        const examToken = localStorage.getItem('examAccessToken');
        const accessToken = bundleToken || examToken;
        if (accessToken) {
          headers['X-Access-Token'] = accessToken;
        }
      }
      
      if (mode === "scenario") {
        const bundleToken = localStorage.getItem('bundleAccessToken');
        const scenarioToken = localStorage.getItem('scenarioAccessToken');
        const accessToken = bundleToken || scenarioToken;
        if (accessToken) {
          headers['X-Access-Token'] = accessToken;
        }
      }
      
      const response = await fetch(`/api/questions?mode=${mode}&count=${questionCount}`, {
        credentials: "include",
        headers
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
      setQuestionCount(3);
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
      
      setLocation(`/results?mode=${mode}&score=${score}&total=${questions.length}`);
      return;
    }

    if ((nextIndex) % 9 === 0 && mode !== "scenario") {
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

  const handleExitQuiz = () => {
    setLocation("/");
  };

  if (!isStarted) {
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
      />
    </div>
  );
}
