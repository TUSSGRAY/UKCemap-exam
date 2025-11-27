import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Home, TrendingUp, Target, AlertCircle, BookOpen, CheckCircle2 } from "lucide-react";

export default function AnalyticsGuide() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              <span className="font-semibold text-foreground">CeMAP Exam Training</span>
            </div>
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-home-analytics">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3" data-testid="text-analytics-title">
            Performance Analytics
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Track your progress and identify areas to improve
          </p>
          <Badge variant="default" className="text-sm font-medium" data-testid="badge-analytics-feature">
            Available with Paid Access
          </Badge>
        </div>

        {/* Main Analytics Metrics */}
        <div className="space-y-8 mb-12">
          <Card data-testid="card-what-analytics">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                What Analytics You'll Get
              </CardTitle>
              <CardDescription>
                Comprehensive metrics to understand your exam performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">📊 Quiz Metrics</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• <strong>Exams Taken:</strong> Total number of quizzes completed</li>
                    <li>• <strong>Average Score:</strong> Your mean score across all attempts</li>
                    <li>• <strong>Latest Score:</strong> Your most recent quiz result</li>
                    <li>• <strong>Pass Rate:</strong> Percentage of exams passed (80%+ threshold)</li>
                  </ul>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">📈 Topic Performance</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• <strong>Strength Areas:</strong> Topics where you consistently score high</li>
                    <li>• <strong>Weak Areas:</strong> Topics requiring focused study</li>
                    <li>• <strong>Topic Breakdown:</strong> Performance in each of 10 exam topics</li>
                    <li>• <strong>Progress Over Time:</strong> Track improvement across attempts</li>
                  </ul>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">🎯 Learning Insights</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• <strong>Question Analysis:</strong> See which question types challenge you</li>
                    <li>• <strong>Time Tracking:</strong> Monitor time spent per quiz</li>
                    <li>• <strong>Attempt History:</strong> Review all past quiz attempts</li>
                    <li>• <strong>Certificate Eligibility:</strong> Track progress towards 80% pass</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-identify-weak-areas">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                How to Identify Weak Areas
              </CardTitle>
              <CardDescription>
                Use your analytics dashboard to spot what needs improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Step 1: Check Your Dashboard</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    After completing each quiz, your analytics update immediately. Your dashboard shows:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>Red-flagged "Areas for Improvement" section with weak topics</li>
                    <li>Topics marked with "Focus" badge - these need more study</li>
                    <li>Comparison of current score vs your average</li>
                  </ul>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Step 2: Analyze Topic Performance</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    The analytics break down your performance by topic:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>Below 70% in a topic = Weak area needing attention</li>
                    <li>70-80% = Needs improvement before exam</li>
                    <li>80%+ = Strong area, but can still refine knowledge</li>
                  </ul>
                </div>

                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Step 3: Look for Patterns</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Identify common problem areas:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>Same topics appearing in weak list across multiple attempts</li>
                    <li>Specific question types you consistently struggle with</li>
                    <li>Timing issues (rushing and making mistakes in final questions)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-revision-strategy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                How to Revise Based on Analytics
              </CardTitle>
              <CardDescription>
                Turn your analytics insights into an effective study plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-3">📋 Revision Roadmap</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">1. Prioritize Weak Topics</p>
                      <p className="text-sm text-muted-foreground">
                        Focus on topics where you scored below 70%. These have the biggest impact on passing.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">2. Use Topic-Specific Practice</p>
                      <p className="text-sm text-muted-foreground">
                        Access the Topic-Specific Questions page to practice targeted questions in weak areas without distraction.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">3. Study Pattern Weak Spots</p>
                      <p className="text-sm text-muted-foreground">
                        Review textbook sections covering topics that appear repeatedly in your weak list.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">4. Take Targeted Mock Exams</p>
                      <p className="text-sm text-muted-foreground">
                        After studying, attempt the Specimen Exam or full exams focusing on previously weak topics.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">5. Track Progress</p>
                      <p className="text-sm text-muted-foreground">
                        Compare your new scores with previous attempts. You'll see topics moving from "Weak" to "Strong".
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">✅ Tips for Success</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• <strong>Don't ignore patterns:</strong> If a topic appears weak 3+ times, it needs serious review</li>
                    <li>• <strong>Time your reviews:</strong> Study weak topics first while you're fresh</li>
                    <li>• <strong>Combine resources:</strong> Use topic practice + textbook study for best results</li>
                    <li>• <strong>Weekly review:</strong> Check your analytics every week to stay on track</li>
                    <li>• <strong>Aim for 80%+:</strong> Focus on reaching the pass threshold (80%) in each topic</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-analytics-benefits">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Why Analytics Help You Pass
              </CardTitle>
              <CardDescription>
                Data-driven learning is the path to certification success
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Focused Study</p>
                    <p className="text-sm text-muted-foreground">No guessing what to study - your analytics show exactly what needs work</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Measure Progress</p>
                    <p className="text-sm text-muted-foreground">See your improvement over time. Weak areas becoming strong is real progress</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Confidence Boost</p>
                    <p className="text-sm text-muted-foreground">Know your strong areas and approach the exam with confidence</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Time Efficient</p>
                    <p className="text-sm text-muted-foreground">Study smarter, not harder. Prioritize topics that impact your score most</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Exam Readiness</p>
                    <p className="text-sm text-muted-foreground">Analytics show when you're ready. 80%+ average = likely pass on exam day</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-3" data-testid="text-analytics-cta">
            Ready to Start Your Exam Prep?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Unlock detailed analytics and targeted practice by accessing the full exam preparation features
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" data-testid="button-start-practice">
              <Link href="/quiz/practice">Start Practice Quiz</Link>
            </Button>
            <Button asChild size="lg" variant="outline" data-testid="button-view-dashboard">
              <Link href="/profile">View Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
