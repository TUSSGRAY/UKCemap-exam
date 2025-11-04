import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [purchaseType, setPurchaseType] = useState<"exam" | "scenario" | "bundle">("exam");
  const [emailEnrolled, setEmailEnrolled] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentId = urlParams.get('payment_intent');
    const emailFromUrl = urlParams.get('email');

    if (paymentIntentId) {
      // Verify payment on server
      apiRequest("POST", "/api/verify-payment", { paymentIntentId })
        .then((res) => res.json())
        .then(async (data) => {
          if (data.verified && data.accessToken) {
            // Payment verified - store access token based on purchase type
            setPurchaseType(data.purchaseType);
            
            if (data.purchaseType === "exam") {
              localStorage.setItem('examAccessToken', data.accessToken);
            } else if (data.purchaseType === "scenario") {
              localStorage.setItem('scenarioAccessToken', data.accessToken);
            } else if (data.purchaseType === "bundle") {
              localStorage.setItem('bundleAccessToken', data.accessToken);
              
              // For bundle purchases, subscribe email if provided
              if (emailFromUrl) {
                try {
                  const subscribeRes = await apiRequest("POST", "/api/subscribe-email", { 
                    email: emailFromUrl,
                    paymentIntentId 
                  });
                  const subscribeData = await subscribeRes.json();
                  if (subscribeData.success) {
                    setEmailEnrolled(true);
                    setUserEmail(emailFromUrl);
                  }
                } catch (error) {
                  console.error('Failed to subscribe email:', error);
                  // Don't fail the success page if email subscription fails
                }
              }
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

        {emailEnrolled && (
          <Card className="bg-primary/5 border-2 border-primary/20 mb-6" data-testid="card-email-enrolled">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    100 Days Email Campaign Activated!
                    <Badge variant="default" className="text-xs">BONUS</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    You're enrolled in the <strong>100 Days to CeMAP Ready</strong> campaign at <strong>{userEmail}</strong>
                  </p>
                  <div className="bg-background rounded-lg p-3 mt-3">
                    <p className="text-sm text-foreground">
                      <strong>What to expect:</strong> Starting tomorrow at 8:59am, you'll receive 3 scenario practice questions with answers daily for 100 days.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-xl" data-testid="card-success">
          <CardHeader>
            <CardTitle className="text-2xl text-center">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              {purchaseType === "bundle"
                ? "You can now access both the 100-question Full Exam and 150-question Scenario Quiz anytime."
                : purchaseType === "scenario"
                ? "You can now access all 50 scenarios with 150 questions total anytime."
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
