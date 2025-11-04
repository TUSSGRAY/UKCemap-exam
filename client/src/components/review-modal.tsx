import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionNumber: number;
}

export default function ReviewModal({ isOpen, onClose, questionNumber }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating > 0) {
      // Store rating in localStorage for reference
      const timestamp = new Date().toISOString();
      const existingReviews = JSON.parse(localStorage.getItem('quizReviews') || '[]');
      existingReviews.push({ rating, questionNumber, timestamp });
      localStorage.setItem('quizReviews', JSON.stringify(existingReviews));
      
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setRating(0);
      }, 1500);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-review">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">How are you finding the quiz?</DialogTitle>
              <DialogDescription className="text-center">
                You've completed {questionNumber} questions so far. Please rate your experience.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    data-testid={`button-star-${star}`}
                  >
                    <Star
                      className={cn(
                        "w-12 h-12 transition-colors",
                        (hoveredRating >= star || rating >= star)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                ))}
              </div>

              <p className="text-sm text-center text-muted-foreground mb-6">
                {rating === 0 && "Click a star to rate"}
                {rating === 1 && "Poor - We'll work harder"}
                {rating === 2 && "Fair - Room for improvement"}
                {rating === 3 && "Good - Thanks for your feedback"}
                {rating === 4 && "Very Good - Glad you're enjoying it"}
                {rating === 5 && "Excellent - We're thrilled!"}
              </p>

              <Button
                onClick={handleSubmit}
                disabled={rating === 0}
                className="w-full"
                size="lg"
                data-testid="button-submit-review"
              >
                Submit Rating
              </Button>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <Star className="w-8 h-8 text-green-600 dark:text-green-400 fill-current" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Thank you!</h3>
            <p className="text-muted-foreground">Your feedback helps us improve</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
