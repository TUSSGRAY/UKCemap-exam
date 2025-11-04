import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
  shareTitle?: string;
  shareText?: string;
}

export function ShareButton({ 
  variant = "outline", 
  size = "default",
  className = "",
  showText = true,
  shareTitle = "J&K CeMAP Training",
  shareText = "Check out this CeMAP quiz app - Master UK Mortgage Certification with practice questions and full exams!"
}: ShareButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const shareUrl = window.location.origin;

  const handleShare = async () => {
    // Check if Web Share API is available (mobile/modern browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: "Shared successfully!",
          description: "Thanks for spreading the word!",
        });
      } catch (error: any) {
        // User cancelled the share or error occurred
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          fallbackCopyToClipboard();
        }
      }
    } else {
      // Fallback to copying link
      fallbackCopyToClipboard();
    }
  };

  const fallbackCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this link with your friends and colleagues.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Please copy the URL manually from your browser.",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={className}
      data-testid="button-share"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          {showText && <span className="ml-2">Copied!</span>}
        </>
      ) : (
        <>
          {'share' in navigator ? (
            <Share2 className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {showText && <span className="ml-2">Share App</span>}
        </>
      )}
    </Button>
  );
}
