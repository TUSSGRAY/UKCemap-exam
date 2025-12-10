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
  const swipeContainerRef = useRef<HTMLDivElement>(null);
  
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

        {/* Swipe to Login Toggle Button */}
        <div 
          ref={swipeContainerRef}
          className="mt-6 flex flex-col items-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          data-testid="swipe-login-area"
        >
          {/* Toggle Switch Container */}
          <div 
            className="relative w-64 h-16 bg-primary rounded-full cursor-pointer shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.98]"
            onClick={() => {
              if (!loginMutation.isPending) {
                onSubmit(form.getValues());
              }
            }}
          >
            {/* Slider Thumb */}
            <div 
              className="absolute left-1 top-1 bottom-1 w-20 bg-gray-200 dark:bg-gray-300 rounded-full shadow-md transition-all duration-150 flex items-center justify-center"
              style={{
                transform: `translateX(${swipeProgress * 140}px)`,
              }}
            >
              {loginMutation.isPending && (
                <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
              )}
            </div>
            
            {/* LOGIN Text */}
            <div className="absolute inset-0 flex items-center justify-end pr-8">
              <span className="text-xl font-bold text-black tracking-wide">
                LOGIN
              </span>
            </div>
          </div>
          
          {/* Swipe to Login Text */}
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            SWIPE TO LOGIN
          </p>
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
