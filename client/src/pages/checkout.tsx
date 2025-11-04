import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { PaymentProduct } from "@shared/schema";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ product, email: initialEmail }: { product: PaymentProduct; email?: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState(initialEmail || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?product=${product}${email ? `&email=${encodeURIComponent(email)}` : ''}`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const productInfo = {
    exam: { name: "Full Exam Mode", price: "£0.99", description: "100 questions with certificate" },
    scenario: { name: "Scenario Quiz Mode", price: "£0.99", description: "50 scenarios with 150 questions" },
    bundle: { name: "Bundle Package", price: "£1.49", description: "Both exams + 100 Days email campaign" },
  };

  const info = productInfo[product];

  return (
    <form onSubmit={handleSubmit} data-testid="form-checkout">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle data-testid="text-product-name">{info.name}</CardTitle>
          <CardDescription data-testid="text-product-description">{info.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Price:</span>
            <span className="text-2xl font-bold" data-testid="text-price">{info.price}</span>
          </div>

          {product === "bundle" && (
            <div className="space-y-2">
              <Label htmlFor="email">Email (for 100 Days campaign)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
              />
              <p className="text-xs text-muted-foreground">
                Get 3 scenario questions daily for 100 days
              </p>
            </div>
          )}

          <PaymentElement />
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!stripe || isProcessing}
            data-testid="button-pay"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${info.price}`
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [product, setProduct] = useState<PaymentProduct | null>(null);
  const [email, setEmail] = useState<string | undefined>();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get product from URL
    const params = new URLSearchParams(window.location.search);
    const productParam = params.get("product") as PaymentProduct;
    const emailParam = params.get("email") || undefined;

    if (!productParam || !["exam", "scenario", "bundle"].includes(productParam)) {
      toast({
        title: "Invalid Product",
        description: "Please select a valid product from the home page",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }

    setProduct(productParam);
    setEmail(emailParam);

    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/create-payment-intent", { product: productParam })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error("No client secret received");
        }
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
        console.error("Payment initialization error:", error);
      });
  }, [toast, setLocation]);

  if (!clientSecret || !product) {
    return (
      <div className="h-screen flex items-center justify-center" data-testid="loading-payment">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8" data-testid="heading-checkout">Checkout</h1>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm product={product} email={email} />
        </Elements>
        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            data-testid="button-back-home"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
