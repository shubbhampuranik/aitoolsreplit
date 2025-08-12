import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, ThumbsUp, Flag, Star, User } from "lucide-react";
import { Link } from "wouter";
import AuthDialog from "@/components/AuthDialog";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  toolId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
  };
}

interface Tool {
  id: string;
  name: string;
  description: string;
  website: string;
  logo: string;
  rating: string;
  ratingCount: number;
}

export default function ToolReviews() {
  const [match, params] = useRoute("/tools/:id/reviews");
  const toolId = params?.id;
  
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string>("");
  const [reportReason, setReportReason] = useState("");

  const { data: tool } = useQuery<Tool>({
    queryKey: [`/api/tools/${toolId}`],
    enabled: !!toolId,
  });

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: [`/api/tools/${toolId}/reviews`],
    enabled: !!toolId,
  });

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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${(firstName || "").charAt(0)}${(lastName || "").charAt(0)}`.toUpperCase();
  };

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/tools/${toolId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {tool?.name || "Tool"}
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            {tool?.logo && (
              <img src={tool.logo} alt={tool.name} className="w-16 h-16 rounded-lg object-cover" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {tool?.name} Reviews
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {renderStars(Math.round(parseFloat(tool?.rating || "0")))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {tool?.rating} ({tool?.ratingCount} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No reviews yet for this tool.</p>
              </CardContent>
            </Card>
          ) : (
            reviews?.map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        {review.author?.profileImageUrl ? (
                          <img 
                            src={review.author.profileImageUrl} 
                            alt="Profile" 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {getInitials(review.author?.firstName, review.author?.lastName)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {review.author?.firstName || "Anonymous"} {review.author?.lastName || ""}
                          </span>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {review.title}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVoteOnReview(review.id)}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Helpful ({review.helpful})
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
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {review.content}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Report Dialog */}
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
        />
      </div>
    </div>
  );
}