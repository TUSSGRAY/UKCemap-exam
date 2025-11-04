import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Lock, Mail } from "lucide-react";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({
  clientSecret,
  purchaseType,
}: {
  clientSecret: string;
  purchaseType: "exam" | "scenario" | "bundle";
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [elementReady, setElementReady] = useState(false);

  useEffect(() => {
    // Listen for when the PaymentElement finishes mounting
    const paymentEl = document.querySelector("#payment-element");
    if (paymentEl) {
      // Small delay to ensure Stripe mount completes
      setTimeout(() => setElementReady(true), 500);
    }
  }, [clientSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Stripe not ready",
        description: "Please wait for Stripe to finish loading.",
        variant: "destructive",
      });
      return;
    }

    if (!elementReady) {
      toast({
        title: "Payment form not ready",
        description: "Please wait a second and try again.",
        variant: "destructive",
      });
      return;
    }

    // Validate email for bundle purchases
    if (purchaseType === "bundle" && emailOptIn) {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address for the 100 Days campaign.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        const emailParam =
          purchaseType === "bundle" && emailOptIn && email
            ? `&email=${encodeURIComponent(email)}`
            : "";
        setLocation(`/payment-success?payment_intent=${paymentIntent.id}${emailParam}`);
      } else {
        toast({
          title: "Payment Processing",
          description: "Your payment is being processed. Please wait...",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {purchaseType === "bundle" && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                Bonus: 100 Days to CeMAP Ready
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get 3 practice questions delivered to your inbox every day at 8:59am for 100 days!
              </p>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5"
                    data-testid="input-email"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailOptIn"
                    checked={emailOptIn}
                    onCheckedChange={(checked) => setEmailOptIn(!!checked)}
                    data-testid="checkbox-email-optin"
                  />
                  <label
                    htmlFor="emailOptIn"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    Yes, enroll me in the 100 Days email campaign
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div id="payment-element">
        <PaymentElement
          options={{
            layout: "tabs",
            wallets: {
              applePay: "never",
              googlePay: "never",
            },
          }}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || isProcessing || !elementReady}
        data-testid="button-submit-payment"
      >
        {isProcessing
          ? "Processing..."
          : purchaseType === "bundle"
          ? "Pay £1.49"
          : "Pay £0.99"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        <Lock className="w-3 h-3 inline mr-1" />
        Secure payment powered by Stripe
      </p>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [, setLocation] = useLocation();
  const [purchaseType, setPurchaseType] = useState<"exam" | "scenario" | "bundle" | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get("type") as "exam" | "scenario" | "bundle";
    if (type && ["exam", "scenario", "bundle"].includes(type)) {
      setPurchaseType(type);
    } else {
      setLocation("/");
    }
  }, [setLocation]);

  useEffect(() => {
    if (!purchaseType) return;

    apiRequest("POST", "/api/create-payment-intent", { purchaseType })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch((error) => console.error("Error creating payment intent:", error));
  }, [purchaseType]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div
          className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="mb-3">
            <p className="text-xs font-semibold text-primary tracking-wide uppercase">
              J&K Cemap Training
            </p>
          </div>
          <h1
            className="text-4xl font-bold text-foreground mb-4"
            data-testid="text-checkout-title"
          >
            {purchaseType === "bundle"
              ? "Complete Bundle Package"
              : purchaseType === "scenario"
              ? "Unlock Scenario Quiz"
              : "Unlock Full Exam Mode"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {purchaseType === "bundle"
              ? "Get access to both Full Exam (100 questions) and Scenario Quiz (150 questions)"
              : purchaseType === "scenario"
              ? "Get access to all 50 realistic scenarios (150 questions)"
              : "Get access to the complete 100-question CeMAP practice exam"}
          </p>
        </div>

        <Card className="shadow-xl" data-testid="card-checkout">
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Purchase</CardTitle>
            <CardDescription>
              {purchaseType === "bundle"
                ? "One-time payment of £1.49 for unlimited access to both exams (Save 50p!)"
                : "One-time payment of £0.99 for unlimited access"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} purchaseType={purchaseType} />
            </Elements>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {purchaseType === "bundle"
              ? "Bundle includes: 100-question Full Exam + 150-question Scenario Quiz"
              : purchaseType === "scenario"
              ? "Access includes all 50 scenarios with 150 questions total"
              : "Access includes 100 authentic CeMAP questions across all 8 topics"}
          </p>
        </div>
      </div>
    </div>
  );
}
