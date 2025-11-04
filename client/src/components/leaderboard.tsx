import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import type { HighScore } from "@shared/schema";

interface LeaderboardProps {
  mode: "exam" | "scenario";
  title: string;
}

export function Leaderboard({ mode, title }: LeaderboardProps) {
  const { data: highScores, isLoading } = useQuery<HighScore[]>({
    queryKey: ['/api/high-scores', mode],
    queryFn: async () => {
      const response = await fetch(`/api/high-scores?mode=${mode}&limit=4`);
      if (!response.ok) {
        throw new Error('Failed to fetch high scores');
      }
      return response.json();
    },
  });

  const { data: allTimeHigh, isLoading: isLoadingAllTime } = useQuery<HighScore | null>({
    queryKey: ['/api/all-time-high-score', mode],
    queryFn: async () => {
      const response = await fetch(`/api/all-time-high-score?mode=${mode}`);
      if (!response.ok) {
        throw new Error('Failed to fetch all-time high score');
      }
      return response.json();
    },
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-sm font-semibold text-muted-foreground">{index + 1}</span>;
    }
  };

  return (
    <Card data-testid={`card-leaderboard-${mode}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingAllTime || isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* All-Time High Score */}
            {allTimeHigh && (
              <div className="border-2 border-green-500 bg-green-50 dark:bg-green-950/30 rounded-lg p-3" data-testid="all-time-high-score">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-green-700 dark:text-green-300 truncate" data-testid="text-all-time-player-name">
                          {allTimeHigh.name}
                        </p>
                        <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300">
                          ALL-TIME BEST
                        </Badge>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {new Date(allTimeHigh.timestamp).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <Badge className="bg-green-600 dark:bg-green-500 text-white" data-testid="badge-all-time-score">
                      {Math.round((allTimeHigh.score / allTimeHigh.total) * 100)}%
                    </Badge>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                      {allTimeHigh.score}/{allTimeHigh.total}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly Top Scores */}
            {highScores && highScores.length > 0 ? (
          <div className="space-y-2">
            {highScores
              .filter(score => !allTimeHigh || score.id !== allTimeHigh.id)
              .map((score, index) => {
              const percentage = Math.round((score.score / score.total) * 100);
              return (
                <div
                  key={score.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover-elevate"
                  data-testid={`leaderboard-entry-${index}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getRankIcon(index)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate" data-testid={`text-player-name-${index}`}>
                        {score.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(score.timestamp).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <Badge variant={percentage >= 80 ? "default" : "secondary"} data-testid={`badge-score-${index}`}>
                      {percentage}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {score.score}/{score.total}
                    </p>
                  </div>
                </div>
              );
            })}
              </div>
            ) : !allTimeHigh ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-no-scores">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No scores yet this week</p>
                <p className="text-xs mt-1">Be the first to make it on the leaderboard!</p>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No weekly scores yet
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
