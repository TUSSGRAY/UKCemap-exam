import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Star } from "lucide-react";

interface AdBreakModalProps {
  isOpen: boolean;
  onComplete: () => void;
  duration?: number;
}

export default function AdBreakModal({ isOpen, onComplete, duration = 10 }: AdBreakModalProps) {
  const [countdown, setCountdown] = useState(duration);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(duration);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onComplete, duration]);

  const progress = ((duration - countdown) / duration) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
        data-testid="modal-upgrade-prompt"
      >
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
            <Star className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Unlock Premium Features
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <p className="text-lg font-semibold text-foreground">
              Ready to master CeMAP?
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-sm text-foreground">Access Full Exam (50 questions) + Scenario Quiz</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-sm text-foreground">2025 syllabus questions updated regularly</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-sm text-foreground">Analytics dashboard to track weak areas</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-sm text-foreground">Free Topic Exams to practice specific areas</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Resuming in</span>
              <span className="font-mono font-semibold text-lg" data-testid="text-countdown">
                {countdown}s
              </span>
            </div>
            <Progress value={progress} className="h-2" data-testid="progress-countdown" />
          </div>

          <div className="flex gap-2">
            <Link href="/checkout?product=subscription" className="flex-1">
              <Button className="w-full" size="lg" data-testid="button-modal-upgrade">
                Get Premium Access - £4.99
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={onComplete}
              data-testid="button-modal-skip"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
