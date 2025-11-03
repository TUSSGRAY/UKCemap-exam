import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentId = urlParams.get('payment_intent');

    if (paymentIntentId) {
      // Verify payment on server
      apiRequest("POST", "/api/verify-payment", { paymentIntentId })
        .then((data) => {
          if (data.verified && data.hasAccess) {
            // Payment verified - set localStorage as cache
            localStorage.setItem('examPurchased', 'true');
            setIsVerifying(false);
          } else {
            setLocation('/');
          }
        })
        .catch(() => {
          setLocation('/');
        });
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  const handleStartExam = () => {
    setLocation('/quiz/exam');
  };

  const handleGoHome = () => {
    setLocation('/');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" aria-label="Loading"/>
          <p className="text-lg text-muted-foreground">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-8">
          <div className="mb-3">
            <p className="text-xs font-semibold text-primary tracking-wide uppercase">
              J&K Cemap Training
            </p>
          </div>
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-success-title">
            Payment Successful!
          </h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your purchase. You now have full access to the exam mode.
          </p>
        </div>

        <Card className="shadow-xl" data-testid="card-success">
          <CardHeader>
            <CardTitle className="text-2xl text-center">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              You can now take the full 100-question CeMAP practice exam anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleStartExam} 
                className="flex-1" 
                size="lg"
                data-testid="button-start-exam"
              >
                Start Full Exam Now
              </Button>
              <Button 
                onClick={handleGoHome} 
                variant="outline" 
                className="flex-1" 
                size="lg"
                data-testid="button-go-home"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
