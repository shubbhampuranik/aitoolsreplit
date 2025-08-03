import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Bookmark, Eye, TrendingUp, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/bookmarks", {
        itemType: "tool",
        itemId: tool.id,
      });
    },
    onSuccess: (response) => {
      const data = response.json();
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

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark tools.",
      });
      return;
    }
    bookmarkMutation.mutate();
  };

  const handleTryTool = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(tool.url, '_blank', 'noopener,noreferrer');
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
      <Card className="tool-card hover:border-primary/20 group cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              {tool.logoUrl ? (
                <img 
                  src={tool.logoUrl} 
                  alt={`${tool.name} logo`}
                  className="w-10 h-10 rounded object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {tool.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-foreground text-lg mb-1">{tool.name}</h3>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span>{parseFloat(tool.rating).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{tool.views > 1000 ? `${(tool.views / 1000).toFixed(1)}k` : tool.views}</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>{tool.upvotes > 1000 ? `${(tool.upvotes / 1000).toFixed(1)}k` : tool.upvotes}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="bookmark-btn opacity-0 group-hover:opacity-100 p-2"
                  onClick={handleBookmark}
                  disabled={bookmarkMutation.isPending}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-primary' : ''}`} />
                </Button>
              </div>
              
              <p className="text-muted-foreground mb-3 line-clamp-2">
                {tool.shortDescription || tool.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant={getPricingBadgeVariant(tool.pricingType)}>
                    {getPricingLabel(tool.pricingType)}
                  </Badge>
                  {tool.featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary/80 font-medium"
                  onClick={handleTryTool}
                >
                  Try Now
                  <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="tool-card hover:border-primary/20 group cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
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
            <div>
              <h3 className="font-bold text-foreground text-lg">{tool.name}</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-muted-foreground ml-1">
                    {parseFloat(tool.rating).toFixed(1)}
                  </span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {tool.views > 1000 ? `${(tool.views / 1000).toFixed(1)}k` : tool.views} users
                </span>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="bookmark-btn opacity-0 group-hover:opacity-100 p-2"
            onClick={handleBookmark}
            disabled={bookmarkMutation.isPending}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-primary' : ''}`} />
          </Button>
        </div>
        
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {tool.shortDescription || tool.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="tag tag-blue">AI Tool</Badge>
          {tool.featured && (
            <Badge variant="secondary" className="tag tag-yellow">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant={getPricingBadgeVariant(tool.pricingType)}>
              {getPricingLabel(tool.pricingType)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              ↗ {tool.upvotes > 1000 ? `${(tool.upvotes / 1000).toFixed(1)}k` : tool.upvotes}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary/80 font-medium"
            onClick={handleTryTool}
          >
            Try Now →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
