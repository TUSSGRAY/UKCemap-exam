import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Megaphone } from "lucide-react";

interface AdBreakModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const adverts = [
  "Get 20% off your CeMAP revision materials at StudySmart UK!",
  "Ready to boost your mortgage career? Join CeMAP Masterclass Online today!",
  "Refresh your knowledge with CeMAP Pro's 2025 syllabus updates!",
];

export default function AdBreakModal({ isOpen, onComplete }: AdBreakModalProps) {
  const [countdown, setCountdown] = useState(10);
  const [adMessage] = useState(() => adverts[Math.floor(Math.random() * adverts.length)]);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10);
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
  }, [isOpen, onComplete]);

  const progress = ((10 - countdown) / 10) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
        data-testid="modal-ad-break"
      >
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
            <Megaphone className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Ad Break
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <p className="text-lg font-semibold text-foreground" data-testid="text-ad-message">
              {adMessage}
            </p>
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

          <p className="text-xs text-center text-muted-foreground">
            Thank you for your patience. Your quiz will continue automatically.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
