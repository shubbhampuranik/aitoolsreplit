import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Bookmark, Eye, Download, Copy, DollarSign } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  price: string;
  isFree: boolean;
  upvotes: number;
  views: number;
  downloads: number;
  featured?: boolean;
  outputExamples?: string[];
}

interface PromptCardProps {
  prompt: Prompt;
  viewMode?: 'grid' | 'list';
}

export default function PromptCard({ prompt, viewMode = 'grid' }: PromptCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/bookmarks", {
        itemType: "prompt",
        itemId: prompt.id,
      });
    },
    onSuccess: (response) => {
      const data = response.json();
      setIsBookmarked(data.bookmarked);
      toast({
        title: data.bookmarked ? "Bookmarked" : "Removed from bookmarks",
        description: data.bookmarked 
          ? `${prompt.title} has been added to your bookmarks`
          : `${prompt.title} has been removed from your bookmarks`,
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
        description: "Please sign in to bookmark prompts.",
      });
      return;
    }
    bookmarkMutation.mutate();
  };

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated && !prompt.isFree) {
      toast({
        title: "Sign in required",
        description: "Please sign in to access premium prompts.",
      });
      return;
    }
    
    navigator.clipboard.writeText(prompt.content);
    toast({
      title: "Copied!",
      description: "Prompt has been copied to your clipboard.",
    });
  };

  const getPromptTypeIcon = (type: string) => {
    switch (type) {
      case 'chatgpt':
        return '🤖';
      case 'midjourney':
        return '🎨';
      case 'claude':
        return '🧠';
      case 'gemini':
        return '💎';
      default:
        return '✨';
    }
  };

  const getPromptTypeColor = (type: string) => {
    switch (type) {
      case 'chatgpt':
        return 'tag-green';
      case 'midjourney':
        return 'tag-purple';
      case 'claude':
        return 'tag-orange';
      case 'gemini':
        return 'tag-blue';
      default:
        return 'tag-gray';
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="tool-card hover:border-primary/20 group cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
              {getPromptTypeIcon(prompt.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-foreground text-lg mb-1">{prompt.title}</h3>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{prompt.views > 1000 ? `${(prompt.views / 1000).toFixed(1)}k` : prompt.views}</span>
                    </div>
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      <span>{prompt.downloads > 1000 ? `${(prompt.downloads / 1000).toFixed(1)}k` : prompt.downloads}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      <span>{prompt.upvotes}</span>
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
                {prompt.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className={`tag ${getPromptTypeColor(prompt.type)}`}>
                    {prompt.type.toUpperCase()}
                  </Badge>
                  {prompt.isFree ? (
                    <Badge variant="default" className="tag-green">Free</Badge>
                  ) : (
                    <Badge variant="outline" className="tag-yellow">
                      <DollarSign className="w-3 h-3 mr-1" />
                      ${parseFloat(prompt.price).toFixed(2)}
                    </Badge>
                  )}
                  {prompt.featured && (
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
                  onClick={handleCopyPrompt}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  {prompt.isFree ? 'Copy' : 'Preview'}
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-xl">
              {getPromptTypeIcon(prompt.type)}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">{prompt.title}</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className={`tag ${getPromptTypeColor(prompt.type)} text-xs`}>
                  {prompt.type.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {prompt.downloads} downloads
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
          {prompt.description}
        </p>

        {/* Output Examples Preview */}
        {prompt.outputExamples && prompt.outputExamples.length > 0 && (
          <div className="mb-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2">Example Output:</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {prompt.outputExamples[0]}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          {prompt.featured && (
            <Badge variant="secondary" className="tag tag-yellow">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          <Badge variant="secondary" className="tag tag-purple">Prompt</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {prompt.isFree ? (
              <Badge variant="default" className="tag-green">Free</Badge>
            ) : (
              <Badge variant="outline" className="tag-yellow">
                <DollarSign className="w-3 h-3 mr-1" />
                ${parseFloat(prompt.price).toFixed(2)}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              ↗ {prompt.upvotes}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary/80 font-medium"
            onClick={handleCopyPrompt}
          >
            <Copy className="w-4 h-4 mr-1" />
            {prompt.isFree ? 'Copy' : 'Get Prompt'} →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
