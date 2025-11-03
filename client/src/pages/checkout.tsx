import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm payment without redirect (works in iframe environments like Replit)
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required", // Only redirect if absolutely necessary (3D Secure)
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        setIsProcessing(false);
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded - navigate to success page
        setLocation(`/payment-success?payment_intent=${paymentIntent.id}`);
      } else {
        setIsProcessing(false);
        toast({
          title: "Payment Processing",
          description: "Your payment is being processed. Please wait...",
        });
      }
    } catch (err: any) {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={!stripe || isProcessing}
        data-testid="button-submit-payment"
      >
        {isProcessing ? "Processing..." : "Pay £0.99"}
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

  useEffect(() => {
    // Amount is hardcoded on server - no client input needed
    apiRequest("POST", "/api/create-payment-intent", {})
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
      });
  }, []);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
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
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-checkout-title">
            Unlock Full Exam Mode
          </h1>
          <p className="text-lg text-muted-foreground">
            Get access to the complete 100-question CeMAP practice exam
          </p>
        </div>

        <Card className="shadow-xl" data-testid="card-checkout">
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Purchase</CardTitle>
            <CardDescription>
              One-time payment of £0.99 for unlimited access to exam mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} />
            </Elements>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Access includes 100 authentic CeMAP questions across all 8 topics
          </p>
        </div>
      </div>
    </div>
  );
}
