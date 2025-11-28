import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Home, BookOpen, CheckCircle2 } from "lucide-react";

export default function TopicsGuide() {
  const topics = [
    {
      id: 1,
      title: "Financial Services Industry",
      description: "Understanding intermediation and the role of financial institutions",
      topics: [
        "GRAM model (Geographic, Risk, Aggregation, Maturity transformation)",
        "Money properties (PADS: Portable, Acceptable, Divisible, Stable)",
        "Intermediaries and disintermediation",
        "Credit unions and mutual organizations",
        "Ring-fencing in banking",
        "Bank of England functions"
      ]
    },
    {
      id: 2,
      title: "Economic Policy",
      description: "Macro and microeconomic factors affecting mortgages",
      topics: [
        "Inflation targeting and CPI",
        "Base rates and interest rates",
        "Budget deficits and surpluses",
        "GDP and economic growth",
        "Recession definitions",
        "European economic policy (Directives vs Regulations)",
        "Monetary Policy Committee decisions"
      ]
    },
    {
      id: 3,
      title: "FCA Strategic Objectives & Principles",
      description: "Regulatory framework and consumer protection principles",
      topics: [
        "FCA strategic objectives",
        "Consumer protection",
        "Competition and market integrity",
        "Regulatory principles",
        "Treating customers fairly",
        "Conflict of interest management"
      ]
    },
    {
      id: 4,
      title: "Systems, Controls & Training",
      description: "Internal compliance and competence requirements",
      topics: [
        "Risk management systems",
        "Compliance and controls",
        "Competence and training requirements",
        "Fitness and propriety",
        "Record keeping requirements",
        "Regulatory reporting"
      ]
    },
    {
      id: 5,
      title: "Financial Promotions & Communications",
      description: "Rules for advertising and customer communication",
      topics: [
        "Financial promotion rules",
        "Marketing communications",
        "Distance marketing requirements",
        "Prohibited comparisons",
        "Cancellation rights",
        "Consumer awareness standards"
      ]
    },
    {
      id: 6,
      title: "Mortgage Regulation & Consumer Credit",
      description: "Specific rules for mortgage lending and credit products",
      topics: [
        "MFIDPRU requirements",
        "Mortgage lending conduct",
        "Consumer credit regulations",
        "Credit agreement formalities",
        "Interest rate caps and controls",
        "Pre-contractual disclosures"
      ]
    },
    {
      id: 7,
      title: "Money Laundering Prevention",
      description: "Anti-money laundering and counter-terrorism financing",
      topics: [
        "AML/CFT regulations",
        "Customer identification (KYC)",
        "Beneficial ownership requirements",
        "Suspicious activity reporting",
        "Sanctions screening",
        "Record retention requirements"
      ]
    },
    {
      id: 8,
      title: "Data Protection & GDPR",
      description: "Personal data handling and privacy requirements",
      topics: [
        "GDPR principles",
        "Lawful processing bases",
        "Data subject rights",
        "Consent and legitimate interests",
        "Data breach notification",
        "International data transfers"
      ]
    },
    {
      id: 9,
      title: "Pension Regulations",
      description: "Pension scheme requirements and protections",
      topics: [
        "Pension scheme types",
        "Trustee responsibilities",
        "Member communications",
        "Scheme funding",
        "Investment regulations",
        "Employer contributions"
      ]
    },
    {
      id: 10,
      title: "Complaints & Compensation",
      description: "Handling complaints and FSCS compensation",
      topics: [
        "Complaint handling procedures",
        "Complaints resolution timescales",
        "Financial Ombudsman Service",
        "FSCS coverage limits",
        "Compensation principles",
        "Complaint record keeping"
      ]
    }
  ];

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
              <Button variant="ghost" size="icon" data-testid="button-back-home-topics">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3" data-testid="text-topics-title">
            CeMAP Topics Guide
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Comprehensive overview of all topics covered in the CeMAP exam
          </p>
          <Badge variant="default" className="text-sm font-medium" data-testid="badge-topics-info">
            10 Topics • 522+ Questions
          </Badge>
        </div>

        {/* Introduction */}
        <Card className="mb-12" data-testid="card-topics-intro">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              What You'll Learn
            </CardTitle>
            <CardDescription>
              A complete breakdown of all CeMAP examination topics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The CeMAP qualification covers 10 comprehensive topics across two main units. This guide explains each topic and what you need to know to pass the exam.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2">Unit Breakdown:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Unit 1:</strong> Core mortgage and financial services (419 questions)</li>
                <li><strong>Unit 2:</strong> FCA regulations and compliance (103 questions)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Topics Grid */}
        <div className="space-y-4 mb-12">
          <h2 className="text-2xl font-bold text-foreground" data-testid="text-all-topics">All Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topics.map((topic) => (
              <Card key={topic.id} className="hover-elevate" data-testid={`card-topic-${topic.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">{topic.title}</CardTitle>
                      <CardDescription>{topic.description}</CardDescription>
                    </div>
                    <Badge variant="outline" data-testid={`badge-topic-${topic.id}`}>
                      {topic.id < 3 ? "Unit 1" : "Unit 2"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3">Key Areas:</p>
                    <ul className="space-y-2">
                      {topic.topics.map((item, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Study Tips */}
        <Card className="mb-12 border-primary/20 bg-primary/5" data-testid="card-study-tips">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Study Tips
            </CardTitle>
            <CardDescription>
              How to effectively prepare for the CeMAP exam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Recommended Approach:</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>1. Start with Unit 1</strong> - Build your foundation</li>
                  <li><strong>2. Use Practice Mode</strong> - Test yourself on individual topics</li>
                  <li><strong>3. Study Weak Areas</strong> - Use analytics to identify gaps</li>
                  <li><strong>4. Take Full Exams</strong> - Specimen and Scenario modes</li>
                  <li><strong>5. Review & Improve</strong> - Target areas for improvement</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-3">Success Tips:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Aim for 80% to pass</li>
                  <li>✓ Review all 10 topics thoroughly</li>
                  <li>✓ Take multiple practice attempts</li>
                  <li>✓ Use the analytics dashboard to track progress</li>
                  <li>✓ Focus on weak areas before retaking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Modes */}
        <Card className="mb-12 border-primary/20 bg-primary/5" data-testid="card-quiz-modes">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Available Quiz Modes
            </CardTitle>
            <CardDescription>
              Different ways to practice and prepare
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Practice Mode</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  10 random questions with immediate feedback. Perfect for learning.
                </p>
                <Badge variant="outline" className="text-xs">Free</Badge>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Specimen Exam</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Full 50-question exam with no feedback until completion. Real exam simulation.
                </p>
                <Badge className="text-xs">Premium</Badge>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Scenario Quiz</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  10 case studies with 50 questions and immediate feedback. Practical focus.
                </p>
                <Badge className="text-xs">Premium</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="flex flex-col gap-4 justify-center items-center">
          <Link href="/quiz/practice">
            <Button size="lg" data-testid="button-start-practice-from-guide">
              <BookOpen className="w-4 h-4 mr-2" />
              Start Practicing
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" data-testid="button-back-home-from-guide">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
