import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { loginSchema, type LoginInput } from "@shared/schema";
import { GraduationCap, Loader2, ChevronRight } from "lucide-react";
import { useAuthSound } from "@/hooks/use-auth-sound";
import swipeImage from "@assets/0e4303d4-6a75-4e9b-abab-728d170230d2_1762285219114.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { playSuccessSound } = useAuthSound();
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);
  const swipeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const res = await apiRequest("POST", "/api/login", data);
      return res.json();
    },
    onSuccess: (user) => {
      playSuccessSound();
      queryClient.setQueryData(["/api/me"], user);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    const progress = Math.min(Math.max(diff / 100, 0), 1);
    setSwipeProgress(progress);
  };

  const handleTouchEnd = () => {
    if (swipeProgress > 0.7) {
      onSubmit(form.getValues());
    }
    setSwipeProgress(0);
    touchStartX.current = 0;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="w-10 h-10 text-primary mr-2" />
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-app-title">
              CeMAP Exam Training
            </h1>
          </div>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <Card data-testid="card-login">
          <CardHeader>
            <CardTitle className="text-2xl" data-testid="text-login-title">Login</CardTitle>
            <CardDescription data-testid="text-login-description">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-login">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          data-testid="input-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Swipe to Login Gesture Area - Animated */}
        <div 
          ref={swipeContainerRef}
          className="mt-6 relative group"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          data-testid="swipe-login-area"
        >
          <div className="relative p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border-2 border-primary/30 cursor-grab active:cursor-grabbing overflow-hidden shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
            {/* Background Image */}
            <div 
              className="absolute inset-0 opacity-10 bg-cover bg-center rounded-md"
              style={{ backgroundImage: `url(${swipeImage})` }}
            />
            {/* Animated Background Gradient */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 transition-all duration-300"
              style={{
                opacity: isAnimating && swipeProgress === 0 ? 0.5 : 0,
                animation: isAnimating && swipeProgress === 0 ? 'shimmer 2s infinite' : 'none'
              }}
            />
            
            <div className="relative text-center z-10">
              {/* Swipe Indicator with Animation */}
              <div className="relative h-20 flex items-center justify-between px-4 mb-3">
                {/* Left Icon - Swipe Prompt */}
                <div className="flex flex-col items-center flex-1">
                  <div 
                    className="relative transition-all duration-150"
                    style={{
                      opacity: Math.max(0, 1 - swipeProgress * 1.5),
                      transform: `translateX(${-swipeProgress * 20}px) scale(${1 - swipeProgress * 0.3})`,
                    }}
                  >
                    <div className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>
                      👆
                    </div>
                  </div>
                </div>

                {/* Center Thumb - Tracks Swipe Progress */}
                <div 
                  className="relative transition-all duration-75"
                  style={{
                    transform: `translateX(${swipeProgress * 140}px)`,
                  }}
                >
                  <div className="relative">
                    {/* Swipe Thumb with Shadow */}
                    <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full w-10 h-10" />
                    <div className="relative w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                    
                    {/* Ripple Effect */}
                    {swipeProgress > 0 && (
                      <div 
                        className="absolute inset-0 bg-primary/40 rounded-full animate-ping"
                        style={{ animationDuration: '1s' }}
                      />
                    )}
                  </div>
                </div>

                {/* Right Icon - Success State */}
                <div className="flex flex-col items-center flex-1">
                  <div 
                    className="text-4xl transition-all duration-150"
                    style={{
                      opacity: Math.min(1, swipeProgress * 1.5),
                      transform: `translateX(${swipeProgress * 20}px) scale(${0.7 + swipeProgress * 0.3})`,
                    }}
                  >
                    {swipeProgress > 0.7 ? '✅' : '🔓'}
                  </div>
                </div>
              </div>

              {/* Text Indicator */}
              <div className="h-6 mb-3">
                <p className="text-sm font-semibold transition-all duration-150"
                  style={{
                    opacity: swipeProgress > 0 ? 0 : 1,
                    color: 'hsl(var(--primary))',
                  }}
                >
                  Swipe right to login
                </p>
                {swipeProgress > 0 && (
                  <p className="text-sm font-bold animate-pulse"
                    style={{
                      color: swipeProgress > 0.7 ? 'hsl(142, 76%, 36%)' : 'hsl(var(--primary))',
                    }}
                  >
                    {swipeProgress > 0.7 ? '✓ Release to login!' : `Swiping... ${Math.round(swipeProgress * 100)}%`}
                  </p>
                )}
              </div>

              {/* Progress Bar - Enhanced */}
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 transition-all duration-75 rounded-full"
                  style={{ width: `${swipeProgress * 100}%` }}
                />
                {/* Shimmer Effect on Progress */}
                {swipeProgress > 0 && (
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white/50 blur-sm"
                    style={{
                      left: `${swipeProgress * 100}%`,
                      animation: 'pulse 1s infinite',
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <style>{`
            @keyframes shimmer {
              0%, 100% { opacity: 0; }
              50% { opacity: 0.5; }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0; }
              50% { opacity: 1; }
            }
          `}</style>
        </div>

        <CardFooter className="flex flex-col gap-3 mt-6">
          <Button variant="outline" className="w-full" asChild data-testid="button-signup">
            <Link href="/register">
              Create New Account
            </Link>
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register">
              <span className="text-primary hover:underline font-medium cursor-pointer" data-testid="link-register">
                Sign up here
              </span>
            </Link>
          </p>
        </CardFooter>

        <div className="text-center mt-6">
          <Link href="/">
            <a className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-home">
              ← Back to Home
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
