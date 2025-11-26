import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Zap, TrendingUp, BookOpen } from "lucide-react";

interface UpgradePromptProps {
  onComplete: () => void;
}

export function GoogleAdSenseAd({ onComplete }: UpgradePromptProps) {
  const [timeRemaining, setTimeRemaining] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const progress = ((8 - timeRemaining) / 8) * 100;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Unlock Your CeMAP Success
            </h2>
            <p className="text-lg text-muted-foreground">
              Upgrade to the Bundle Package for advanced features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <BookOpen className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">2025 Syllabus</h3>
              <p className="text-sm text-muted-foreground">New questions covering latest regulations</p>
            </div>
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <TrendingUp className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Analytics</h3>
              <p className="text-sm text-muted-foreground">Track your progress and weak areas</p>
            </div>
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <Zap className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Topic Exams</h3>
              <p className="text-sm text-muted-foreground">Master specific topics with focused practice</p>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-6">
            <div className="flex items-baseline justify-center gap-3">
              <span className="text-4xl font-bold text-primary">£1.49</span>
              <span className="text-xl text-muted-foreground line-through">£1.98</span>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">Save 50p on Full Exam + Scenario Quiz</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Continuing in</span>
              <span className="font-mono font-semibold text-lg">{timeRemaining}s</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex gap-3">
            <Link href="/checkout?product=bundle" className="flex-1">
              <Button className="w-full" size="lg" data-testid="button-upgrade-bundle">
                Get Bundle Package
              </Button>
            </Link>
            <Button
              onClick={onComplete}
              variant="outline"
              size="lg"
              className="flex-1"
              data-testid="button-continue-free"
            >
              Continue Free Practice
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            All features included: Full Exam + Scenario Quiz + 100 Days Email Campaign
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
