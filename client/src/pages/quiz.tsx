import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Home, CheckCircle2, XCircle, LogIn, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { getQueryFn } from "@/lib/queryClient";
import type { Question, QuizMode, User } from "@shared/schema";
import AdBreakModal from "@/components/ad-break-modal";
import ReviewModal from "@/components/review-modal";
import QuestionCountSelector from "@/components/question-count-selector";
import { GoogleAdSenseAd as UpgradePrompt } from "@/components/google-adsense-ad";

interface QuizProps {
  mode: QuizMode;
  topicSlug?: string;
}

export default function Quiz({ mode: initialMode, topicSlug: initialTopicSlug }: QuizProps) {
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
  const [mode, setMode] = useState<QuizMode>(initialMode);
  const [topicSlug, setTopicSlug] = useState<string | undefined>(initialTopicSlug);
  const [checkingAccess, setCheckingAccess] = useState(initialMode === "exam" || initialMode === "scenario");
  const [accessError, setAccessError] = useState<string | null>(null);
  const [topicConfig, setTopicConfig] = useState<any>(null);

  const { data: user, isLoading: isLoadingUser } = useQuery<User | null>({
    queryKey: ["/api/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: mode !== "practice" && mode !== "topic",
  });

  // Check access for paid modes (but only after quiz is started)
  useEffect(() => {
    const checkAccess = async () => {
      // Skip access check for practice and topic modes (both free)
      if (mode === "practice" || mode === "topic") {
        setCheckingAccess(false);
        setAccessError(null);
        return;
      }

      // For exam mode, defer access check until quiz is started
      // This allows users to see the topic selector first
      if (mode === "exam" && !isStarted) {
        setCheckingAccess(false);
        return;
      }

      // Wait for user data to load
      if (isLoadingUser) {
        return;
      }

      // User must be logged in for exam/scenario modes
      if (!user) {
        setCheckingAccess(false);
        setAccessError("login_required");
        return;
      }

      try {
        const endpoint = mode === "exam" ? "/api/check-exam-access" : "/api/check-scenario-access";
        const response = await fetch(endpoint, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (!data.hasAccess) {
          setCheckingAccess(false);
          setAccessError("no_access");
          return;
        }

        setCheckingAccess(false);
        setAccessError(null);
      } catch (error) {
        console.error("Access check error:", error);
        setCheckingAccess(false);
        setAccessError("error");
      }
    };

    checkAccess();
  }, [mode, user, isLoadingUser, isStarted]);

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: mode === "topic" ? ["/api/topic-exams", topicSlug] : ["/api/questions", mode, questionCount, mode === "scenario" ? quizSessionId : null],
    enabled: isStarted,
    queryFn: async () => {
      if (mode === "topic" && topicSlug) {
        const response = await fetch(`/api/topic-exams/${topicSlug}`, {
          credentials: "include"
        });
        if (!response.ok) throw new Error("Failed to fetch topic exam");
        const data = await response.json();
        setTopicConfig(data.config);
        return data.questions;
      }
      
      const response = await fetch(`/api/questions?mode=${mode}&count=${questionCount}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    },
  });

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isPracticeMode = mode === "practice" || mode === "scenario" || mode === "topic";
  const isCorrect = selectedAnswer === currentQuestion?.answer;

  const handleStartQuiz = async (count: number, selectedTopicSlug?: string) => {
    setQuestionCount(count);
    
    // If a topic is selected, switch to topic mode
    if (selectedTopicSlug) {
      setMode("topic");
      setTopicSlug(selectedTopicSlug);
      setCheckingAccess(false); // Topic exams are free, no access check needed
      setAccessError(null); // Clear any previous access errors
    }
    
    setIsStarted(true);
  };

  useEffect(() => {
    if (mode === "scenario") {
      setQuestionCount(50); // 10 scenarios × 5 questions each
      setIsStarted(true);
    } else if (mode === "practice") {
      setQuestionCount(10); // Fixed 10 questions for practice mode
      setIsStarted(true);
    } else if (mode === "topic") {
      setQuestionCount(16); // Fixed 16 questions for topic exam
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
      
      // Calculate performance by topic
      const topicPerformance: Record<string, { correct: number; total: number }> = {};
      Object.entries(allAnswers).forEach(([id, answer]) => {
        const question = questions.find(q => q.id === id);
        if (question) {
          if (!topicPerformance[question.topic]) {
            topicPerformance[question.topic] = { correct: 0, total: 0 };
          }
          topicPerformance[question.topic].total++;
          if (question.answer === answer) {
            topicPerformance[question.topic].correct++;
          }
        }
      });
      
      // Store topic performance in sessionStorage for results page
      sessionStorage.setItem(`topicPerformance_${quizSessionId}`, JSON.stringify(topicPerformance));
      
      // Include attemptId for practice mode to track unique attempts
      const attemptParam = mode === "practice" ? `&attemptId=${quizSessionId}` : '';
      // Include topicSlug for topic mode
      const modeParam = mode === "topic" && topicSlug ? `topic:${topicSlug}` : mode;
      setLocation(`/results?mode=${modeParam}&score=${score}&total=${questions.length}${attemptParam}`);
      return;
    }

    // Show review modal after question 15 (for exam and scenario modes only, not topic)
    if (nextIndex === 15 && (mode === "exam" || mode === "scenario")) {
      setShowReview(true);
      return;
    }

    // Show Google AdSense ads at questions 3, 6, and 9 for practice mode only (not topic)
    if ((nextIndex === 3 || nextIndex === 6 || nextIndex === 9) && mode === "practice") {
      setShowGoogleAd(true);
      return;
    }

    // Show ad at questions 30 and 90 for exam and scenario modes only (not topic)
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

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (accessError === "login_required") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <Card className="max-w-md" data-testid="card-login-required">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Login Required</CardTitle>
            <CardDescription className="text-center">
              Please login to access this quiz mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground" data-testid="text-login-required-message">
              You need to be logged in to access {mode === "exam" ? "Full Exam" : "Scenario Quiz"} mode.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/login">
                <Button className="w-full" data-testid="button-goto-login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="w-full" data-testid="button-goto-register">
                  Create Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accessError === "no_access") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <Card className="max-w-md" data-testid="card-upgrade-invitation">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Unlock Full Access</CardTitle>
            <CardDescription>
              Get 30 days of unlimited access to all exam modes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-primary">£4.99</span>
                <span className="text-sm text-muted-foreground">one-time</span>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                30 days of unlimited access to Specimen Exam and Scenario Quiz
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">What's included:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Unlimited Specimen Exam attempts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Unlimited Scenario Quiz attempts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Performance analytics
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Certificate on 80% pass
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Link href="/checkout?product=subscription" className="w-full">
              <Button className="w-full" size="lg" data-testid="button-upgrade-now">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full" data-testid="button-back-home">
                Back to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (accessError === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <Card className="max-w-md" data-testid="card-access-error">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Access Error</CardTitle>
            <CardDescription className="text-center">
              Unable to verify access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground" data-testid="text-access-error-message">
              There was an error verifying your access. Please try again.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => window.location.reload()} className="w-full" data-testid="button-retry">
                Try Again
              </Button>
              <Link href="/">
                <Button variant="outline" className="w-full" data-testid="button-back-home">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {mode === "practice" ? "Practice Mode" : mode === "scenario" ? "Scenario Quiz" : mode === "topic" ? "Topic Exam" : "Full Exam"}
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
        <UpgradePrompt onComplete={handleGoogleAdComplete} />
      )}
      
      <ReviewModal
        isOpen={showReview}
        onClose={handleReviewComplete}
        questionNumber={currentIndex + 1}
      />
    </div>
  );
}
