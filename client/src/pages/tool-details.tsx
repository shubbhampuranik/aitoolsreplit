import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Clock,
  ChevronLeft,
  ChevronRight,
  Play,
  Image as ImageIcon,
  Video,
  Monitor,
  Search,
  ChevronUp,
  ChevronDown,
  Plus,
  MessageCircle
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
  const [activeTab, setActiveTab] = useState("about");
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [showAlternativeDialog, setShowAlternativeDialog] = useState(false);
  const [userUsageStat, setUserUsageStat] = useState(0);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: "", content: "" });
  const [isFollowing, setIsFollowing] = useState(false);

  const { data: tool, isLoading } = useQuery<ToolDetails>({
    queryKey: ["/api/tools", toolId],
  });

  const { data: alternatives = [] } = useQuery<Alternative[]>({
    queryKey: ["/api/tools", toolId, "alternatives"],
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/tools", toolId, "reviews"],
  });

  // Fetch YouTube videos for the tool
  const { data: videos = [] } = useQuery({
    queryKey: ["/api/tools", toolId, "videos"],
    queryFn: async () => {
      // Mock YouTube video data - in real app, you'd integrate with YouTube API
      return [
        {
          id: "dQw4w9WgXcQ",
          title: `How to use ${tool?.name || 'this tool'} - Complete Tutorial`,
          thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg`,
          duration: "12:34",
          views: "1.2M",
          channel: "AI Tools Academy"
        },
        {
          id: "9bZkp7q19f0",
          title: `${tool?.name || 'Tool'} Tips and Tricks for Beginners`,
          thumbnail: `https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg`,
          duration: "8:45",
          views: "856K",
          channel: "Tech Reviews"
        },
        {
          id: "kJQP7kiw5Fk",
          title: `Advanced ${tool?.name || 'Tool'} Features You Should Know`,
          thumbnail: `https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg`,
          duration: "15:22",
          views: "432K",
          channel: "Pro AI User"
        }
      ];
    },
    enabled: !!tool
  });

  // Mock usage statistics
  const { data: usageStats = { userCount: 0, currentUserUses: false } } = useQuery({
    queryKey: ["/api/tools", toolId, "usage"],
    queryFn: async () => ({
      userCount: Math.floor(Math.random() * 10000) + 1000,
      currentUserUses: false
    })
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ type, entityId, entityType }: { type: 'up' | 'down'; entityId: string; entityType: string }) => {
      return apiRequest("POST", "/api/votes", { type, entityId, entityType });
    },
    onSuccess: (data: any) => {
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
    onSuccess: (data: any) => {
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

  // Usage mutation
  const usageMutation = useMutation({
    mutationFn: async (uses: boolean) => {
      return apiRequest("POST", "/api/tools/usage", { toolId, uses });
    },
    onSuccess: (data: any) => {
      setUserUsageStat(data.userCount);
      toast({
        title: "Thanks for your input!",
        description: "Your usage status has been recorded",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update usage status",
        variant: "destructive",
      });
    },
  });

  // Review submission mutation
  const reviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; title: string; content: string }) => {
      return apiRequest("POST", `/api/tools/${toolId}/reviews`, reviewData);
    },
    onSuccess: () => {
      setShowReviewDialog(false);
      setNewReview({ rating: 5, title: "", content: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/tools", toolId, "reviews"] });
      toast({
        title: "Review submitted!",
        description: "Thanks for sharing your experience",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async ({ entityId, entityType }: { entityId: string; entityType: string }) => {
      return apiRequest("POST", "/api/follows", { entityId, entityType });
    },
    onSuccess: (data: any) => {
      setIsFollowing(data.following);
      toast({
        title: data.following ? "Following!" : "Unfollowed",
        description: data.following 
          ? "You'll get notified about updates" 
          : "You won't receive updates anymore",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update follow status",
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

  const handleUseThis = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    usageMutation.mutate(true);
  };

  const handleUseSomethingElse = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setShowAlternativeDialog(true);
  };

  const handleFollow = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    followMutation.mutate({ entityId: tool.id, entityType: 'tool' });
  };

  const submitReview = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    if (!newReview.title.trim() || !newReview.content.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }
    reviewMutation.mutate(newReview);
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

  // Carousel navigation functions
  const nextScreenshot = () => {
    setCurrentScreenshot((prev) => (prev + 1) % (tool?.gallery?.length || 1));
  };

  const prevScreenshot = () => {
    setCurrentScreenshot((prev) => 
      prev === 0 ? (tool?.gallery?.length || 1) - 1 : prev - 1
    );
  };

  const nextVideo = () => {
    setCurrentVideo((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentVideo((prev) => prev === 0 ? videos.length - 1 : prev - 1);
  };

  return (
    <Layout>
      <div className="bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
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

                    {/* Product Hunt-style Usage Question */}
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">Do you use {tool.name}?</span>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleUseThis}
                          className="flex items-center gap-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                          I use this
                          <Badge variant="secondary" className="ml-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {usageStats.userCount}
                          </Badge>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleUseSomethingElse}
                          className="flex items-center gap-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-orange-900 hover:border-orange-300 dark:hover:border-orange-600"
                        >
                          <XCircle className="w-4 h-4" />
                          I use something else
                        </Button>
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

                    {/* Follow Tool Feature */}
                    <div className="space-y-4">
                      <Button 
                        variant={isFollowing ? "default" : "outline"} 
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-medium h-12"
                        onClick={handleFollow}
                        disabled={followMutation.isPending}
                      >
                        {isFollowing ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Following
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5 mr-2" />
                            Follow Tool
                          </>
                        )}
                      </Button>
                      
                      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Get notified about updates
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Stats and Quick Actions */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{tool.upvotes}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Upvotes</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.floor(tool.views / 1000)}k</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Review Action */}
                    <div className="space-y-4">
                      <Button 
                        variant="outline" 
                        className="w-full border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900"
                        onClick={() => setShowReviewDialog(true)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Write Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Related Tools */}
                {alternatives.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Related Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {alternatives.slice(0, 3).map((alt) => (
                          <div key={alt.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                            <img 
                              src={alt.logoUrl || "/api/placeholder/32/32"} 
                              alt={alt.name}
                              className="w-8 h-8 rounded object-cover border border-gray-200 dark:border-gray-700"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                {alt.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{alt.rating}</span>
                                </div>
                                <Badge className={`${getPricingColor(alt.pricingType)} text-xs px-1 py-0`} variant="secondary">
                                  {alt.pricingType}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                        {alternatives.length > 3 && (
                          <Button variant="outline" size="sm" className="w-full mt-3">
                            View All {alternatives.length} Alternatives
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <div className="container mx-auto px-4 pt-0 pb-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Tabbed Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
                  <TabsTrigger value="videos">Videos</TabsTrigger>
                  <TabsTrigger value="similar">Similar</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                          {tool.description}
                        </p>
                        
                        {tool.pricingDetails && (
                          <>
                            <h3 className="text-xl font-semibold mt-8 mb-4">Pricing</h3>
                            <p className="text-gray-600 dark:text-gray-400">{tool.pricingDetails}</p>
                          </>
                        )}

                        <h3 className="text-xl font-semibold mt-8 mb-4">Key Features</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                          <li>Advanced AI-powered capabilities</li>
                          <li>User-friendly interface</li>
                          <li>Integration with popular tools</li>
                          <li>Real-time processing</li>
                          <li>Comprehensive analytics</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="screenshots" className="space-y-6">
                  {tool.gallery && tool.gallery.length > 0 ? (
                    <Card>
                      <CardContent className="p-6">
                        <div className="relative">
                          <div className="aspect-video mb-4">
                            <img 
                              src={tool.gallery[currentScreenshot]} 
                              alt={`${tool.name} screenshot ${currentScreenshot + 1}`}
                              className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                          </div>
                          {tool.gallery.length > 1 && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80"
                                onClick={prevScreenshot}
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80"
                                onClick={nextScreenshot}
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                              <div className="flex justify-center gap-2 mt-4">
                                {tool.gallery.map((_, index) => (
                                  <button
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-colors ${
                                      index === currentScreenshot 
                                        ? 'bg-primary' 
                                        : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                    onClick={() => setCurrentScreenshot(index)}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400">No screenshots available yet</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="videos" className="space-y-6">
                  {videos.length > 0 ? (
                    <Card>
                      <CardContent className="p-6">
                        <div className="relative">
                          <div className="aspect-video mb-4 bg-black rounded-lg overflow-hidden">
                            <iframe
                              src={`https://www.youtube.com/embed/${videos[currentVideo].id}`}
                              title={videos[currentVideo].title}
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                          {videos.length > 1 && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80"
                                onClick={prevVideo}
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80"
                                onClick={nextVideo}
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <div className="mt-4">
                            <h3 className="font-semibold text-lg mb-2">{videos[currentVideo].title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>{videos[currentVideo].channel}</span>
                              <span>{videos[currentVideo].duration}</span>
                              <span>{videos[currentVideo].views} views</span>
                            </div>
                          </div>
                          {videos.length > 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                              {videos.map((video, index) => (
                                <div
                                  key={video.id}
                                  className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                    index === currentVideo
                                      ? 'bg-primary/10 border border-primary/20'
                                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  }`}
                                  onClick={() => setCurrentVideo(index)}
                                >
                                  <div className="relative flex-shrink-0">
                                    <img 
                                      src={video.thumbnail}
                                      alt={video.title}
                                      className="w-20 h-12 object-cover rounded"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Play className="w-6 h-6 text-white drop-shadow-lg" />
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                      {video.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {video.duration}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Video className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400">No videos available yet</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="similar" className="space-y-6">
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
                          <div className="text-center py-12">
                            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                            <p className="text-gray-500 dark:text-gray-400">No alternatives found yet.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="faq" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Frequently Asked Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger>What is {tool.name} used for?</AccordionTrigger>
                          <AccordionContent>
                            {tool.name} is designed for {tool.description.toLowerCase()}. It provides users with powerful AI capabilities to enhance their workflow and productivity.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger>How much does {tool.name} cost?</AccordionTrigger>
                          <AccordionContent>
                            {tool.name} offers a {tool.pricingType} pricing model. {tool.pricingDetails || "Check the official website for detailed pricing information."}
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                          <AccordionTrigger>Is {tool.name} suitable for beginners?</AccordionTrigger>
                          <AccordionContent>
                            Yes, {tool.name} is designed with user-friendliness in mind. It offers an intuitive interface that makes it accessible for users of all skill levels, from beginners to experts.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                          <AccordionTrigger>What platforms does {tool.name} support?</AccordionTrigger>
                          <AccordionContent>
                            {tool.name} is a web-based tool that works across all modern browsers and operating systems. It's accessible from any device with an internet connection.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                          <AccordionTrigger>How can I get support for {tool.name}?</AccordionTrigger>
                          <AccordionContent>
                            You can get support through the official {tool.name} website, documentation, community forums, or by contacting their customer support team directly.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Reviews Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Reviews ({reviews.length})
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowReviewDialog(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Write Review
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.length > 0 ? (
                      reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={review.author.profileImageUrl} />
                              <AvatarFallback className="text-xs">
                                {review.author.firstName[0]}{review.author.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-gray-900 dark:text-white">
                                  {review.author.firstName} {review.author.lastName}
                                </span>
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star}
                                      className={`w-3 h-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                              <h4 className="font-medium text-sm mb-1">{review.title}</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {review.content}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <button className="flex items-center gap-1 hover:text-primary">
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>{review.helpful}</span>
                                </button>
                                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <Star className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Be the first to review!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Related Tools */}
              {alternatives.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Related Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alternatives.slice(0, 3).map((alt) => (
                        <div key={alt.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                          <img 
                            src={alt.logoUrl || "/api/placeholder/32/32"} 
                            alt={alt.name}
                            className="w-8 h-8 rounded object-cover border border-gray-200 dark:border-gray-700"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {alt.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">{alt.rating}</span>
                              </div>
                              <Badge className={`${getPricingColor(alt.pricingType)} text-xs px-1 py-0`} variant="secondary">
                                {alt.pricingType}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                      {alternatives.length > 3 && (
                        <Button variant="outline" size="sm" className="w-full mt-3">
                          View All {alternatives.length} Alternatives
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <AuthDialog 
          open={showAuthDialog} 
          onOpenChange={setShowAuthDialog} 
        />

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Write a Review for {tool.name}</DialogTitle>
              <DialogDescription>
                Share your experience with {tool.name} to help others make informed decisions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rating</label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="p-1"
                    >
                      <Star 
                        className={`w-6 h-6 ${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Review Title</label>
                <Input
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Summarize your experience in a few words"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Your Review</label>
                <Textarea
                  value={newReview.content}
                  onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Tell others about your experience with this tool..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitReview}
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Alternative Tools Dialog */}
        <Dialog open={showAlternativeDialog} onOpenChange={setShowAlternativeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>What do you use instead?</DialogTitle>
              <DialogDescription>
                Help others discover alternatives to {tool.name} by sharing what you use.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alternatives.map((alt) => (
                <div 
                  key={alt.id} 
                  className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => {
                    usageMutation.mutate(false);
                    setShowAlternativeDialog(false);
                  }}
                >
                  <img 
                    src={alt.logoUrl || "/api/placeholder/32/32"} 
                    alt={alt.name}
                    className="w-8 h-8 rounded object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{alt.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                      {alt.description}
                    </p>
                  </div>
                  <Badge className={getPricingColor(alt.pricingType)} variant="secondary">
                    {alt.pricingType}
                  </Badge>
                </div>
              ))}
              {alternatives.length === 0 && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">No alternatives available yet</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAlternativeDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Auth Dialog */}
        <AuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          mode="general"
          toolName={tool.name}
        />
      </div>
    </Layout>
  );
}