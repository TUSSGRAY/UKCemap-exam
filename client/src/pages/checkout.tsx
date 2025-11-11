import { useStripe, Elements, PaymentElement, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js';
import { loadStripe, PaymentRequest } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { PaymentProduct, User } from "@shared/schema";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ product, clientSecret }: { product: PaymentProduct; clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

  const productInfo = {
    exam: { name: "Full Exam Mode", price: "£0.99", amount: 99, description: "50 questions with certificate" },
    scenario: { name: "Scenario Quiz Mode", price: "£0.99", amount: 99, description: "10 scenarios with 50 questions" },
    bundle: { name: "Bundle Package", price: "£1.49", amount: 149, description: "Both exams + 100 Days email campaign" },
  };

  const info = productInfo[product];

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const pr = stripe.paymentRequest({
      country: 'GB',
      currency: 'gbp',
      total: {
        label: info.name,
        amount: info.amount,
      },
      requestPayerEmail: false,
    });

    // Check if Payment Request is available (Apple Pay, Google Pay, etc.)
    pr.canMakePayment().then(result => {
      if (result) {
        setPaymentRequest(pr);
      }
    });

    pr.on('paymentmethod', async (ev) => {
      // Confirm the payment intent with the payment method from Apple Pay/Google Pay
      const { error: confirmError } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: ev.paymentMethod.id },
        { handleActions: false }
      );

      if (confirmError) {
        ev.complete('fail');
        toast({
          title: "Payment Failed",
          description: confirmError.message,
          variant: "destructive",
        });
      } else {
        ev.complete('success');
        // Redirect to success page with payment intent ID
        const paymentIntentId = clientSecret.split('_secret_')[0];
        setLocation(`/payment-success?payment_intent=${paymentIntentId}`);
      }
    });
  }, [stripe, clientSecret, info.name, info.amount, toast, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
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
      setIsProcessing(false);
    }
  };

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

          {paymentRequest && (
            <>
              <div className="space-y-4">
                <PaymentRequestButtonElement 
                  options={{ paymentRequest }}
                  className="w-full"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or pay with card
                  </span>
                </div>
              </div>
            </>
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
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: user, isLoading: isLoadingUser } = useQuery<User | null>({
    queryKey: ["/api/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  useEffect(() => {
    // Get product from URL
    const params = new URLSearchParams(window.location.search);
    const productParam = params.get("product") as PaymentProduct;

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

  if (isLoadingUser || !product) {
    return (
      <div className="h-screen flex items-center justify-center" data-testid="loading-payment">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8" data-testid="heading-checkout">Checkout</h1>
          <Card className="max-w-md mx-auto" data-testid="card-login-required">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Authentication Required</CardTitle>
              <CardDescription className="text-center">
                Please login or register to purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground" data-testid="text-login-message">
                You need to be logged in to purchase products. Please login or create an account to continue.
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/login">
                  <Button className="w-full" data-testid="button-goto-login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="w-full" data-testid="button-goto-register">
                    Create Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
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

  if (!clientSecret) {
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
          <CheckoutForm product={product} clientSecret={clientSecret} />
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
