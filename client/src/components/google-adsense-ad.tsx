import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

/**
 * Google AdSense Component for Practice Mode
 * 
 * SETUP INSTRUCTIONS:
 * 1. Sign up for Google AdSense at https://adsense.google.com
 * 2. Get your publisher ID (format: ca-pub-XXXXXXXXXXXXXXXX)
 * 3. Create an ad unit and get your ad slot ID
 * 4. Replace GOOGLE_ADSENSE_CLIENT_ID and GOOGLE_ADSENSE_SLOT_ID in this file
 * 5. Add the AdSense script to client/index.html (see comments in that file)
 * 
 * For now, this displays a placeholder ad with proper timing.
 */

// Google AdSense credentials - Update GOOGLE_ADSENSE_SLOT_ID with your ad unit slot ID
const GOOGLE_ADSENSE_CLIENT_ID = "ca-pub-4127314844320855"; // Your publisher ID
const GOOGLE_ADSENSE_SLOT_ID = "0000000000"; // TODO: Replace with your ad slot ID from AdSense dashboard
const AD_DISPLAY_TIME = 20; // 20 seconds

interface GoogleAdSenseAdProps {
  onComplete: () => void;
}

export function GoogleAdSenseAd({ onComplete }: GoogleAdSenseAdProps) {
  const [timeRemaining, setTimeRemaining] = useState(AD_DISPLAY_TIME);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Try to load the AdSense ad
    const loadAd = () => {
      try {
        if (window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
        }
      } catch (error) {
        console.log("AdSense not loaded yet, showing placeholder");
      }
    };

    // Attempt to load ad after a short delay
    const loadTimeout = setTimeout(loadAd, 100);

    // Start countdown timer
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(loadTimeout);
      clearInterval(interval);
    };
  }, []);

  const progress = ((AD_DISPLAY_TIME - timeRemaining) / AD_DISPLAY_TIME) * 100;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Supporting Free Practice Mode
            </h2>
            <p className="text-muted-foreground">
              Please wait {timeRemaining} seconds while we show a brief advertisement to help cover hosting costs
            </p>
          </div>

          {/* Ad Container */}
          <div className="mb-6 min-h-[250px] bg-muted/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center relative overflow-hidden">
            {/* Google AdSense Ad Unit */}
            {GOOGLE_ADSENSE_SLOT_ID !== "0000000000" ? (
              <ins
                className="adsbygoogle"
                style={{ display: "block", width: "100%", minHeight: "250px" }}
                data-ad-client={GOOGLE_ADSENSE_CLIENT_ID}
                data-ad-slot={GOOGLE_ADSENSE_SLOT_ID}
                data-ad-format="auto"
                data-full-width-responsive="true"
                data-testid="adsense-ad-unit"
              />
            ) : (
              /* Placeholder Ad - Shown when AdSense slot is not configured */
              <div className="text-center p-8" data-testid="ad-placeholder">
                <div className="text-6xl mb-4">📢</div>
                <p className="text-xl font-semibold text-foreground mb-2">
                  Advertisement Space
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  This is where your Google AdSense ad will appear
                </p>
                <p className="text-xs text-muted-foreground/60 max-w-md mx-auto">
                  To enable real ads, create an ad unit in your Google AdSense dashboard and update
                  the GOOGLE_ADSENSE_SLOT_ID in client/src/components/google-adsense-ad.tsx
                </p>
              </div>
            )}
          </div>

          {/* Timer Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time remaining
              </span>
              <span className="text-sm font-semibold text-foreground" data-testid="text-timer">
                {timeRemaining}s
              </span>
            </div>
            <Progress value={progress} className="h-2" data-testid="progress-ad-timer" />
          </div>

          {/* Continue Button - Only enabled after timer expires */}
          <Button
            onClick={onComplete}
            disabled={timeRemaining > 0}
            className="w-full"
            size="lg"
            data-testid="button-continue-after-ad"
          >
            {timeRemaining > 0 ? `Continue in ${timeRemaining}s` : "Continue to Next Question"}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Thank you for supporting free access to CeMAP practice questions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// TypeScript declaration for window.adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
