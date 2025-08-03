import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Bookmark, Eye, TrendingUp, ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AuthDialog from "./AuthDialog";

interface Tool {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  logoUrl?: string;
  url: string;
  pricingType: string;
  rating: string;
  upvotes: number;
  views: number;
  featured?: boolean;
  categoryId?: string;
}

interface ToolCardProps {
  tool: Tool;
  viewMode?: 'grid' | 'list';
}

export default function ToolCard({ tool, viewMode = 'grid' }: ToolCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [currentUpvotes, setCurrentUpvotes] = useState(tool.upvotes);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  


  const voteMutation = useMutation({
    mutationFn: async (voteType: 'up' | 'down') => {
      const response = await apiRequest("POST", "/api/votes", {
        itemType: "tool",
        itemId: tool.id,
        voteType: voteType,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      setUserVote(data.userVote);
      setCurrentUpvotes(data.upvotes);
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/bookmarks", {
        itemType: "tool",
        itemId: tool.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsBookmarked(data.bookmarked);
      toast({
        title: data.bookmarked ? "Bookmarked" : "Removed from bookmarks",
        description: data.bookmarked 
          ? `${tool.name} has been added to your bookmarks`
          : `${tool.name} has been removed from your bookmarks`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVote = (voteType: 'up' | 'down') => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    voteMutation.mutate(voteType);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    bookmarkMutation.mutate();
  };

  const handleTryTool = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(tool.url, '_blank', 'noopener,noreferrer');
  };

  const handleCardClick = () => {
    window.location.href = `/tools/${tool.id}`;
  };

  const getPricingBadgeVariant = (pricingType: string) => {
    switch (pricingType) {
      case 'free':
        return 'default';
      case 'freemium':
        return 'secondary';
      case 'free_trial':
        return 'outline';
      case 'paid':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPricingLabel = (pricingType: string) => {
    switch (pricingType) {
      case 'free':
        return 'Free';
      case 'freemium':
        return 'Freemium';
      case 'free_trial':
        return 'Free Trial';
      case 'paid':
        return 'Paid';
      default:
        return 'Unknown';
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="tool-card hover:border-primary/20 group cursor-pointer w-full border-l-4 border-l-transparent hover:border-l-primary transition-all" onClick={handleCardClick}>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Voting Section */}
            <div className="flex flex-col items-center space-y-1 min-w-[60px]">
              <Button
                variant="ghost"
                size="sm"
                className={`p-1 h-8 w-8 ${userVote === 'up' ? 'text-orange-500 bg-orange-50' : 'text-muted-foreground hover:text-orange-500'}`}
                onClick={handleVote('up')}
                disabled={voteMutation.isPending}
              >
                <ChevronUp className="w-5 h-5" />
              </Button>
              <span className="text-lg font-bold text-foreground min-w-[40px] text-center">
                {currentUpvotes}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className={`p-1 h-8 w-8 ${userVote === 'down' ? 'text-orange-500 bg-orange-50' : 'text-muted-foreground hover:text-orange-500'}`}
                onClick={handleVote('down')}
                disabled={voteMutation.isPending}
              >
                <ChevronDown className="w-5 h-5" />
              </Button>
            </div>

            {/* Logo */}
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              {tool.logoUrl ? (
                <img 
                  src={tool.logoUrl} 
                  alt={`${tool.name} logo`}
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xl">
                  {tool.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-foreground text-xl mb-2">{tool.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span>{parseFloat(tool.rating).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{tool.views > 1000 ? `${(tool.views / 1000).toFixed(1)}k` : tool.views}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="bookmark-btn opacity-0 group-hover:opacity-100 p-2"
                    onClick={handleBookmark}
                    disabled={bookmarkMutation.isPending}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-primary' : ''}`} />
                  </Button>
                  {tool.featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4 line-clamp-2 text-base leading-relaxed">
                {tool.shortDescription || tool.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant={getPricingBadgeVariant(tool.pricingType)} className="px-3 py-1">
                    {getPricingLabel(tool.pricingType)}
                  </Badge>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>•</span>
                    <span>User-friendly Interface</span>
                    <span>•</span>
                    <span>Collaboration Features</span>
                  </div>
                </div>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-white font-medium px-6"
                  onClick={handleTryTool}
                >
                  Try for free
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="tool-card hover:border-primary/20 group cursor-pointer h-full border-l-4 border-l-transparent hover:border-l-primary transition-all" onClick={handleCardClick}>
      <CardContent className="p-6 h-full flex flex-col">
        {/* Header with voting and logo */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Voting Section for Grid */}
            <div className="flex flex-col items-center space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className={`p-1 h-6 w-6 ${userVote === 'up' ? 'text-orange-500 bg-orange-50' : 'text-muted-foreground hover:text-orange-500'}`}
                onClick={handleVote('up')}
                disabled={voteMutation.isPending}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <span className="text-sm font-bold text-foreground">
                {currentUpvotes}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className={`p-1 h-6 w-6 ${userVote === 'down' ? 'text-orange-500 bg-orange-50' : 'text-muted-foreground hover:text-orange-500'}`}
                onClick={handleVote('down')}
                disabled={voteMutation.isPending}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              {tool.logoUrl ? (
                <img 
                  src={tool.logoUrl} 
                  alt={`${tool.name} logo`}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <span className="text-white font-semibold">
                  {tool.name.charAt(0)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="bookmark-btn opacity-0 group-hover:opacity-100 p-2"
              onClick={handleBookmark}
              disabled={bookmarkMutation.isPending}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-primary' : ''}`} />
            </Button>
            {tool.featured && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="font-bold text-foreground text-lg mb-2">{tool.name}</h3>
          <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-3">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span>{parseFloat(tool.rating).toFixed(1)}</span>
            </div>
            <span>•</span>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{tool.views > 1000 ? `${(tool.views / 1000).toFixed(1)}k` : tool.views}</span>
            </div>
          </div>
          <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
            {tool.shortDescription || tool.description}
          </p>
        </div>
        
        {/* Tags and Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">AI Tool</Badge>
          <Badge variant="outline" className="text-xs">Collaboration</Badge>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <Badge variant={getPricingBadgeVariant(tool.pricingType)} className="px-3 py-1">
            {getPricingLabel(tool.pricingType)}
          </Badge>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-primary hover:bg-primary/90 text-white font-medium"
            onClick={handleTryTool}
          >
            Try for free
          </Button>
        </div>
      </CardContent>
      
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        title="Join the AI Community"
        description="Sign up to vote, bookmark tools, and connect with other AI enthusiasts"
      />
    </Card>
  );
}
