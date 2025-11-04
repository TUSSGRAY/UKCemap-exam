import { useStripe, Elements, PaymentElement, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY");
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

/* ✅ UPDATED CheckoutForm */
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
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;
    const paymentElement = elements.getElement(PaymentElement);
    if (!paymentElement) return;

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
      } else if (paymentIntent?.status === "succeeded") {
        const emailParam =
          purchaseType === "bundle" && emailOptIn && email
            ? `&email=${encodeURIComponent(email)}`
            : "";
        setLocation(`/payment-success?payment_intent=${paymentIntent.id}${emailParam}`);
      } else {
        toast({
          title: "Payment Processing",
          description: "Your payment is being processed...",
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
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailOptIn"
                    checked={emailOptIn}
                    onCheckedChange={(checked) => setEmailOptIn(!!checked)}
                  />
                  <label htmlFor="emailOptIn" className="text-sm text-foreground cursor-pointer">
                    Yes, enroll me in the 100 Days email campaign
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Stripe Payment Element */}
      <PaymentElement
        options={{
          layout: "tabs",
          wallets: { applePay: "never", googlePay: "never" },
        }}
        onReady={() => setIsReady(true)} // Stripe callback when fully mounted
      />

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || !isReady || isProcessing}
      >
        {isProcessing
          ? "Processing..."
          : purchaseType === "bundle"
          ? "Pay £1.49"
          : "Pay £0.99"}
      </Button>

      {!isReady && (
        <p className="text-sm text-center text-muted-foreground">Loading payment form…</p>
      )}

      <p className="text-xs text-center text-muted-foreground">
        <Lock className="w-3 h-3 inline mr-1" />
        Secure payment powered by Stripe
      </p>
    </form>
  );
};

/* ✅ Main Checkout Page */
export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [, setLocation] = useLocation();
  const [purchaseType, setPurchaseType] = useState<
    "exam" | "scenario" | "bundle" | null
  >(null);
  const [loadingError, setLoadingError] = useState(false);
  const { toast } = useToast();

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
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoadingError(false);
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
        setLoadingError(true);
        toast({
          title: "Payment Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
      });
  }, [purchaseType, toast]);

  const isLoading = !clientSecret || !purchaseType;

  const handleRetry = () => {
    setLoadingError(false);
    setClientSecret("");
    // Trigger the useEffect to re-fetch
    const type = purchaseType;
    setPurchaseType(null);
    setTimeout(() => setPurchaseType(type), 10);
  };

  const getTitle = () => {
    if (!purchaseType) return "Loading...";
    return purchaseType === "bundle"
      ? "Complete Bundle Package"
      : purchaseType === "scenario"
      ? "Unlock Scenario Quiz"
      : "Unlock Full Exam Mode";
  };

  const getDescription = () => {
    if (!purchaseType) return "";
    return purchaseType === "bundle"
      ? "Get access to both Full Exam (100 questions) and Scenario Quiz (150 questions)"
      : purchaseType === "scenario"
      ? "Get access to all 50 realistic scenarios (150 questions)"
      : "Get access to the complete 100-question CeMAP practice exam";
  };

  if (loadingError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-destructive font-medium">Payment form failed to load</p>
            <p className="text-sm text-muted-foreground">
              There was an error connecting to the payment processor.
            </p>
            <Button onClick={handleRetry} data-testid="button-retry-payment">
              Retry Payment
            </Button>
            <Button variant="ghost" onClick={() => setLocation("/")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-primary">J&K Cemap Training</p>
              <h2 className="text-2xl font-bold mt-2">{getTitle()}</h2>
            </div>
            {purchaseType === "bundle" && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-10 w-full mb-3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            )}
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Loading payment form...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full shadow-xl" data-testid="card-checkout">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-primary tracking-wide uppercase">
              J&K Cemap Training
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
          <CardTitle className="text-2xl" data-testid="text-checkout-title">
            {getTitle()}
          </CardTitle>
          <CardDescription>
            {purchaseType === "bundle"
              ? "One-time payment of £1.49 for unlimited access"
              : "One-time payment of £0.99 for unlimited access"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: "stripe" },
            }}
          >
            <CheckoutForm
              clientSecret={clientSecret}
              purchaseType={purchaseType}
            />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}
