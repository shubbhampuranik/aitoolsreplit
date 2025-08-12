import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  BarChart3,
  Users,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  Settings,
  Database,
  Activity,
  Flag,
  Star,
  MessageSquare,
  Briefcase,
  BookOpen,
  Brain,
  Newspaper,
  DollarSign,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Stats {
  toolsCount: number;
  promptsCount: number;
  coursesCount: number;
  jobsCount: number;
  usersCount: number;
}

interface PendingItem {
  id: string;
  title?: string;
  name?: string;
  description: string;
  status: string;
  submittedBy?: string;
  createdAt: string;
  type: 'tool' | 'prompt' | 'course' | 'job' | 'post';
}

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
  tool?: {
    id: string;
    name: string;
  };
  author?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
  };
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // For demo purposes, assume admin access. In production, check user role
  const isAdmin = true; // user?.role === 'admin' || user?.email?.includes('@admin.');

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, isAdmin, toast]);

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } = useQuery<Review[]>({
    queryKey: ["/api/admin/reviews", statusFilter === 'all' ? undefined : statusFilter],
    queryFn: () => apiRequest("GET", `/api/admin/reviews${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`),
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Ensure reviews is always an array and log for debugging
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];
  console.log("Reviews data:", { reviewsData, reviews, statusFilter, reviewsLoading, reviewsError });

  // Mock data for pending items - in real app this would come from API
  const pendingItems: PendingItem[] = [
    {
      id: '1',
      name: 'GPT-4 Assistant Pro',
      description: 'Advanced AI assistant with enhanced capabilities for professional workflows',
      status: 'pending',
      submittedBy: 'user@example.com',
      createdAt: '2024-01-15T10:30:00Z',
      type: 'tool'
    },
    {
      id: '2',
      title: 'Creative Writing Prompts Bundle',
      description: 'A collection of 50+ creative writing prompts for content creators',
      status: 'pending',
      submittedBy: 'creator@example.com',
      createdAt: '2024-01-14T15:20:00Z',
      type: 'prompt'
    },
    {
      id: '3',
      title: 'Machine Learning Engineer',
      description: 'Senior ML Engineer position at TechCorp with competitive salary',
      status: 'pending',
      submittedBy: 'hr@techcorp.com',
      createdAt: '2024-01-13T09:15:00Z',
      type: 'job'
    }
  ];

  const approveMutation = useMutation({
    mutationFn: async ({ itemId, itemType }: { itemId: string; itemType: string }) => {
      return await apiRequest("PUT", `/api/${itemType}s/${itemId}`, {
        status: "approved"
      });
    },
    onSuccess: () => {
      toast({
        title: "Approved",
        description: "Item has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to approve item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ itemId, itemType }: { itemId: string; itemType: string }) => {
      return await apiRequest("PUT", `/api/${itemType}s/${itemId}`, {
        status: "rejected"
      });
    },
    onSuccess: () => {
      toast({
        title: "Rejected",
        description: "Item has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to reject item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const approveReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return await apiRequest("PATCH", `/api/admin/reviews/${reviewId}`, {
        status: "approved"
      });
    },
    onSuccess: () => {
      toast({
        title: "Review Approved",
        description: "Review has been approved and is now visible.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to approve review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return await apiRequest("PATCH", `/api/admin/reviews/${reviewId}`, {
        status: "rejected"
      });
    },
    onSuccess: () => {
      toast({
        title: "Review Rejected",
        description: "Review has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to reject review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (itemId: string, itemType: string) => {
    approveMutation.mutate({ itemId, itemType });
  };

  const handleReject = (itemId: string, itemType: string) => {
    rejectMutation.mutate({ itemId, itemType });
  };

  const handleApproveReview = (reviewId: string) => {
    approveReviewMutation.mutate(reviewId);
  };

  const handleRejectReview = (reviewId: string) => {
    rejectReviewMutation.mutate(reviewId);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'tool':
        return <Brain className="w-4 h-4" />;
      case 'prompt':
        return <MessageSquare className="w-4 h-4" />;
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'job':
        return <Briefcase className="w-4 h-4" />;
      case 'post':
        return <Newspaper className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'tag-green';
      case 'rejected':
        return 'tag-red';
      case 'pending':
        return 'tag-yellow';
      default:
        return 'tag-gray';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="loading-shimmer w-32 h-8 rounded"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="hero-gradient py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Admin Dashboard
              </h1>
              <p className="text-xl text-muted-foreground">
                Manage and moderate AI Hub community content
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Administrator
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Tools</p>
                  <p className="text-2xl font-bold">{stats?.toolsCount?.toLocaleString() || '0'}</p>
                </div>
                <Brain className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Prompts</p>
                  <p className="text-2xl font-bold">{stats?.promptsCount?.toLocaleString() || '0'}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Courses</p>
                  <p className="text-2xl font-bold">{stats?.coursesCount?.toLocaleString() || '0'}</p>
                </div>
                <BookOpen className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Jobs</p>
                  <p className="text-2xl font-bold">{stats?.jobsCount?.toLocaleString() || '0'}</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                  <p className="text-2xl font-bold">{stats?.usersCount?.toLocaleString() || '0'}</p>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="moderation">
              <Flag className="w-4 h-4 mr-2" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="w-4 h-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Activity className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Tool approved: GPT-4 Assistant</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Prompt rejected: Spam content</p>
                        <p className="text-xs text-muted-foreground">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <Users className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New user registration: john@example.com</p>
                        <p className="text-xs text-muted-foreground">6 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-sm">Tools</span>
                      </div>
                      <Badge variant="secondary" className="tag-yellow">5 pending</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">Prompts</span>
                      </div>
                      <Badge variant="secondary" className="tag-yellow">3 pending</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Jobs</span>
                      </div>
                      <Badge variant="secondary" className="tag-yellow">2 pending</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Courses</span>
                      </div>
                      <Badge variant="secondary" className="tag-yellow">1 pending</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="mt-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search pending items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pending Items */}
            <div className="space-y-4">
              {pendingItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          {getItemIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">
                              {item.title || item.name}
                            </h3>
                            <Badge variant="secondary" className={`tag ${getStatusColor(item.status)}`}>
                              {item.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Submitted by: {item.submittedBy}</span>
                            <span>•</span>
                            <span>
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleApprove(item.id, item.type)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleReject(item.id, item.type)}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviewsLoading ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Loading Reviews...</h3>
                    <p className="text-muted-foreground">Please wait while we fetch the reviews.</p>
                  </CardContent>
                </Card>
              ) : reviews.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Reviews Found</h3>
                    <p className="text-muted-foreground">
                      {statusFilter === 'pending' 
                        ? 'No pending reviews to moderate.'
                        : `No ${statusFilter} reviews found.`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge variant="secondary" className={`tag ${getStatusColor(review.status)}`}>
                              {review.status}
                            </Badge>
                            {review.tool && (
                              <Badge variant="outline" className="text-xs">
                                {review.tool.name}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground mb-2">
                            {review.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                            {review.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {review.author && (
                              <>
                                <span>
                                  By: {review.author.firstName} {review.author.lastName}
                                  {review.author.email && ` (${review.author.email})`}
                                </span>
                                <span>•</span>
                              </>
                            )}
                            <span>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>{review.helpful} helpful votes</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {review.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleApproveReview(review.id)}
                                disabled={approveReviewMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleRejectReview(review.id)}
                                disabled={rejectReviewMutation.isPending}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Detailed analytics and insights will be available here.
              </p>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">User Management</h3>
              <p className="text-muted-foreground">
                User management tools and moderation features will be available here.
              </p>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">System Settings</h3>
              <p className="text-muted-foreground">
                Platform configuration and settings will be available here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
