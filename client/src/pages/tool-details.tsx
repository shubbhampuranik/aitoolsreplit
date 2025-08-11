import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  Eye, 
  TrendingUp, 
  Bookmark, 
  Share2, 
  ExternalLink,
  Calendar,
  Users,
  Globe,
  CheckCircle,
  XCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Heart,
  BarChart3,
  Clock
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AuthDialog from "@/components/AuthDialog";
import Layout from "@/components/Layout";

interface Alternative {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  url: string;
  pricingType: string;
  rating: number;
  upvotes: number;
  featured: boolean;
  categoryId?: string;
}

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  author: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  createdAt: string;
  helpful: number;
}

interface ToolDetails {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  url: string;
  logoUrl: string;
  gallery: string[];
  pricingType: "free" | "freemium" | "paid" | "free_trial";
  pricingDetails: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  submittedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
  };
  upvotes: number;
  views: number;
  rating: number;
  ratingCount: number;
  featured: boolean;
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  tags?: { name: string; slug: string }[];
  createdAt: string;
  updatedAt: string;
}

export default function ToolDetailsPage() {
  const { toolId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const { data: tool, isLoading } = useQuery<ToolDetails>({
    queryKey: ["/api/tools", toolId],
  });

  const { data: alternatives = [] } = useQuery<Alternative[]>({
    queryKey: ["/api/tools", toolId, "alternatives"],
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/tools", toolId, "reviews"],
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ type, entityId, entityType }: { type: 'up' | 'down'; entityId: string; entityType: string }) => {
      return apiRequest("POST", "/api/votes", { type, entityId, entityType });
    },
    onSuccess: (data) => {
      setUserVote(data.userVote);
      queryClient.invalidateQueries({ queryKey: ["/api/tools", toolId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive",
      });
    },
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async ({ entityId, entityType }: { entityId: string; entityType: string }) => {
      return apiRequest("POST", "/api/bookmarks", { entityId, entityType });
    },
    onSuccess: (data) => {
      setIsBookmarked(data.bookmarked);
      toast({
        title: data.bookmarked ? "Bookmarked!" : "Removed from bookmarks",
        description: data.bookmarked 
          ? "Tool saved to your bookmarks" 
          : "Tool removed from bookmarks",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!tool) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tool Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400">The tool you're looking for doesn't exist.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleVote = (type: 'up' | 'down') => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    voteMutation.mutate({ type, entityId: tool.id, entityType: 'tool' });
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    bookmarkMutation.mutate({ entityId: tool.id, entityType: 'tool' });
  };

  const getPricingColor = (type: string) => {
    switch (type) {
      case "free": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "freemium": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "paid": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "free_trial": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Layout>
      <div className="bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Tool Info */}
              <div className="lg:col-span-2">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <img 
                      src={tool.logoUrl || "/api/placeholder/80/80"} 
                      alt={tool.name}
                      className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1>
                      {tool.featured && (
                        <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
                          Featured
                        </Badge>
                      )}
                      <Badge className={getPricingColor(tool.pricingType)}>
                        {tool.pricingType.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      {tool.shortDescription}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{tool.rating}</span>
                        <span>({tool.ratingCount})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{tool.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{tool.upvotes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(tool.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-12"
                        onClick={() => window.open(tool.url, '_blank')}
                      >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Visit {tool.name}
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant={userVote === 'up' ? "default" : "outline"} 
                          size="sm" 
                          onClick={() => handleVote('up')}
                          disabled={voteMutation.isPending}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {tool.upvotes}
                        </Button>
                        <Button 
                          variant={isBookmarked ? "default" : "outline"} 
                          size="sm" 
                          onClick={handleBookmark}
                          disabled={bookmarkMutation.isPending}
                        >
                          <Heart className={`w-4 h-4 mr-1 ${isBookmarked ? 'fill-current' : ''}`} />
                          Save
                        </Button>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>

                    <Separator className="my-6" />

                    {/* Quick Stats */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Category</span>
                          <span className="font-medium">{tool.category?.name || 'General'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Rating</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{tool.rating}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Views</span>
                          <span className="font-medium">{tool.views.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Votes</span>
                          <span className="font-medium">{tool.upvotes}</span>
                        </div>
                      </div>
                    </div>

                    {tool.tags && tool.tags.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div className="space-y-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {tool.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              <div className="space-y-8">
                {/* About Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      About {tool.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {tool.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Screenshots */}
                {tool.gallery && tool.gallery.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Screenshots</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tool.gallery.slice(0, 4).map((image, index) => (
                          <div key={index} className="aspect-video">
                            <img 
                              src={image} 
                              alt={`${tool.name} screenshot ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Alternatives Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Similar to {tool.name} ({alternatives.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {alternatives.length > 0 ? (
                        alternatives.map((alt, index) => (
                          <div key={alt.id} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                                {index + 1}
                              </div>
                              <img 
                                src={alt.logoUrl || "/api/placeholder/40/40"} 
                                alt={alt.name}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary cursor-pointer">
                                    {alt.name}
                                  </h3>
                                  {alt.featured && (
                                    <Badge className="bg-yellow-500 text-white text-xs">
                                      Featured
                                    </Badge>
                                  )}
                                  <Badge className={getPricingColor(alt.pricingType)} variant="secondary">
                                    {alt.pricingType.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {alt.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{alt.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                <span>{alt.upvotes}</span>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(alt.url, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Visit
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No alternatives found yet.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Reviews ({reviews.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {reviews.length > 0 ? (
                        reviews.slice(0, 5).map((review) => (
                          <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={review.author.profileImageUrl} />
                                <AvatarFallback>
                                  {review.author.firstName[0]}{review.author.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {review.author.firstName} {review.author.lastName}
                                  </span>
                                  <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star 
                                        key={star}
                                        className={`w-3 h-3 ${
                                          star <= review.rating 
                                            ? 'fill-yellow-400 text-yellow-400' 
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                {review.title && (
                                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                    {review.title}
                                  </h4>
                                )}
                                <p className="text-gray-700 dark:text-gray-300 mb-3">
                                  {review.content}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                  <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300">
                                    <ThumbsUp className="w-3 h-3" />
                                    Helpful ({review.helpful})
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No reviews yet. Be the first to review!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Submitted By */}
                {tool.submittedBy && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Submitted by</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={tool.submittedBy.profileImageUrl} />
                          <AvatarFallback>
                            {tool.submittedBy.firstName[0]}{tool.submittedBy.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {tool.submittedBy.firstName} {tool.submittedBy.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(tool.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Related Tools */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Related Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alternatives.slice(0, 4).map((alt) => (
                        <div key={alt.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                          <img 
                            src={alt.logoUrl || "/api/placeholder/32/32"} 
                            alt={alt.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {alt.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {alt.rating} ★
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
      />
    </Layout>
  );
}