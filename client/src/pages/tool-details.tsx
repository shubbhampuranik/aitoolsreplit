import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AuthDialog from "@/components/AuthDialog";
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
  MessageSquare
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

  // Fetch alternatives
  const { data: alternatives = [] } = useQuery<Tool[]>({
    queryKey: [`/api/tools/${toolId}/alternatives`],
    enabled: !!toolId
  });

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

  // Fetch usage stats
  const { data: usageStats = { userCount: 0 } } = useQuery<{ userCount: number }>({
    queryKey: [`/api/tools/${toolId}/usage-stats`],
    enabled: !!toolId
  });

  const userVote = userInteractions?.vote;
  const isBookmarked = userInteractions?.bookmarked;
  const isFollowing = userInteractions?.following;

  // Mutations
  const voteMutation = useMutation({
    mutationFn: async (type: 'up' | 'down') => {
      return apiRequest('POST', `/api/tools/${toolId}/vote`, { type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tools/${toolId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/interactions/${toolId}`] });
    }
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/tools/${toolId}/bookmark`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/interactions/${toolId}`] });
    }
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

                    {/* Reviews Section */}
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Learn from top reviewers
                      </h2>
                      <div className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                        Login with LinkedIn to see your network →
                      </div>
                      
                      {reviews.slice(0, 3).map((review) => (
                        <Card key={review.id} className="border border-gray-200 dark:border-gray-700">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <img 
                                src={review.user?.profileImageUrl || "/api/placeholder/48/48"} 
                                alt={review.user?.firstName || 'User'}
                                className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {review.user?.firstName || 'Anonymous User'}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3 h-3 ${
                                            i < review.rating
                                              ? "fill-green-500 text-green-500"
                                              : "text-gray-300 dark:text-gray-600"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                  {review.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                  {review.content.substring(0, 200)}...
                                </p>
                                <Button variant="link" className="p-0 mt-2 text-blue-600 dark:text-blue-400 text-sm">
                                  Continue reading →
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Features Section */}
                <section id="features" className="scroll-mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                              <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">AI-Powered</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Advanced artificial intelligence capabilities</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">Easy to Use</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Intuitive user interface and workflow</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                              <Monitor className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">Cross-Platform</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Works seamlessly across all devices and platforms</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                              <ExternalLink className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">API Integration</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Robust API for custom integrations and workflows</p>
                            </div>
                          </div>
                        </div>
                      </div>
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
                      {tool.gallery && tool.gallery.length > 0 ? (
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
                      ) : (
                        <div className="text-center py-12">
                          <Camera className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">No screenshots available</p>
                        </div>
                      )}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Pros
                          </h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                              <span>Powerful AI capabilities</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                              <span>User-friendly interface</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                              <span>Regular updates and improvements</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Cons
                          </h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                              <span>Learning curve for new users</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                              <span>Premium features require subscription</span>
                            </li>
                          </ul>
                        </div>
                      </div>
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
                            <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800">
                              <option>Helpful</option>
                              <option>Newest</option>
                              <option>Oldest</option>
                              <option>Highest rating</option>
                              <option>Lowest rating</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                              <div className="flex items-start gap-4">
                                <img 
                                  src={review.user?.profileImageUrl || "/api/placeholder/48/48"} 
                                  alt={review.user?.firstName || 'User'}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                      {review.user?.firstName || 'Anonymous User'}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < review.rating
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "text-gray-300 dark:text-gray-600"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{review.title}</h4>
                                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{review.content}</p>
                                  <div className="flex items-center gap-4 text-sm">
                                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                      <ThumbsUp className="w-4 h-4 mr-1" />
                                      Helpful (12)
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                      Reply
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

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
                  <Card>
                    <CardHeader>
                      <CardTitle>Compare {tool.name} with Alternatives</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {alternatives.slice(0, 6).map((alt) => (
                          <div key={alt.id} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <img 
                              src={alt.logoUrl || "/api/placeholder/40/40"} 
                              alt={alt.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{alt.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{alt.shortDescription}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Compare
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Q&A Section */}
                <section id="qna" className="scroll-mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">How do I get started with {tool.name}?</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Getting started is easy! Simply sign up for an account and follow the onboarding process.</p>
                        </div>
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">What are the pricing options?</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">We offer flexible pricing plans to suit different needs, including free and premium tiers.</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Is there customer support available?</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Yes, we provide comprehensive customer support through multiple channels including email and live chat.</p>
                        </div>
                      </div>
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
                      <Heart className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                      Save
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleVote('up')}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
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
          <DialogContent className="max-w-4xl w-full p-0">
            <div className="relative">
              {selectedMedia && (
                <div className="w-full">
                  {selectedMedia.type === 'image' ? (
                    <img 
                      src={selectedMedia.url} 
                      alt={`Gallery image ${modalImageIndex + 1}`}
                      className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                    />
                  ) : (
                    <video 
                      src={selectedMedia.url} 
                      controls
                      className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                    />
                  )}
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
      </div>
    </Layout>
  );
}