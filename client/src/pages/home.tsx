import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Trophy, Clock, CheckCircle2, Target, Users, LogIn, User, LogOut } from "lucide-react";
import { ShareButton } from "@/components/share-button";
import { Leaderboard } from "@/components/leaderboard";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import type { User as UserType } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user } = useQuery<UserType | null>({
    queryKey: ["/api/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout", {});
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/me"], null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              <span className="font-semibold text-foreground">CeMAP Quiz</span>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link href="/profile">
                    <Button variant="ghost" data-testid="button-profile">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    data-testid="button-logout-header"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button data-testid="button-login-header">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="mb-3 flex items-center justify-center gap-3">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase" data-testid="text-company-name">
              J&K Cemap Training
            </p>
          </div>
          <div className="flex items-center justify-center mb-6">
            <GraduationCap className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-5xl font-bold text-foreground" data-testid="text-app-title">
              CeMAP Quiz
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Master UK Mortgage Certification
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <Badge variant="secondary" className="text-sm font-medium px-4 py-2" data-testid="badge-stat-questions">
              150+ Questions
            </Badge>
            <Badge variant="secondary" className="text-sm font-medium px-4 py-2" data-testid="badge-stat-topics">
              2025 Syllabus
            </Badge>
            <Badge variant="secondary" className="text-sm font-medium px-4 py-2" data-testid="badge-stat-passmark">
              Analytics Included
            </Badge>
          </div>
          <div className="flex justify-center mt-6">
            <ShareButton 
              variant="default" 
              size="lg"
              className="px-8 py-6 text-lg animate-elegant-pulse hover:animate-none hover:scale-105 transition-transform duration-300"
              showText={true}
              shareTitle="J&K CeMAP Training"
              shareText="Check out this CeMAP quiz app - Master UK Mortgage Certification with practice questions and full exams!"
              buttonText="Share with Friends"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <Card className="hover-elevate transition-all duration-300" data-testid="card-mode-practice">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-semibold text-center">
                Practice Mode
              </CardTitle>
              <CardDescription className="text-center text-base">
                Perfect for focused revision and learning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">Choose 1-10 questions to practice</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">Immediate feedback after each answer</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">Perfect for topic-specific learning</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Estimated time: 5-15 minutes</span>
                </li>
              </ul>
              <Link href="/quiz/practice" data-testid="link-start-practice">
                <Button className="w-full" size="lg">
                  Start Practice
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all duration-300 border-primary/20" data-testid="card-mode-exam">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <div className="flex items-center justify-center gap-2">
                <CardTitle className="text-3xl font-semibold text-center">
                  Full Exam
                </CardTitle>
                <Badge variant="outline" className="text-sm font-bold" data-testid="badge-exam-price">
                  £0.99
                </Badge>
              </div>
              <CardDescription className="text-center text-base">
                Complete certification practice test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">50 mixed-topic questions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">Pass mark: 40/50 (80%)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">Results shown at the end</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Estimated time: 30-60 minutes</span>
                </li>
              </ul>
              <Link href="/checkout?product=exam" data-testid="link-purchase-exam">
                <Button className="w-full" size="lg" variant="default">
                  Purchase for £0.99
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all duration-300 border-primary/20" data-testid="card-mode-scenario">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="flex items-center justify-center gap-2">
                <CardTitle className="text-3xl font-semibold text-center">
                  Scenario Quiz
                </CardTitle>
                <Badge variant="outline" className="text-sm font-bold" data-testid="badge-scenario-price">
                  £0.99
                </Badge>
              </div>
              <CardDescription className="text-center text-base">
                Real-world case studies and applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">10 realistic scenarios (50 questions)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">Scenarios presented in random order</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">Immediate feedback on each answer</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Estimated time: 30-60 minutes</span>
                </li>
              </ul>
              <Link href="/checkout?product=scenario" data-testid="link-purchase-scenario">
                <Button className="w-full" size="lg" variant="default">
                  Purchase for £0.99
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          <Card className="hover-elevate transition-all duration-300 border-primary bg-primary/5" data-testid="card-bundle">
            <CardHeader className="text-center space-y-4">
              <Badge variant="default" className="mx-auto text-sm font-bold px-4 py-1" data-testid="badge-bundle-savings">
                Save 50p!
              </Badge>
              <CardTitle className="text-4xl font-bold">
                Bundle Package
              </CardTitle>
              <div className="flex items-baseline justify-center gap-3">
                <span className="text-5xl font-bold text-primary" data-testid="text-bundle-price">£1.49</span>
                <span className="text-2xl text-muted-foreground line-through" data-testid="text-bundle-original">£1.98</span>
              </div>
              <CardDescription className="text-base">
                Full Exam + Scenario Quiz + 100 Days Email Campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-primary">Full Exam Included:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">50 mixed-topic questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Certificate upon 80% pass</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-primary">Scenario Quiz Included:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">10 scenarios (50 questions)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Real-world case studies</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="bg-background p-4 rounded-lg border-2 border-primary/20">
                <h4 className="font-semibold text-sm text-primary mb-2">🎁 Bonus: 100 Days to CeMAP Ready</h4>
                <p className="text-sm text-muted-foreground">
                  Receive 3 scenario questions with answers via email every day for 100 days. Perfect for consistent learning!
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/checkout?product=bundle" className="w-full" data-testid="link-purchase-bundle">
                <Button className="w-full" size="lg" variant="default">
                  Purchase Bundle for £1.49
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-16 max-w-2xl mx-auto">
          <Card className="bg-muted/30" data-testid="card-textbook-promo">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 flex-shrink-0">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Need Study Materials?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get the official CeMAP textbook to complement your quiz preparation
                  </p>
                  <a
                    href="https://www.amazon.co.uk/CeMAP-1000-Practice-Questions-Module/dp/B0FCMD9WN3"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-buy-textbook"
                  >
                    <Button variant="outline" size="sm">
                      View CeMAP Textbook
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8" data-testid="text-leaderboard-title">
            Weekly Leaderboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Leaderboard mode="exam" title="Full Exam Top Scores" />
            <Leaderboard mode="scenario" title="Scenario Quiz Top Scores" />
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Covering all CeMAP topics: Regulation & Ethics, Mortgage Law, Financial Advice, Products, Protection, Property Valuation, Legal Aspects, and Financial Conduct
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2025 J&K CeMAP Training. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy-policy">
                <a className="hover:text-foreground transition-colors" data-testid="link-privacy-footer">
                  Privacy Policy
                </a>
              </Link>
              <span>•</span>
              <a href="mailto:training@ukcemap.co.uk" className="hover:text-foreground transition-colors" data-testid="link-contact-privacy">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
