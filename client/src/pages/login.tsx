import { useState, useRef } from "react";
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
import { GraduationCap, Loader2 } from "lucide-react";
import { useAuthSound } from "@/hooks/use-auth-sound";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { playSuccessSound } = useAuthSound();
  const [swipeProgress, setSwipeProgress] = useState(0);
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);
  
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
              CeMAP Quiz
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

        {/* Swipe to Login Gesture Area */}
        <div 
          className="mt-6 p-4 bg-primary/10 rounded-lg border-2 border-primary/20 cursor-grab active:cursor-grabbing overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          data-testid="swipe-login-area"
        >
          <div className="text-center">
            <div className="relative h-16 flex items-center justify-center mb-2">
              <div 
                className="absolute left-0 transition-all duration-75 text-3xl"
                style={{ opacity: 1 - swipeProgress }}
              >
                🌐
              </div>
              <div 
                className="absolute transition-all duration-75 text-3xl"
                style={{ 
                  opacity: swipeProgress,
                  transform: `scale(${0.5 + swipeProgress * 0.5})`
                }}
              >
                💰
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {swipeProgress > 0 
                ? `Swipe right... ${Math.round(swipeProgress * 100)}%`
                : "Swipe right to login"
              }
            </p>
            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-75"
                style={{ width: `${swipeProgress * 100}%` }}
              />
            </div>
          </div>
        </div>

        <CardFooter className="flex justify-center mt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register">
              <a className="text-primary hover:underline font-medium" data-testid="link-register">
                Sign up
              </a>
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
