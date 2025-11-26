import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Zap } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function CemapQualification() {
  const [, setLocation] = useLocation();
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  
  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setShowSignupPrompt(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Award className="w-12 h-12 mx-auto mb-4 text-primary" data-testid="icon-qualification" />
          <h1 className="text-4xl font-bold mb-4" data-testid="heading-qualification">Qualification Structure</h1>
          <p className="text-muted-foreground text-lg" data-testid="description-qualification">
            The CeMAP is a level 3 qualification registered with Ofqual in the Regulated Qualifications Framework (RQF).
          </p>
        </div>

        <div className="space-y-8">
          {/* CeMAP 1 */}
          <Card data-testid="card-cemap-1">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-2xl text-primary" data-testid="title-cemap-1">CeMAP 1</CardTitle>
              <p className="text-sm text-muted-foreground mt-2" data-testid="subtitle-cemap-1">
                Financial Services Regulation & Ethics
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-md" data-testid="unit-1-1">
                  <h4 className="font-semibold mb-2" data-testid="unit-title-1-1">Unit 1</h4>
                  <p className="text-sm text-muted-foreground mb-2" data-testid="unit-desc-1-1">
                    Industry, Regulation and Key Parties
                  </p>
                  <Badge variant="outline" data-testid="unit-exam-1-1">1hr Exam</Badge>
                </div>
                <div className="p-4 border rounded-md" data-testid="unit-1-2">
                  <h4 className="font-semibold mb-2" data-testid="unit-title-1-2">Unit 2</h4>
                  <p className="text-sm text-muted-foreground mb-2" data-testid="unit-desc-1-2">
                    Mortgage Law, Practice and Application
                  </p>
                  <Badge variant="outline" data-testid="unit-exam-1-2">1hr Exam</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CeMAP 2 */}
          <Card data-testid="card-cemap-2">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-2xl text-primary" data-testid="title-cemap-2">CeMAP 2</CardTitle>
              <p className="text-sm text-muted-foreground mt-2" data-testid="subtitle-cemap-2">
                Assessment of Mortgage Advice Knowledge
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="p-4 border rounded-md bg-muted/30" data-testid="cemap-2-details">
                <p className="text-sm text-muted-foreground" data-testid="cemap-2-exam">2hr Exam</p>
              </div>
            </CardContent>
          </Card>

          {/* CeMAP 3 */}
          <Card data-testid="card-cemap-3">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-2xl text-primary" data-testid="title-cemap-3">CeMAP 3</CardTitle>
              <p className="text-sm text-muted-foreground mt-2" data-testid="subtitle-cemap-3">
                Assessment of Mortgage Advice Knowledge
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="p-4 border rounded-md bg-muted/30" data-testid="cemap-3-details">
                <p className="text-sm text-muted-foreground" data-testid="cemap-3-exam">2hr Exam</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sign Up Prompt */}
        {showSignupPrompt && !user && (
          <Card className="mt-12 border-primary bg-primary/5">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" data-testid="icon-prompt" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2" data-testid="prompt-title">
                    Ready to Start Your CeMAP Journey?
                  </h3>
                  <p className="text-muted-foreground mb-4" data-testid="prompt-description">
                    Sign up now and begin your CeMAP certification training with our comprehensive practice quizzes and study materials.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setLocation("/register")}
                      data-testid="button-signup-prompt"
                    >
                      Sign Up Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/login")}
                      data-testid="button-login-prompt"
                    >
                      Already Have an Account?
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Import Badge component
import { Badge } from "@/components/ui/badge";
