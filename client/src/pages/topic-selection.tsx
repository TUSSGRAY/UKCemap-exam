import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";

export default function TopicSelection() {
  const [, setLocation] = useLocation();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const { data: topics = [], isLoading } = useQuery<string[]>({
    queryKey: ["/api/topics"],
    queryFn: getQueryFn(),
  });

  const handleStartQuiz = (topic: string) => {
    setLocation(`/quiz/topic/${encodeURIComponent(topic)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" data-testid="icon-topic-selection" />
          <h1 className="text-4xl font-bold mb-2" data-testid="heading-topic-selection">Topic-Based Exam</h1>
          <p className="text-muted-foreground text-lg" data-testid="description-topic-selection">
            Select a topic and test your knowledge with 10 random questions
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground" data-testid="loading-topics">Loading topics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {topics.map((topic) => (
              <Card
                key={topic}
                className="cursor-pointer hover-elevate transition-all"
                onClick={() => setSelectedTopic(topic)}
                data-testid={`card-topic-${topic}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-lg" data-testid={`text-topic-${topic}`}>{topic}</p>
                      <Badge variant="outline" className="mt-2" data-testid={`badge-topic-${topic}`}>
                        10 questions
                      </Badge>
                    </div>
                    <ArrowRight 
                      className={`w-5 h-5 transition-transform ${
                        selectedTopic === topic ? "translate-x-1 text-primary" : "text-muted-foreground"
                      }`}
                      data-testid={`icon-arrow-${topic}`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedTopic && (
          <div className="flex gap-4 justify-center sticky bottom-4">
            <Button
              variant="outline"
              onClick={() => setSelectedTopic(null)}
              data-testid="button-cancel-topic"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleStartQuiz(selectedTopic)}
              size="lg"
              data-testid="button-start-topic-quiz"
            >
              Start Quiz
            </Button>
          </div>
        )}

        {!isLoading && topics.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground" data-testid="text-no-topics">
                No topics available at this time
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
