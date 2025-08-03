import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, TrendingUp, Zap } from "lucide-react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export default function AuthDialog({ 
  open, 
  onOpenChange, 
  title = "Join the AI Community",
  description = "Sign up to vote, bookmark tools, and connect with other AI enthusiasts"
}: AuthDialogProps) {
  const handleGoogleSignIn = () => {
    // Redirect to Google OAuth login
    window.location.href = "/api/login";
  };

  // Use the beautiful shadcn Dialog component now that auth is working

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center space-y-3">
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">Vote on tools</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Track favorites</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Join community</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Submit tools</span>
            </div>
          </div>

          {/* Sign in button */}
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full h-12 text-base font-medium bg-[#4285f4] hover:bg-[#3367d6] text-white"
            size="lg"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Statistics */}
          <div className="flex items-center justify-center gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">10k+</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">500+</div>
              <div className="text-xs text-muted-foreground">AI Tools</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">50k+</div>
              <div className="text-xs text-muted-foreground">Reviews</div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            By signing up, you agree to our terms of service and privacy policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}