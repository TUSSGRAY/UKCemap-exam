import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Loader2, TrendingUp, Target, Zap, Share2, LogOut, Trash2, BookOpen, ClipboardList, Lightbulb } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/me"],
    queryFn: getQueryFn("/api/me"),
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/user/analytics"],
    queryFn: getQueryFn("/api/user/analytics"),
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logout", {}),
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation("/");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/delete-account", {}),
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  if (userLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Sign in Required</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" data-testid="button-dashboard-signin">
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground" data-testid="text-dashboard-title">
              Welcome back, {user.name}
            </h1>
            <p className="text-muted-foreground mt-2">Your CeMAP learning dashboard</p>
            <p className="text-sm text-primary font-medium mt-1" data-testid="text-subscription-status">
              Premium access active - 30 days remaining
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card data-testid="card-exams-taken">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Exams Taken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                {analytics?.examsTaken || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Total quiz attempts</p>
            </CardContent>
          </Card>

          <Card data-testid="card-avg-score">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                {analytics?.averageScore || 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">Across all exams</p>
            </CardContent>
          </Card>

          <Card data-testid="card-latest-score">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Latest Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                {analytics?.latestScore || "-"}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Most recent attempt</p>
            </CardContent>
          </Card>

          <Card data-testid="card-pass-rate">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pass Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                {analytics?.passRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">At 80% threshold</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card data-testid="card-strengths">
            <CardHeader>
              <CardTitle>Areas of Strength</CardTitle>
              <CardDescription>Topics you excel at</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.strengths && analytics.strengths.length > 0 ? (
                  analytics.strengths.map((topic: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-primary/10 rounded">
                      <span className="text-sm font-medium">{topic}</span>
                      <span className="text-xs bg-primary/20 px-2 py-1 rounded text-primary font-semibold">
                        Strong
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Take more exams to see your strengths</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-weaknesses">
            <CardHeader>
              <CardTitle>Areas for Improvement</CardTitle>
              <CardDescription>Focus areas to study</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.weaknesses && analytics.weaknesses.length > 0 ? (
                  analytics.weaknesses.map((topic: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-destructive/10 rounded">
                      <span className="text-sm font-medium">{topic}</span>
                      <span className="text-xs bg-destructive/20 px-2 py-1 rounded text-destructive font-semibold">
                        Focus
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Take more exams to see improvement areas</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Section */}
        <Card data-testid="card-refer-friend">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Refer a Friend
            </CardTitle>
            <CardDescription>Share your referral link and both get rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Your Referral Link:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}?ref=${user?.id}`}
                    readOnly
                    className="flex-1 px-3 py-2 rounded border border-border text-sm"
                    data-testid="input-referral-link"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}?ref=${user?.id}`);
                      toast({
                        title: "Copied",
                        description: "Referral link copied to clipboard",
                      });
                    }}
                    data-testid="button-copy-referral"
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  When your friends sign up using your link, you both receive 1 month free access to the Bundle Package.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <p className="font-semibold text-primary">0</p>
                  <p className="text-muted-foreground">Referrals</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">0</p>
                  <p className="text-muted-foreground">Converted</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">0</p>
                  <p className="text-muted-foreground">Rewards Earned</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Quiz Modes */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4" data-testid="text-premium-modes-title">Premium Quiz Modes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Specimen Exam */}
            <Card className="border-primary/20 bg-primary/5 hover-elevate" data-testid="card-premium-exam">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Specimen Exam
                </CardTitle>
                <CardDescription>Full 50-question mock exam</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Complete the full Specimen Exam to assess your knowledge. No feedback until the end. Aim for 80% to pass.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span> 50 comprehensive questions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span> Full exam simulation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span> Certificate on 80% pass
                  </li>
                </ul>
                <Button asChild className="w-full mt-4" data-testid="button-start-exam">
                  <Link href="/quiz/exam">Start Specimen Exam</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Scenario Quiz */}
            <Card className="border-primary/20 bg-primary/5 hover-elevate" data-testid="card-premium-scenario">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  Scenario Quiz
                </CardTitle>
                <CardDescription>10 real-world case studies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Navigate through realistic mortgage scenarios. Immediate feedback on each question. Test practical knowledge.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span> 10 case studies (50 questions)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span> Immediate feedback
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span> Real-world scenarios
                  </li>
                </ul>
                <Button asChild className="w-full mt-4" data-testid="button-start-scenario">
                  <Link href="/quiz/scenario">Start Scenario Quiz</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4" data-testid="text-quick-actions-title">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* View Analytics Guide */}
            <Card className="hover-elevate" data-testid="card-analytics-guide-quick">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="w-4 h-4" />
                  Analytics Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn how to interpret your performance data.
                </p>
                <Button asChild variant="outline" size="sm" className="w-full" data-testid="button-view-analytics-guide">
                  <Link href="/analytics">View Guide</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Practice Mode */}
            <Card className="hover-elevate" data-testid="card-practice-quick">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="w-4 h-4" />
                  Practice Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Get immediate feedback on practice questions.
                </p>
                <Button asChild variant="outline" size="sm" className="w-full" data-testid="button-practice-quick">
                  <Link href="/quiz/practice">Start Practice</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Profile & Settings */}
            <Card className="hover-elevate" data-testid="card-profile-quick">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="w-4 h-4" />
                  Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Study by topic with filtered questions.
                </p>
                <Button asChild variant="outline" size="sm" className="w-full" data-testid="button-topics-quick">
                  <Link href="/master-question-bank">View Topics</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg" data-testid="button-home">
            <Link href="/">Home</Link>
          </Button>
        </div>

        {/* Delete Account Section */}
        <div className="mt-12 max-w-2xl mx-auto">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Deleting your account is permanent and cannot be undone. All your quiz history, analytics, and personal information will be permanently removed.
              </p>
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  data-testid="button-delete-account-confirm"
                >
                  Delete My Account
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-background border border-destructive/20 rounded p-4">
                    <p className="text-sm font-semibold text-destructive mb-4">
                      Are you absolutely sure? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="destructive"
                        onClick={() => deleteAccountMutation.mutate()}
                        disabled={deleteAccountMutation.isPending}
                        data-testid="button-delete-confirm-final"
                      >
                        {deleteAccountMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Yes, Delete My Account"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleteAccountMutation.isPending}
                        data-testid="button-delete-cancel"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
