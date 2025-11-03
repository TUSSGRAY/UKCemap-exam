import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Trophy, Clock, CheckCircle2, Target, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <GraduationCap className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-5xl font-bold text-foreground" data-testid="text-app-title">
              CeMAP Quiz
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Master UK Mortgage Certification
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge variant="secondary" className="text-sm font-medium px-4 py-2" data-testid="badge-stat-questions">
              100+ Questions
            </Badge>
            <Badge variant="secondary" className="text-sm font-medium px-4 py-2" data-testid="badge-stat-topics">
              8 Topics
            </Badge>
            <Badge variant="secondary" className="text-sm font-medium px-4 py-2" data-testid="badge-stat-passmark">
              Pass Mark 80%
            </Badge>
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
              <CardTitle className="text-3xl font-semibold text-center">
                Full Exam
              </CardTitle>
              <CardDescription className="text-center text-base">
                Complete certification practice test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">100 mixed-topic questions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">Pass mark: 80/100 (80%)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">Results shown at the end</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Estimated time: 60-90 minutes</span>
                </li>
              </ul>
              <Link href="/quiz/exam" data-testid="link-start-exam">
                <Button className="w-full" size="lg" variant="default">
                  Start Full Exam
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all duration-300" data-testid="card-mode-scenario">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-semibold text-center">
                Scenario Quiz
              </CardTitle>
              <CardDescription className="text-center text-base">
                Real-world case studies and applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">1 realistic client scenario</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">3 scenario-based questions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">Immediate feedback on each answer</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Estimated time: 3-5 minutes</span>
                </li>
              </ul>
              <Link href="/quiz/scenario" data-testid="link-start-scenario">
                <Button className="w-full" size="lg">
                  Start Scenario Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Covering all CeMAP topics: Regulation & Ethics, Mortgage Law, Financial Advice, Products, Protection, Property Valuation, Legal Aspects, and Financial Conduct
          </p>
        </div>
      </div>
    </div>
  );
}
