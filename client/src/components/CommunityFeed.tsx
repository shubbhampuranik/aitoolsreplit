import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, Bookmark, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface FeedItem {
  id: string;
  type: 'tool_share' | 'prompt_publish' | 'discussion' | 'achievement';
  user: {
    id: string;
    name: string;
    avatar?: string;
    username: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  metadata?: {
    toolName?: string;
    promptTitle?: string;
    achievementType?: string;
  };
}

// Mock data - in a real app this would come from an API
const mockFeedData: FeedItem[] = [
  {
    id: '1',
    type: 'tool_share',
    user: {
      id: '1',
      name: 'Alex Chen',
      username: 'alexchen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Just discovered this amazing AI video editor - completely game-changing for content creators! The automation features save me hours of work.',
    timestamp: '2 hours ago',
    likes: 24,
    replies: 8,
    metadata: {
      toolName: 'AI Video Pro'
    }
  },
  {
    id: '2',
    type: 'prompt_publish',
    user: {
      id: '2',
      name: 'Sarah Martinez',
      username: 'sarahm',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b932?w=150&h=150&fit=crop&crop=face'
    },
    content: 'New ChatGPT prompt for creating detailed user personas - tested on 20+ projects! Works great for both B2B and B2C scenarios.',
    timestamp: '4 hours ago',
    likes: 67,
    replies: 15,
    metadata: {
      promptTitle: 'User Persona Generator'
    }
  },
  {
    id: '3',
    type: 'discussion',
    user: {
      id: '3',
      name: 'Mike Johnson',
      username: 'mikej',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    content: 'What are your predictions for AI in 2025? Share your thoughts on the biggest trends coming up. I think we\'ll see major breakthroughs in multimodal AI.',
    timestamp: '6 hours ago',
    likes: 43,
    replies: 32,
  },
  {
    id: '4',
    type: 'achievement',
    user: {
      id: '4',
      name: 'Emma Wilson',
      username: 'emmaw',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Just hit 1000 karma points! 🎉 Thanks to this amazing community for all the support and engagement.',
    timestamp: '1 day ago',
    likes: 89,
    replies: 24,
    metadata: {
      achievementType: '1K Karma'
    }
  },
];

export default function CommunityFeed() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [feedItems, setFeedItems] = useState<FeedItem[]>(mockFeedData);

  const handleLike = (itemId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts.",
      });
      return;
    }

    setFeedItems(items => 
      items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            isLiked: !item.isLiked,
            likes: item.isLiked ? item.likes - 1 : item.likes + 1
          };
        }
        return item;
      })
    );
  };

  const handleBookmark = (itemId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark posts.",
      });
      return;
    }

    setFeedItems(items => 
      items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            isBookmarked: !item.isBookmarked
          };
        }
        return item;
      })
    );

    toast({
      title: "Bookmarked",
      description: "Post has been added to your bookmarks.",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tool_share':
        return '🔧';
      case 'prompt_publish':
        return '✨';
      case 'discussion':
        return '💬';
      case 'achievement':
        return '🏆';
      default:
        return '📝';
    }
  };

  const getActivityBadge = (type: string, metadata?: any) => {
    switch (type) {
      case 'tool_share':
        return <Badge variant="secondary" className="tag-blue">Tool Share</Badge>;
      case 'prompt_publish':
        return <Badge variant="secondary" className="tag-purple">Prompt</Badge>;
      case 'discussion':
        return <Badge variant="secondary" className="tag-green">Discussion</Badge>;
      case 'achievement':
        return <Badge variant="secondary" className="tag-yellow">Achievement</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {feedItems.map((item) => (
        <Card key={item.id} className="activity-item">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarImage src={item.user.avatar} alt={item.user.name} />
                <AvatarFallback>
                  {item.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-foreground text-sm">
                    {item.user.name}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    @{item.user.username}
                  </span>
                  <span className="text-muted-foreground text-sm">•</span>
                  <span className="text-muted-foreground text-sm">
                    {item.timestamp}
                  </span>
                  {getActivityBadge(item.type, item.metadata)}
                </div>

                {/* Content */}
                <p className="text-foreground text-sm mb-3 leading-relaxed">
                  {item.content}
                </p>

                {/* Metadata */}
                {item.metadata && (
                  <div className="mb-3">
                    {item.metadata.toolName && (
                      <div className="bg-muted/30 rounded-lg p-2 text-sm">
                        <span className="font-medium">Tool: </span>
                        <span className="text-primary">{item.metadata.toolName}</span>
                      </div>
                    )}
                    {item.metadata.promptTitle && (
                      <div className="bg-muted/30 rounded-lg p-2 text-sm">
                        <span className="font-medium">Prompt: </span>
                        <span className="text-primary">{item.metadata.promptTitle}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 text-muted-foreground hover:text-primary"
                    onClick={() => handleLike(item.id)}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${item.isLiked ? 'fill-current text-red-500' : ''}`} />
                    <span className="text-xs">{item.likes}</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 text-muted-foreground hover:text-primary"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <span className="text-xs">{item.replies}</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 text-muted-foreground hover:text-primary"
                    onClick={() => handleBookmark(item.id)}
                  >
                    <Bookmark className={`w-4 h-4 ${item.isBookmarked ? 'fill-current text-primary' : ''}`} />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 text-muted-foreground hover:text-primary"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More */}
      <div className="text-center pt-4">
        <Button variant="outline" size="sm">
          Load More Activity
        </Button>
      </div>
    </div>
  );
}
