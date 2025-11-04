import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { PaymentProduct } from "@shared/schema";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [product, setProduct] = useState<PaymentProduct | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get payment intent from URL
        const params = new URLSearchParams(window.location.search);
        const paymentIntentId = params.get("payment_intent");
        const email = params.get("email") || undefined;

        if (!paymentIntentId) {
          throw new Error("Missing payment information");
        }

        // SECURITY: Don't send product - server derives it from Stripe metadata
        const response = await apiRequest("POST", "/api/verify-payment", {
          paymentIntentId,
          email,
        });

        const data = await response.json();

        if (data.success && data.accessToken && data.product) {
          setAccessToken(data.accessToken);
          
          // Use the verified product from server response, not URL
          const verifiedProduct = data.product as PaymentProduct;
          setProduct(verifiedProduct);
          
          // Store access token in localStorage based on verified product
          if (verifiedProduct === "exam") {
            localStorage.setItem("examAccessToken", data.accessToken);
          } else if (verifiedProduct === "scenario") {
            localStorage.setItem("scenarioAccessToken", data.accessToken);
          } else if (verifiedProduct === "bundle") {
            // Bundle gives access to both
            localStorage.setItem("examAccessToken", data.accessToken);
            localStorage.setItem("scenarioAccessToken", data.accessToken);
          }

          setSuccess(true);
          toast({
            title: "Payment Successful!",
            description: "You now have access to your purchased content.",
          });
        } else {
          throw new Error("Payment verification failed");
        }
      } catch (error: any) {
        console.error("Payment verification error:", error);
        setSuccess(false);
        toast({
          title: "Verification Failed",
          description: error.message || "Unable to verify payment. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [toast]);

  const productInfo = {
    exam: { name: "Full Exam Mode", path: "/quiz/exam" },
    scenario: { name: "Scenario Quiz Mode", path: "/quiz/scenario" },
    bundle: { name: "Bundle Package", path: "/quiz/exam" },
  };

  const info = product ? productInfo[product] : null;

  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your purchase.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full" data-testid="card-payment-result">
        <CardHeader className="text-center">
          {success ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" data-testid="icon-success" />
              <CardTitle data-testid="heading-success">Payment Successful!</CardTitle>
              <CardDescription data-testid="text-success-description">
                Thank you for your purchase of {info?.name}
              </CardDescription>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" data-testid="icon-error" />
              <CardTitle data-testid="heading-error">Payment Verification Failed</CardTitle>
              <CardDescription data-testid="text-error-description">
                We couldn't verify your payment. Please contact support if you were charged.
              </CardDescription>
            </>
          )}
        </CardHeader>
        {success && (
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Your Access Token</p>
              <p className="text-xs font-mono break-all bg-background p-2 rounded" data-testid="text-access-token">
                {accessToken}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This token has been saved to your device automatically.
              </p>
            </div>
            
            {product === "bundle" && (
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm font-medium mb-1">100 Days Campaign</p>
                <p className="text-xs text-muted-foreground">
                  You'll receive 3 scenario questions daily for 100 days via email.
                </p>
              </div>
            )}
          </CardContent>
        )}
        <CardFooter className="flex gap-2">
          {success && info ? (
            <>
              <Button 
                className="flex-1" 
                onClick={() => setLocation(info.path)}
                data-testid="button-start-quiz"
              >
                Start Quiz
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setLocation("/")}
                data-testid="button-home"
              >
                Home
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setLocation("/")}
                data-testid="button-back-home"
              >
                Back to Home
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => window.location.href = "mailto:support@example.com"}
                data-testid="button-contact-support"
              >
                Contact Support
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
