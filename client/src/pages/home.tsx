import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Trophy, Clock, CheckCircle2, Target, Users, Lock, Mail, Gift } from "lucide-react";
import { ShareButton } from "@/components/share-button";

export default function Home() {
  const [, setLocation] = useLocation();
  const [hasExamAccess, setHasExamAccess] = useState(false);
  const [hasScenarioAccess, setHasScenarioAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // Check for bundle access first (gives access to both)
      const bundleToken = localStorage.getItem('bundleAccessToken');
      const examToken = localStorage.getItem('examAccessToken');
      const scenarioToken = localStorage.getItem('scenarioAccessToken');

      if (bundleToken) {
        // Bundle gives access to both
        try {
          const examRes = await fetch('/api/check-exam-access', {
            headers: { 'X-Access-Token': bundleToken }
          });
          const examData = await examRes.json();
          
          const scenarioRes = await fetch('/api/check-scenario-access', {
            headers: { 'X-Access-Token': bundleToken }
          });
          const scenarioData = await scenarioRes.json();

          setHasExamAccess(examData.hasAccess);
          setHasScenarioAccess(scenarioData.hasAccess);
        } catch (error) {
          console.error('Error checking bundle access:', error);
        }
      } else {
        // Check individual access tokens
        if (examToken) {
          try {
            const res = await fetch('/api/check-exam-access', {
              headers: { 'X-Access-Token': examToken }
            });
            const data = await res.json();
            setHasExamAccess(data.hasAccess);
            if (!data.hasAccess) {
              localStorage.removeItem('examAccessToken');
            }
          } catch (error) {
            console.error('Error checking exam access:', error);
          }
        }

        if (scenarioToken) {
          try {
            const res = await fetch('/api/check-scenario-access', {
              headers: { 'X-Access-Token': scenarioToken }
            });
            const data = await res.json();
            setHasScenarioAccess(data.hasAccess);
            if (!data.hasAccess) {
              localStorage.removeItem('scenarioAccessToken');
            }
          } catch (error) {
            console.error('Error checking scenario access:', error);
          }
        }
      }

      setIsChecking(false);
    };

    checkAccess();
  }, []);
  return (
    <div className="min-h-screen bg-background">
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
              100+ Questions
            </Badge>
            <Badge variant="secondary" className="text-sm font-medium px-4 py-2" data-testid="badge-stat-topics">
              8 Topics
            </Badge>
            <Badge variant="secondary" className="text-sm font-medium px-4 py-2" data-testid="badge-stat-passmark">
              Pass Mark 80%
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
              {hasExamAccess ? (
                <Link href="/quiz/exam" data-testid="link-start-exam">
                  <Button className="w-full" size="lg" variant="default">
                    Start Full Exam
                  </Button>
                </Link>
              ) : (
                <div className="space-y-3">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-foreground mb-1">£0.99</p>
                    <p className="text-xs text-muted-foreground">One-time payment</p>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg" 
                    variant="default"
                    onClick={() => setLocation('/checkout?type=exam')}
                    data-testid="button-purchase-exam"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Purchase Full Exam
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all duration-300 border-primary/20" data-testid="card-mode-scenario">
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
                  <span className="text-sm text-foreground">All 50 realistic scenarios (150 questions)</span>
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
                  <span className="text-sm text-muted-foreground">Estimated time: 90-120 minutes</span>
                </li>
              </ul>
              {hasScenarioAccess ? (
                <Link href="/quiz/scenario" data-testid="link-start-scenario">
                  <Button className="w-full" size="lg" variant="default">
                    Start Scenario Quiz
                  </Button>
                </Link>
              ) : (
                <div className="space-y-3">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-foreground mb-1">£0.99</p>
                    <p className="text-xs text-muted-foreground">One-time payment</p>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg" 
                    variant="default"
                    onClick={() => setLocation('/checkout?type=scenario')}
                    data-testid="button-purchase-scenario"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Purchase Scenario Quiz
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {!hasExamAccess && !hasScenarioAccess && (
          <div className="mt-12 max-w-3xl mx-auto">
            <Card className="border-2 border-primary/30 bg-primary/5" data-testid="card-bundle-offer">
              <CardHeader className="text-center">
                <Badge variant="default" className="mx-auto mb-3 text-sm font-semibold px-4 py-1">
                  BEST VALUE - SAVE 50p!
                </Badge>
                <CardTitle className="text-3xl font-bold">Complete Bundle Package</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Get both Full Exam + Scenario Quiz together
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-muted-foreground line-through text-xl">£1.98</div>
                  <div className="text-4xl font-bold text-primary">£1.49</div>
                </div>
                
                <div className="text-left max-w-md mx-auto space-y-3">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">Full Exam Mode - 100 questions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">Scenario Quiz - All 50 scenarios (150 questions)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Gift className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-foreground">BONUS: 100 Days Email Learning</span>
                          <Badge variant="secondary" className="text-xs px-2 py-0">FREE</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Daily quiz questions sent to your inbox for 100 days
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <Button 
                  className="w-full max-w-md mx-auto" 
                  size="lg"
                  onClick={() => setLocation('/checkout?type=bundle')}
                  data-testid="button-purchase-bundle"
                >
                  Get Bundle Package
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

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

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Covering all CeMAP topics: Regulation & Ethics, Mortgage Law, Financial Advice, Products, Protection, Property Valuation, Legal Aspects, and Financial Conduct
          </p>
        </div>
      </div>
    </div>
  );
}
