import { useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Home, BookOpen } from "lucide-react";

interface TopicGroup {
  unit: string;
  topics: string[];
}

export default function TopicQuestions() {
  const { data: allTopics = [], isLoading } = useQuery<string[]>({
    queryKey: ["/api/all-topics"],
    queryFn: async () => {
      const response = await fetch("/api/all-topics");
      if (!response.ok) throw new Error("Failed to fetch topics");
      return response.json();
    },
  });

  // Unit mapping - topics that are clearly Unit 2
  const unit2Indicators = ["Financial Services Industry"];
  
  const groupedTopics = useMemo(() => {
    const unit1Topics: string[] = [];
    const unit2Topics: string[] = [];

    allTopics.forEach(topic => {
      if (unit2Indicators.includes(topic)) {
        unit2Topics.push(topic);
      } else {
        unit1Topics.push(topic);
      }
    });

    const groups: TopicGroup[] = [];
    if (unit1Topics.length > 0) {
      groups.push({ unit: "Unit 1: CeMAP Fundamentals", topics: unit1Topics.sort() });
    }
    if (unit2Topics.length > 0) {
      groups.push({ unit: "Unit 2: FCA Regulation", topics: unit2Topics.sort() });
    }

    return groups;
  }, [allTopics]);

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3" data-testid="text-topic-title">
            Topic-Specific Questions
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Browse and practice questions organized by topic and regulatory unit
          </p>
          <Badge variant="secondary" className="text-sm font-medium px-4 py-2" data-testid="badge-topic-count">
            {allTopics.length} topics available
          </Badge>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading topics...</p>
          </div>
        ) : groupedTopics.length > 0 ? (
          <div className="space-y-12">
            {groupedTopics.map((group, groupIdx) => (
              <div key={groupIdx} data-testid={`unit-group-${groupIdx + 1}`}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {group.unit}
                  </h2>
                  <div className="h-1 w-12 bg-primary rounded" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.topics.map((topic, idx) => (
                    <Card
                      key={`${groupIdx}-${idx}`}
                      className="hover-elevate transition-all duration-300 cursor-pointer"
                      data-testid={`card-topic-${topic.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-start gap-2">
                          <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{topic}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <CardDescription>
                          Practice questions covering this topic area
                        </CardDescription>
                        <Link href={`/quiz/practice?topic=${encodeURIComponent(topic)}`}>
                          <Button className="w-full" size="sm" data-testid={`button-practice-${topic.replace(/\s+/g, '-').toLowerCase()}`}>
                            Practice Questions
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No topics available</p>
          </div>
        )}
      </div>
    </div>
  );
}
