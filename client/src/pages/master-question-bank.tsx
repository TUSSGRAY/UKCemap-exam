import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Home, Download } from "lucide-react";
import { Link } from "wouter";
import type { Question } from "@shared/schema";

export default function MasterQuestionBank() {
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ["master-questions"],
    queryFn: async () => {
      const response = await fetch("/api/questions/all");
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    },
  });

  const unit1Questions = questions.filter(q => q.topic !== "Financial Services Industry");
  const unit2Questions = questions.filter(q => q.topic === "Financial Services Industry");

  const exportToCSV = () => {
    const headers = ["Number", "Unit", "Topic", "Question", "Option A", "Option B", "Option C", "Option D", "Answer"];
    const rows = questions.map((q, idx) => [
      idx + 1,
      q.topic === "Financial Services Industry" ? "Unit 2" : "Unit 1",
      q.topic,
      q.question,
      q.optionA,
      q.optionB,
      q.optionC,
      q.optionD,
      q.answer,
    ]);

    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cemap-master-question-bank.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
              <Button variant="ghost" size="icon" data-testid="button-back-home-qb">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3" data-testid="text-qb-title">
            Master Question Bank
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Complete database of all {questions.length} exam questions
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="text-sm font-medium px-4 py-2" data-testid="badge-qb-total">
              {questions.length} Total Questions
            </Badge>
            <Badge variant="secondary" className="text-sm font-medium px-4 py-2" data-testid="badge-qb-unit1">
              {unit1Questions.length} Unit 1
            </Badge>
            <Badge variant="secondary" className="text-sm font-medium px-4 py-2" data-testid="badge-qb-unit2">
              {unit2Questions.length} Unit 2
            </Badge>
          </div>
          <Button 
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="mt-4"
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            Export to CSV
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading question bank...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Unit 1 */}
            {unit1Questions.length > 0 && (
              <div data-testid="unit-1-section">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Badge variant="default">Unit 1</Badge>
                  CeMAP Fundamentals ({unit1Questions.length} questions)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">#</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Topic</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Question</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Answer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unit1Questions.map((q, idx) => (
                        <tr key={q.id} className="border-b border-border hover:bg-muted/50 transition-colors" data-testid={`row-unit1-${idx}`}>
                          <td className="py-3 px-4 text-muted-foreground font-mono">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">{q.topic}</Badge>
                          </td>
                          <td className="py-3 px-4 max-w-md truncate text-foreground">{q.question}</td>
                          <td className="py-3 px-4 font-semibold text-primary">{q.answer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Unit 2 */}
            {unit2Questions.length > 0 && (
              <div data-testid="unit-2-section" className="mt-12">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Badge variant="default" className="bg-amber-600">Unit 2</Badge>
                  FCA Regulation ({unit2Questions.length} questions)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">#</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Topic</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Question</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Answer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unit2Questions.map((q, idx) => (
                        <tr key={q.id} className="border-b border-border hover:bg-muted/50 transition-colors" data-testid={`row-unit2-${idx}`}>
                          <td className="py-3 px-4 text-muted-foreground font-mono">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">{q.topic}</Badge>
                          </td>
                          <td className="py-3 px-4 max-w-md truncate text-foreground">{q.question}</td>
                          <td className="py-3 px-4 font-semibold text-primary">{q.answer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
