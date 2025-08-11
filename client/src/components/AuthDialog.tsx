import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Star, MessageSquare, CheckCircle } from "lucide-react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'vote' | 'bookmark' | 'review' | 'general';
  toolName?: string;
}

export default function AuthDialog({ open, onOpenChange, mode = 'general', toolName }: AuthDialogProps) {
  const handleGoogleSignIn = () => {
    window.location.href = '/api/login';
  };

  const getContent = () => {
    switch (mode) {
      case 'vote':
        return {
          title: `Vote for ${toolName || 'this tool'}`,
          description: 'Join our community to vote and help others discover the best AI tools.',
          action: 'Vote'
        };
      case 'bookmark':
        return {
          title: `Bookmark ${toolName || 'this tool'}`,
          description: 'Save your favorite tools and build your personal AI toolkit.',
          action: 'Bookmark'
        };
      case 'review':
        return {
          title: `Review ${toolName || 'this tool'}`,
          description: 'Share your experience and help the community make informed decisions.',
          action: 'Write Review'
        };
      default:
        return {
          title: 'Join the AI Community',
          description: 'Discover, share, and discuss the latest AI tools with thousands of users.',
          action: 'Get Started'
        };
    }
  };

  const content = getContent();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-3">
          <DialogTitle className="text-2xl font-bold">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Community Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center text-primary">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold">10,000+</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center text-primary">
                <Star className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold">500+</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">AI Tools</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center text-primary">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold">50,000+</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Reviews</div>
            </div>
          </div>

          {/* Google Sign In */}
          <Card className="border-2 border-primary/20">
            <CardContent className="p-4">
              <Button 
                onClick={handleGoogleSignIn}
                className="w-full h-12 text-base font-medium bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
                variant="outline"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              <div className="flex items-center justify-center gap-2 mt-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Free account • No credit card required
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-center">What you'll get:</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Vote on your favorite AI tools</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Bookmark tools for later</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Write reviews and help others</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Get personalized recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}