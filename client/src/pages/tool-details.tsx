import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AuthDialog from "@/components/AuthDialog";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Star,
  Eye,
  ThumbsUp,
  Heart,
  Share2,
  ExternalLink,
  Calendar,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  Monitor,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Camera,
  MessageSquare,
  Flag,
  User,
  Bookmark
} from "lucide-react";

type Tool = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  logoUrl: string;
  url: string;
  category?: {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    slug: string;
  } | string;
  subcategories: string[];
  pricingType: string;
  pricingDetails?: string;
  featured: boolean;
  rating: number;
  ratingCount: number;
  upvotes: number;
  views: number;
  createdAt: string;
  gallery?: string[];
  videos?: Array<{ id: string; url: string; title: string; thumbnail?: string; source: string; }>;
  features?: Array<{ title: string; description: string; }>;
  prosAndCons?: { pros: string[]; cons: string[]; };
  alternatives?: Array<{ name: string; url: string; description: string; }>;
  faqs?: Array<{ question: string; answer: string; }>;
};

type Review = {
  id: string;
  title: string;
  content: string;
  rating: number;
  upvotes: number;
  createdAt: string;
  user: {
    id: string;
    firstName?: string;
    profileImageUrl?: string;
  };
};

// Alternatives Section Component
function AlternativesSection({ toolId, toolName }: { toolId: string; toolName: string }) {
  const { isAuthenticated } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { data: alternatives = [], isLoading } = useQuery<Array<Tool & { upvotes: number; userVoted: boolean }>>({
    queryKey: ['/api/tools', toolId, 'alternatives'],
  });

  const voteAlternativeMutation = useMutation({
    mutationFn: async (alternativeId: string) => {
      const response = await fetch(`/api/tools/${toolId}/alternatives/${alternativeId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to vote');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools', toolId, 'alternatives'] });
    },
  });

  const handleVote = (alternativeId: string) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    voteAlternativeMutation.mutate(alternativeId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compare {toolName} with Alternatives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedAlternatives = alternatives.slice(0, 10);
  const hasMoreAlternatives = alternatives.length > 10;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Compare {toolName} with Alternatives</CardTitle>
        </CardHeader>
        <CardContent>
          {alternatives.length > 0 ? (
            <div className="grid gap-4">
              {displayedAlternatives.map((alt) => (
                <div key={alt.id} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {alt.logoUrl ? (
                      <img 
                        src={alt.logoUrl} 
                        alt={alt.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ExternalLink className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/tools/${alt.id}`}>
                        <h3 className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{alt.name}</h3>
                      </Link>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(alt.id)}
                          className={`p-1 h-auto ${alt.userVoted ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
                          disabled={voteAlternativeMutation.isPending}
                        >
                          <ThumbsUp className={`w-3 h-3 ${alt.userVoted ? 'fill-current' : ''}`} />
                        </Button>
                        <span className="text-sm text-gray-500">{alt.upvotes || 0}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {alt.shortDescription || alt.description || 'No description available'}
                    </p>
                    {alt.url && (
                      <a 
                        href={alt.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-block"
                      >
                        Visit website →
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/tools/${alt.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    {alt.url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(alt.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {hasMoreAlternatives && (
                <div className="text-center pt-4">
                  <Link href={`/tools/${toolId}/alternatives`}>
                    <Button variant="outline" className="w-full">
                      View all {alternatives.length} alternatives
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <ExternalLink className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No alternatives available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showAuthDialog && (
        <AuthDialog onClose={() => setShowAuthDialog(false)} />
      )}
    </>
  );
}

export default function ToolDetailsPage() {
  const [location] = useLocation();
  const toolId = location.split('/')[2];
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showAlternativeDialog, setShowAlternativeDialog] = useState(false);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [newReview, setNewReview] = useState({ title: '', content: '', rating: 5 });
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string>("");
  const [reportReason, setReportReason] = useState("");
  const [reviewSortBy, setReviewSortBy] = useState("helpful");

  // Fetch tool data
  const { data: tool, isLoading: toolLoading } = useQuery<Tool>({
    queryKey: [`/api/tools/${toolId}`],
    enabled: !!toolId
  });

  // Fetch reviews
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: [`/api/tools/${toolId}/reviews`],
    enabled: !!toolId
  });

  // Calculate review statistics
  const reviewStats = {
    totalReviews: reviews.length,
    averageRating: reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0,
    ratingCounts: reviews.reduce((counts, review) => {
      counts[review.rating] = (counts[review.rating] || 0) + 1;
      return counts;
    }, {} as Record<number, number>)
  };



  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: !!isAuthenticated
  });

  // Fetch user interactions
  const { data: userInteractions = {} } = useQuery({
    queryKey: [`/api/user/interactions/${toolId}`],
    enabled: !!toolId && !!isAuthenticated
  });

  // Sort reviews based on selected criteria
  const sortedReviews = reviews.sort((a, b) => {
    switch (reviewSortBy) {
      case 'helpful':
        return ((b as any).helpful || 0) - ((a as any).helpful || 0);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return ((b as any).helpful || 0) - ((a as any).helpful || 0);
    }
  });

  // Fetch usage stats
  const { data: usageStats = { userCount: 0 } } = useQuery<{ userCount: number }>({
    queryKey: [`/api/tools/${toolId}/usage-stats`],
    enabled: !!toolId
  });

  const userVote = (userInteractions as any)?.vote;
  const isBookmarked = (userInteractions as any)?.bookmarked;
  const isFollowing = (userInteractions as any)?.following;

  // Mutations
  const voteMutation = useMutation({
    mutationFn: async (type: 'up' | 'down') => {
      return apiRequest('POST', `/api/tools/${toolId}/vote`, { type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tools/${toolId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/interactions/${toolId}`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        setShowAuthDialog(true);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/tools/${toolId}/bookmark`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/interactions/${toolId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/bookmarks`] });
      
      // Show toast notification based on bookmark state
      const wasBookmarked = isBookmarked;
      toast({
        title: wasBookmarked ? "Bookmark removed" : "Bookmark added",
        description: wasBookmarked 
          ? `Removed ${tool?.name || 'tool'} from your bookmarks`
          : `Added ${tool?.name || 'tool'} to your bookmarks`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        setShowAuthDialog(true);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to bookmark. Please try again.",
        variant: "destructive",
      });
    },
  });

  const followMutation = useMutation({
    mutationFn: async (data: { entityId: string; entityType: string }) => {
      return apiRequest('POST', '/api/follow', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/interactions/${toolId}`] });
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async (review: typeof newReview & { toolId: string }) => {
      return apiRequest('POST', '/api/reviews', review);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tools/${toolId}/reviews`] });
      setShowReviewDialog(false);
      setNewReview({ title: '', content: '', rating: 5 });
      toast({ 
        title: "Review submitted successfully!", 
        description: "Your review is pending approval and will be visible once approved by our team." 
      });
    }
  });

  // Review voting mutation
  const voteOnReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await apiRequest("POST", `/api/reviews/${reviewId}/vote`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tools/${toolId}/reviews`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        setShowAuthDialog(true);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to vote on review. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Report review mutation
  const reportReviewMutation = useMutation({
    mutationFn: async ({ reviewId, reason }: { reviewId: string; reason: string }) => {
      const response = await apiRequest("POST", `/api/reviews/${reviewId}/report`, { reason });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Reported",
        description: "Thank you for reporting this review. We'll review it shortly.",
      });
      setShowReportDialog(false);
      setReportReason("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        setShowAuthDialog(true);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to report review. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (toolLoading || !tool) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  const handleVote = (type: 'up' | 'down') => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    voteMutation.mutate(type);
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    bookmarkMutation.mutate();
  };

  const handleUseThis = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    toast({ title: "Thanks for sharing!", description: "Your usage has been recorded." });
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

  const handleVoteOnReview = (reviewId: string) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    voteOnReviewMutation.mutate(reviewId);
  };

  const handleReportReview = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    if (!reportReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for reporting this review.",
        variant: "destructive",
      });
      return;
    }
    reportReviewMutation.mutate({ reviewId: selectedReviewId, reason: reportReason });
  };

  const openReportDialog = (reviewId: string) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setSelectedReviewId(reviewId);
    setShowReportDialog(true);
  };

  // Helper function to get user initials for avatars
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${(firstName || "").charAt(0)}${(lastName || "").charAt(0)}`.toUpperCase();
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    reviewMutation.mutate({ ...newReview, toolId: tool.id });
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

  const nextScreenshot = () => {
    setCurrentScreenshot((prev) => (prev + 1) % (tool?.gallery?.length || 1));
  };

  const prevScreenshot = () => {
    setCurrentScreenshot((prev) => 
      prev === 0 ? (tool?.gallery?.length || 1) - 1 : prev - 1
    );
  };

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const openMediaModal = (url: string, type: 'image' | 'video', index: number = 0) => {
    setSelectedMedia({ url, type });
    setModalImageIndex(index);
    setShowGalleryModal(true);
  };

  const closeMediaModal = () => {
    setShowGalleryModal(false);
    setSelectedMedia(null);
    setModalImageIndex(0);
  };

  const nextModalImage = () => {
    if (tool?.gallery && modalImageIndex < tool.gallery.length - 1) {
      const newIndex = modalImageIndex + 1;
      setModalImageIndex(newIndex);
      setSelectedMedia({ url: tool.gallery[newIndex], type: 'image' });
    }
  };

  const prevModalImage = () => {
    if (tool?.gallery && modalImageIndex > 0) {
      const newIndex = modalImageIndex - 1;
      setModalImageIndex(newIndex);
      setSelectedMedia({ url: tool.gallery[newIndex], type: 'image' });
    }
  };

  return (
    <Layout>
      <div className="bg-white dark:bg-gray-900 min-h-screen">
        {/* TrustRadius-style Layout */}
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Navigation Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-4 space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      <button 
                        onClick={() => scrollToSection('overview')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          activeTab === 'overview' 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        📄 Overview
                      </button>
                      <button 
                        onClick={() => scrollToSection('features')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          activeTab === 'features' 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        ⚡ Features
                      </button>
                      <button 
                        onClick={() => scrollToSection('gallery')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          activeTab === 'gallery' 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        🖼️ Gallery
                      </button>
                      <button 
                        onClick={() => scrollToSection('pros-cons')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          activeTab === 'pros-cons' 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        ⚖️ Pros and Cons
                      </button>
                      <button 
                        onClick={() => scrollToSection('reviews')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          activeTab === 'reviews' 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        👥 Reviews ({reviews.length})
                      </button>
                      <button 
                        onClick={() => scrollToSection('alternatives')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          activeTab === 'alternatives' 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        🔄 Alternatives
                      </button>
                      <button 
                        onClick={() => scrollToSection('qna')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          activeTab === 'qna' 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        ❓ Q&A
                      </button>
                    </nav>
                  </CardContent>
                </Card>

                {/* Starting price */}
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Starting at</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {tool.pricingType === 'free' ? '$0 per month' : 'Contact for pricing'}
                    </div>
                    <Button variant="link" className="p-0 h-auto text-xs text-blue-600 dark:text-blue-400">
                      View Pricing →
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              {/* Tool Header */}
              <div className="mb-6">
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={tool.logoUrl || "/api/placeholder/64/64"} 
                    alt={tool.name}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tool.name}</h1>
                      {tool.featured && (
                        <Badge className="bg-blue-600 text-white">
                          ✓ Top Rated
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(tool.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium text-lg">{tool.rating}</span>
                        <span className="text-blue-600 dark:text-blue-400">out of 10</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {tool.ratingCount} Reviews and Ratings • {typeof tool.category === 'object' ? tool.category?.name : tool.category}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {tool.shortDescription}
                    </p>
                  </div>
                </div>

                {/* Usage Question */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Do you use {tool.name}?</span>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleUseThis}
                      className="flex items-center gap-2 bg-white dark:bg-gray-900"
                    >
                      <CheckCircle className="w-4 h-4" />
                      I use this
                      <Badge variant="secondary" className="ml-1">
                        {usageStats.userCount}
                      </Badge>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleUseSomethingElse}
                      className="flex items-center gap-2 bg-white dark:bg-gray-900"
                    >
                      <XCircle className="w-4 h-4" />
                      I use something else
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content Sections - All sections visible with smooth scroll navigation */}
              <div className="space-y-8">
                {/* Overview Section */}
                <section id="overview" className="scroll-mt-6">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>What is {tool.name}?</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                          {tool.description}
                        </p>
                        <Button variant="link" className="p-0 text-blue-600 dark:text-blue-400">
                          Read more →
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                {/* Features Section */}
                <section id="features" className="scroll-mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {tool.features && tool.features.length > 0 ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tool.features.map((feature, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                  <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">{feature.title}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Star className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">No features information available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </section>

                {/* Gallery Section */}
                <section id="gallery" className="scroll-mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Screenshots & Videos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Screenshots */}
                        {tool.gallery?.length ? (
                          <div>
                            <h4 className="text-lg font-medium mb-3">Screenshots</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {tool.gallery.slice(0, 3).map((url, index) => (
                                <div 
                                  key={index}
                                  className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                                  onClick={() => openMediaModal(url, 'image', index)}
                                >
                                  <div className="aspect-video">
                                    <img 
                                      src={url} 
                                      alt={`${tool.name} screenshot ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="w-12 h-12 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center">
                                        <ExternalLink className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {tool.gallery.length > 3 && (
                                <div 
                                  className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors bg-gray-100 dark:bg-gray-800"
                                  onClick={() => openMediaModal(tool.gallery[3], 'image', 3)}
                                >
                                  <div className="aspect-video flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                        +{tool.gallery.length - 3}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-500">
                                        more
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : null}

                        {/* Videos */}
                        {tool.videos?.length ? (
                          <div>
                            <h4 className="text-lg font-medium mb-3">Videos</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {tool.videos.slice(0, 4).map((video, index) => (
                                <div 
                                  key={video.id}
                                  className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                                  onClick={() => openMediaModal(video.url, 'video', index)}
                                >
                                  <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                                    {video.thumbnail ? (
                                      <img 
                                        src={video.thumbnail} 
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Play className="w-12 h-12 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="w-12 h-12 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center">
                                        <Play className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="absolute bottom-2 left-2 right-2">
                                    <p className="text-white text-sm font-medium bg-black/70 px-2 py-1 rounded truncate">
                                      {video.title}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {/* Empty state */}
                        {!tool.gallery?.length && !tool.videos?.length && (
                          <div className="text-center py-12">
                            <Camera className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No screenshots or videos available</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Pros and Cons Section */}
                <section id="pros-cons" className="scroll-mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pros and Cons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {tool.prosAndCons && (tool.prosAndCons.pros?.length > 0 || tool.prosAndCons.cons?.length > 0) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Pros
                            </h4>
                            {tool.prosAndCons.pros && tool.prosAndCons.pros.length > 0 ? (
                              <ul className="space-y-2">
                                {tool.prosAndCons.pros.map((pro, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                                    <span>{pro}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">No pros listed</p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                              <XCircle className="w-4 h-4" />
                              Cons
                            </h4>
                            {tool.prosAndCons.cons && tool.prosAndCons.cons.length > 0 ? (
                              <ul className="space-y-2">
                                {tool.prosAndCons.cons.map((con, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                                    <span>{con}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">No cons listed</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="flex items-center justify-center gap-2 mb-4">
                            <CheckCircle className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                            <XCircle className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400">No pros and cons information available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </section>

                {/* Reviews Section */}
                <section id="reviews" className="scroll-mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Left: Rating Summary */}
                        <div>
                          <div className="text-center mb-6">
                            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                              {reviewStats.averageRating.toFixed(1)}
                            </div>
                            <div className="flex items-center justify-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${
                                    i < Math.round(reviewStats.averageRating)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300 dark:text-gray-600"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Based on {reviewStats.totalReviews} reviews
                            </p>
                          </div>

                          {/* Rating Breakdown */}
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = reviewStats.ratingCounts[rating] || 0;
                              const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                              
                              return (
                                <div key={rating} className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 w-12">
                                    {[...Array(rating)].map((_, i) => (
                                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    ))}
                                  </div>
                                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 relative overflow-hidden">
                                    <div 
                                      className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                                    {count}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right: Review Action */}
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="mb-4">
                            <Star className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              Review {tool.name}?
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                              Share your experience to help others
                            </p>
                          </div>
                          <Button 
                            onClick={() => {
                              if (!user) {
                                setShowAuthDialog(true);
                              } else {
                                setShowReviewDialog(true);
                              }
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Leave a review
                          </Button>
                        </div>
                      </div>

                      {/* Reviews List */}
                      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reviews</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                            <select 
                              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                              value={reviewSortBy}
                              onChange={(e) => setReviewSortBy(e.target.value)}
                            >
                              <option value="helpful">Most Helpful</option>
                              <option value="newest">Newest</option>
                              <option value="oldest">Oldest</option>
                              <option value="highest">Highest Rating</option>
                              <option value="lowest">Lowest Rating</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {sortedReviews.slice(0, 5).map((review) => (
                            <Card key={review.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  {/* User Avatar */}
                                  <div className="flex-shrink-0">
                                    {(review as any).author?.profileImageUrl ? (
                                      <img 
                                        src={(review as any).author.profileImageUrl} 
                                        alt="Profile"
                                        className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold border border-gray-200 dark:border-gray-700">
                                        {getInitials((review as any).author?.firstName, (review as any).author?.lastName)}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          {(review as any).author?.firstName || 'Anonymous'} {(review as any).author?.lastName || ''}
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                              <Star
                                                key={i}
                                                className={`w-3 h-3 ${
                                                  i < review.rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300 dark:text-gray-600"
                                                }`}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                          {formatDate(review.createdAt)}
                                        </span>
                                      </div>
                                      
                                      {/* Action buttons */}
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleVoteOnReview(review.id)}
                                          className="text-gray-600 hover:text-blue-600"
                                        >
                                          <ThumbsUp className="w-4 h-4 mr-1" />
                                          Helpful ({(review as any).helpful})
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => openReportDialog(review.id)}
                                          className="text-gray-600 hover:text-red-600"
                                        >
                                          <Flag className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                      {review.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                      {review.content}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}

                          {/* Show All Reviews button if there are more than 5 reviews */}
                          {reviews.length > 5 && (
                            <div className="text-center py-6 border-t border-gray-200 dark:border-gray-700">
                              <Link to={`/tools/${tool.id}/reviews`}>
                                <Button variant="outline" size="lg">
                                  View All {reviews.length} Reviews
                                </Button>
                              </Link>
                            </div>
                          )}

                          {reviews.length === 0 && (
                            <div className="text-center py-8">
                              <div className="text-gray-400 dark:text-gray-600 mb-2">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reviews yet</h3>
                              <p className="text-gray-600 dark:text-gray-400 mb-4">Be the first to share your experience</p>
                              <Button 
                                onClick={() => {
                                  if (!user) {
                                    setShowAuthDialog(true);
                                  } else {
                                    setShowReviewDialog(true);
                                  }
                                }}
                                variant="outline"
                              >
                                Write a review
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Alternatives Section */}
                <section id="alternatives" className="scroll-mt-6">
                  <AlternativesSection toolId={tool.id} toolName={tool.name} />
                </section>

                {/* Q&A Section */}
                <section id="qna" className="scroll-mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {tool.faqs?.length ? (
                        <div className="space-y-4">
                          {tool.faqs.map((faq, index) => (
                            <div key={index} className={index < (tool.faqs?.length || 0) - 1 ? "border-b border-gray-200 dark:border-gray-700 pb-4" : ""}>
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">{faq.question}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">No frequently asked questions available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </section>
              </div>
            </div>

            {/* Right Action Sidebar */}
            <div className="lg:col-span-1 order-3">
              <div className="sticky top-4 space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 mb-3"
                      onClick={() => window.open(tool.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Contact Vendor
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mb-3"
                      onClick={handleBookmark}
                    >
                      <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current text-blue-600' : ''}`} />
                      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleVote('up')}
                        className={userVote === 'up' ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
                      >
                        <ThumbsUp className={`w-4 h-4 mr-1 ${userVote === 'up' ? 'fill-current' : ''}`} />
                        {tool.upvotes}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <AuthDialog 
          open={showAuthDialog} 
          onOpenChange={setShowAuthDialog} 
        />

        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Rating</Label>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating })}
                      className="transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          rating <= newReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {newReview.rating} star{newReview.rating !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div>
                <Label htmlFor="review-title">Title</Label>
                <Input
                  id="review-title"
                  placeholder="Summarize your experience"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="review-content">Review</Label>
                <Textarea
                  id="review-content"
                  placeholder="Share details about your experience with this tool"
                  value={newReview.content}
                  onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={submitReview} 
                  disabled={reviewMutation.isPending || !newReview.title.trim() || !newReview.content.trim()}
                >
                  {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Gallery Media Modal */}
        <Dialog open={showGalleryModal} onOpenChange={closeMediaModal}>
          <DialogContent className="max-w-4xl w-full p-0" aria-describedby="gallery-modal-description">
            <div className="relative">
              {selectedMedia && (
                <div className="w-full">
                  {selectedMedia.type === 'image' ? (
                    <img 
                      src={selectedMedia.url} 
                      alt={`Gallery image ${modalImageIndex + 1}`}
                      className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                    />
                  ) : selectedMedia.type === 'video' ? (
                    // Handle YouTube and other video URLs
                    selectedMedia.url.includes('youtube.com/watch?v=') || selectedMedia.url.includes('youtu.be/') ? (
                      <div className="w-full aspect-video">
                        <iframe
                          src={selectedMedia.url.includes('youtube.com/watch?v=') 
                            ? selectedMedia.url.replace('watch?v=', 'embed/').split('&')[0]
                            : selectedMedia.url.replace('youtu.be/', 'youtube.com/embed/')
                          }
                          title="Video player"
                          className="w-full h-full rounded-lg"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      </div>
                    ) : (
                      <video 
                        src={selectedMedia.url} 
                        controls
                        className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                      />
                    )
                  ) : null}
                </div>
              )}
              
              {/* Navigation Buttons */}
              {tool?.gallery && tool.gallery.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900"
                    onClick={prevModalImage}
                    disabled={modalImageIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900"
                    onClick={nextModalImage}
                    disabled={modalImageIndex === tool.gallery.length - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
              
              {/* Close Button */}
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900"
                onClick={closeMediaModal}
              >
                <XCircle className="w-4 h-4" />
              </Button>
              
              {/* Image Counter */}
              {tool?.gallery && tool.gallery.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {modalImageIndex + 1} / {tool.gallery.length}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Report Review Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason for reporting</Label>
                <Select onValueChange={setReportReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                    <SelectItem value="fake">Fake review</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleReportReview}
                  disabled={reportReviewMutation.isPending}
                  className="flex-1"
                >
                  {reportReviewMutation.isPending ? "Reporting..." : "Report"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowReportDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
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