import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AuthDialog from "@/components/AuthDialog";
import {
  Star,
  ThumbsUp,
  ArrowLeft,
  MessageSquare,
  Flag,
  User,
  Search,
  Filter
} from "lucide-react";

type Tool = {
  id: string;
  name: string;
  logoUrl: string;
  rating: number;
  ratingCount: number;
};

type Review = {
  id: string;
  title: string;
  content: string;
  rating: number;
  upvotes: number;
  createdAt: string;
  helpful: number;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
};

type ReviewStats = {
  averageRating: number;
  totalReviews: number;
  ratingCounts: Record<number, number>;
};

export default function ToolReviews() {
  const [location] = useLocation();
  const toolId = location.split('/')[2]; // Extract toolId from /tools/:id/reviews
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingReviewId, setReportingReviewId] = useState<string>("");
  const [reportReason, setReportReason] = useState("");
  const [newReview, setNewReview] = useState({
    title: "",
    content: "",
    rating: 5
  });
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch tool data
  const { data: tool, isLoading: toolLoading } = useQuery({
    queryKey: [`/api/tools/${toolId}`],
    enabled: !!toolId
  });

  // Fetch reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: [`/api/tools/${toolId}/reviews`],
    enabled: !!toolId
  });

  // Calculate review stats
  const reviewStats: ReviewStats = {
    averageRating: reviews.length > 0 ? reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviews.length : 0,
    totalReviews: reviews.length,
    ratingCounts: reviews.reduce((acc: Record<number, number>, review: Review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {})
  };

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter((review: Review) => {
      // Filter by rating
      if (filterRating !== "all" && review.rating !== parseInt(filterRating)) {
        return false;
      }
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          review.title.toLowerCase().includes(query) ||
          review.content.toLowerCase().includes(query) ||
          review.user.firstName?.toLowerCase().includes(query) ||
          review.user.lastName?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a: Review, b: Review) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "highest-rated":
          return b.rating - a.rating;
        case "lowest-rated":
          return a.rating - b.rating;
        case "most-helpful":
          return (b.helpful || 0) - (a.helpful || 0);
        default:
          return 0;
      }
    });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      const response = await apiRequest("POST", "/api/reviews", reviewData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted!",
        description: "Your review has been submitted for approval.",
      });
      setShowReviewDialog(false);
      setNewReview({ title: "", content: "", rating: 5 });
      queryClient.invalidateQueries({ queryKey: [`/api/tools/${toolId}/reviews`] });
    },
    onError: (error: any) => {
      console.error("Submit review error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    }
  });

  // Report review mutation
  const reportReviewMutation = useMutation({
    mutationFn: async ({ reviewId, reason }: { reviewId: string; reason: string }) => {
      const response = await apiRequest("POST", `/api/reviews/${reviewId}/report`, { reason });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review reported",
        description: "Thank you for reporting this review. Our team will review it.",
      });
      setReportDialogOpen(false);
      setReportReason("");
      setReportingReviewId("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to report review",
        variant: "destructive",
      });
    }
  });

  // Vote on review mutation
  const voteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await apiRequest("POST", `/api/reviews/${reviewId}/vote`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tools/${toolId}/reviews`] });
    },
    onError: (error: any) => {
      if (error.message?.includes("401")) {
        setShowAuthDialog(true);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to vote on review",
        variant: "destructive",
      });
    }
  });

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    if (!newReview.title.trim() || !newReview.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    submitReviewMutation.mutate({
      toolId,
      title: newReview.title,
      content: newReview.content,
      rating: newReview.rating
    });
  };

  const handleReportReview = () => {
    if (!reportReason.trim()) {
      toast({
        title: "Error",
        description: "Please select a reason for reporting",
        variant: "destructive",
      });
      return;
    }

    reportReviewMutation.mutate({
      reviewId: reportingReviewId,
      reason: reportReason
    });
  };

  if (toolLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!tool) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Tool not found</h2>
            <p className="text-muted-foreground mb-4">The tool you're looking for doesn't exist.</p>
            <Link to="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link to={`/tools/${toolId}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {tool.name}
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={tool.logoUrl} 
                alt={tool.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {tool.name} Reviews
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  All user reviews for {tool.name}
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Review Stats */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
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
                  <div className="space-y-2 mb-6">
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

                  <Button 
                    onClick={() => isAuthenticated ? setShowReviewDialog(true) : setShowAuthDialog(true)}
                    className="w-full"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Write a Review
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Reviews List */}
            <div className="lg:col-span-3">
              {/* Filters and Search */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search reviews..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="highest-rated">Highest Rated</SelectItem>
                        <SelectItem value="lowest-rated">Lowest Rated</SelectItem>
                        <SelectItem value="most-helpful">Most Helpful</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterRating} onValueChange={setFilterRating}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter by rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="1">1 Star</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews List */}
              <div className="space-y-6">
                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {searchQuery || filterRating !== "all" 
                          ? "Try adjusting your filters or search terms."
                          : "Be the first to write a review for this tool!"
                        }
                      </p>
                      {(!searchQuery && filterRating === "all") && (
                        <Button onClick={() => isAuthenticated ? setShowReviewDialog(true) : setShowAuthDialog(true)}>
                          Write First Review
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  filteredReviews.map((review: Review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              {review.user.profileImageUrl ? (
                                <img 
                                  src={review.user.profileImageUrl} 
                                  alt={`${review.user.firstName || 'User'} ${review.user.lastName || ''}`}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {review.user.firstName} {review.user.lastName}
                              </p>
                              <div className="flex items-center gap-2">
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
                                <span className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (!isAuthenticated) {
                                setShowAuthDialog(true);
                                return;
                              }
                              setReportingReviewId(review.id);
                              setReportDialogOpen(true);
                            }}
                          >
                            <Flag className="w-4 h-4" />
                          </Button>
                        </div>

                        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                          {review.title}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                          {review.content}
                        </p>

                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => voteReviewMutation.mutate(review.id)}
                            disabled={voteReviewMutation.isPending}
                          >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Helpful ({review.helpful || 0})
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Write Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Write a Review for {tool.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <Select 
                value={newReview.rating.toString()} 
                onValueChange={(value) => setNewReview({...newReview, rating: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Stars - Excellent</SelectItem>
                  <SelectItem value="4">4 Stars - Very Good</SelectItem>
                  <SelectItem value="3">3 Stars - Good</SelectItem>
                  <SelectItem value="2">2 Stars - Fair</SelectItem>
                  <SelectItem value="1">1 Star - Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Review Title</Label>
              <Input
                id="title"
                value={newReview.title}
                onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                placeholder="Summarize your experience..."
              />
            </div>
            <div>
              <Label htmlFor="content">Your Review</Label>
              <Textarea
                id="content"
                value={newReview.content}
                onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                placeholder="Share your detailed experience with this tool..."
                rows={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReview}
                disabled={submitReviewMutation.isPending}
              >
                {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Review Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Why are you reporting this review?</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam or promotional content</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                  <SelectItem value="fake">Fake or misleading review</SelectItem>
                  <SelectItem value="harassment">Harassment or abuse</SelectItem>
                  <SelectItem value="other">Other reason</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleReportReview}
                disabled={reportReviewMutation.isPending}
                variant="destructive"
              >
                {reportReviewMutation.isPending ? "Reporting..." : "Report Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Dialog */}
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
      />
    </Layout>
  );
}