import { useLocation as useWouterLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Home, ShoppingCart } from "lucide-react";
import { ShareButton } from "@/components/share-button";

export default function Certificate() {
  const [, setLocation] = useWouterLocation();
  
  // Parse URL parameters
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode') as 'practice' | 'exam' | 'scenario' | null;
  const score = parseInt(params.get('score') || '0');
  const total = parseInt(params.get('total') || '0');
  const percentage = Math.round((score / total) * 100);
  
  const certificateTitle = mode === 'practice' 
    ? "Practice Test Certificate"
    : mode === 'exam'
    ? "Full Exam Certificate"
    : "Scenario Quiz Certificate";
    
  const certificateDescription = mode === 'practice'
    ? "You have successfully completed the CeMAP Practice Test"
    : mode === 'exam'
    ? "You have successfully completed the CeMAP Full Exam"
    : "You have successfully completed the CeMAP Scenario Quiz";

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-6">
        {/* Certificate Card */}
        <Card className="shadow-2xl border-2 border-primary/20" data-testid="card-certificate">
          <CardContent className="p-8 md:p-12 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-12 h-12 text-primary" />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Certificate of Achievement
                </h1>
                <p className="text-lg text-muted-foreground">
                  Awarded by JK Training
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-primary/20" />

            {/* Content */}
            <div className="text-center space-y-6">
              <div>
                <p className="text-xl text-foreground mb-2">
                  This is to certify that
                </p>
                <p className="text-2xl font-bold text-primary">
                  The Bearer
                </p>
              </div>
              
              <p className="text-lg text-foreground">
                {certificateDescription}
              </p>
              
              <div className="bg-primary/5 rounded-lg p-6 space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  {certificateTitle}
                </p>
                <p className="text-3xl font-bold text-primary">
                  Score: {score}/{total} ({percentage}%)
                </p>
                <p className="text-sm text-muted-foreground">
                  Date: {new Date().toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-primary/20" />

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground italic">
                Well done on passing! Keep up the excellent work.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bundle Promotion (Practice Mode Only) */}
        {mode === 'practice' && (
          <Card className="shadow-xl border-primary/30" data-testid="card-bundle-promo">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Ready for the Full CeMAP 2025 Autumn Edition?
                </h2>
                <p className="text-muted-foreground mb-4">
                  Fully prepare with our Complete Bundle Package
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-accent/50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-foreground">Full Exam Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    50 authentic CeMAP questions with 80% pass threshold
                  </p>
                </div>
                <div className="bg-accent/50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-foreground">Scenario Quiz</h3>
                  <p className="text-sm text-muted-foreground">
                    10 realistic scenarios with 50 questions total
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-muted-foreground line-through text-xl">£1.98</span>
                  <span className="text-3xl font-bold text-primary">£1.49</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Save 50p with the bundle package
                </p>
                <Button 
                  size="lg" 
                  className="w-full max-w-md"
                  onClick={() => setLocation('/checkout?type=bundle')}
                  data-testid="button-get-bundle"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Get Complete Bundle Package
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setLocation('/')}
            data-testid="button-home"
          >
            <Home className="w-5 h-5 mr-2" />
            Return Home
          </Button>
          
          <ShareButton 
            variant="outline" 
            size="lg"
            shareTitle="I passed the CeMAP quiz!"
            shareText={`I just scored ${percentage}% on the ${certificateTitle}! Check out this CeMAP quiz app to test your knowledge.`}
          />
          
          {mode !== 'practice' && (
            <Button
              size="lg"
              onClick={() => setLocation(`/quiz/${mode}`)}
              data-testid="button-retake"
            >
              Take Quiz Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
