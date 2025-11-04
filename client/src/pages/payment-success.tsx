import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [purchaseType, setPurchaseType] = useState<"exam" | "scenario" | "bundle">("exam");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentId = urlParams.get('payment_intent');

    if (paymentIntentId) {
      // Verify payment on server
      apiRequest("POST", "/api/verify-payment", { paymentIntentId })
        .then((res) => res.json())
        .then((data) => {
          if (data.verified && data.accessToken) {
            // Payment verified - store access token based on purchase type
            setPurchaseType(data.purchaseType);
            
            if (data.purchaseType === "exam") {
              localStorage.setItem('examAccessToken', data.accessToken);
            } else if (data.purchaseType === "scenario") {
              localStorage.setItem('scenarioAccessToken', data.accessToken);
            } else if (data.purchaseType === "bundle") {
              localStorage.setItem('bundleAccessToken', data.accessToken);
            }
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

  const handleStartScenario = () => {
    setLocation('/quiz/scenario');
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
            {purchaseType === "bundle" 
              ? "Thank you for your purchase. You now have access to both the Full Exam and Scenario Quiz!"
              : purchaseType === "scenario"
              ? "Thank you for your purchase. You now have access to the Scenario Quiz!"
              : "Thank you for your purchase. You now have access to the Full Exam!"}
          </p>
        </div>

        <Card className="shadow-xl" data-testid="card-success">
          <CardHeader>
            <CardTitle className="text-2xl text-center">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              {purchaseType === "bundle"
                ? "You can now access both the 100-question Full Exam and all 10 Scenario Quizzes anytime."
                : purchaseType === "scenario"
                ? "You can now access all 10 realistic scenario-based case studies anytime."
                : "You can now take the full 100-question CeMAP practice exam anytime."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {purchaseType === "bundle" ? (
                <>
                  <Button 
                    onClick={handleStartExam} 
                    className="flex-1" 
                    size="lg"
                    data-testid="button-start-exam"
                  >
                    Start Full Exam
                  </Button>
                  <Button 
                    onClick={handleStartScenario} 
                    className="flex-1" 
                    size="lg"
                    data-testid="button-start-scenario"
                  >
                    Start Scenario Quiz
                  </Button>
                </>
              ) : purchaseType === "scenario" ? (
                <>
                  <Button 
                    onClick={handleStartScenario} 
                    className="flex-1" 
                    size="lg"
                    data-testid="button-start-scenario"
                  >
                    Start Scenario Quiz Now
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
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
