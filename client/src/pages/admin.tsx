import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3, Users, Wrench, MessageSquare, Settings, Plus, Search, Eye, 
  ThumbsUp, Star, Edit, Trash2, BookOpen, Briefcase, Newspaper,
  Filter, CheckCircle, XCircle, Clock, AlertTriangle
} from "lucide-react";

interface Tool {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  logoUrl?: string;
  url: string;
  gallery?: string[];
  pricingType: string;
  pricingDetails?: string;
  categoryId?: string;
  category?: {
    name: string;
    id: string;
  };
  submittedBy?: string;
  status: string;
  upvotes: number;
  views: number;
  rating: number;
  ratingCount: number;
  featured: boolean;
  socialLinks?: any;
  faqs?: any;
  prosAndCons?: any;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  slug: string;
}

export default function AdminPanel() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You need to be logged in to access the admin panel.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Admin tabs configuration
  const adminTabs = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: BarChart3,
      description: "Overview and analytics"
    },
    { 
      id: "tools", 
      label: "AI Tools", 
      icon: Wrench,
      description: "Manage AI tools and applications"
    },
    { 
      id: "prompts", 
      label: "Prompts", 
      icon: MessageSquare,
      description: "AI prompts marketplace"
    },
    { 
      id: "courses", 
      label: "Courses", 
      icon: BookOpen,
      description: "Educational content and tutorials"
    },
    { 
      id: "jobs", 
      label: "Jobs", 
      icon: Briefcase,
      description: "AI job listings and opportunities"
    },
    { 
      id: "news", 
      label: "News", 
      icon: Newspaper,
      description: "Community news and updates"
    },
    { 
      id: "users", 
      label: "Users", 
      icon: Users,
      description: "User management and profiles"
    },
    { 
      id: "reviews", 
      label: "Reviews", 
      icon: Star,
      description: "User reviews and ratings"
    },
    { 
      id: "settings", 
      label: "Settings", 
      icon: Settings,
      description: "Platform configuration"
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          {/* Admin Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600 mt-1">Manage your AI community platform</p>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                Welcome, {user?.firstName || user?.email}
              </Badge>
            </div>
          </div>

          {/* Admin Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Sidebar Navigation */}
            <div className="flex gap-8">
              <div className="w-64 flex-shrink-0">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Navigation</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <TabsList className="grid w-full grid-cols-1 h-auto bg-transparent p-2">
                      {adminTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="flex items-start gap-3 p-3 h-auto text-left justify-start hover:bg-gray-100 data-[state=active]:bg-primary data-[state=active]:text-white"
                          >
                            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{tab.label}</div>
                              <div className="text-xs opacity-70 mt-1 line-clamp-2">
                                {tab.description}
                              </div>
                            </div>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Area */}
              <div className="flex-1">
                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="mt-0">
                  <DashboardContent />
                </TabsContent>

                {/* Tools Tab */}
                <TabsContent value="tools" className="mt-0">
                  <ContentManager
                    title="AI Tools Management"
                    description="Manage AI tools, approve submissions, and edit tool details"
                    endpoint="/api/admin/tools"
                    type="tools"
                  />
                </TabsContent>

                {/* Prompts Tab */}
                <TabsContent value="prompts" className="mt-0">
                  <ContentManager
                    title="Prompts Management"
                    description="Manage AI prompts, marketplace items, and pricing"
                    endpoint="/api/admin/prompts"
                    type="prompts"
                  />
                </TabsContent>

                {/* Courses Tab */}
                <TabsContent value="courses" className="mt-0">
                  <ContentManager
                    title="Courses Management"
                    description="Manage educational content, tutorials, and learning paths"
                    endpoint="/api/admin/courses"
                    type="courses"
                  />
                </TabsContent>

                {/* Jobs Tab */}
                <TabsContent value="jobs" className="mt-0">
                  <ContentManager
                    title="Jobs Management"
                    description="Manage job listings, applications, and employer profiles"
                    endpoint="/api/admin/jobs"
                    type="jobs"
                  />
                </TabsContent>

                {/* News Tab */}
                <TabsContent value="news" className="mt-0">
                  <ContentManager
                    title="News Management"
                    description="Manage community news, announcements, and blog posts"
                    endpoint="/api/admin/news"
                    type="news"
                  />
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="mt-0">
                  <UsersManagement />
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="mt-0">
                  <ReviewsManagement />
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="mt-0">
                  <SettingsManagement />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

// Dashboard Component
function DashboardContent() {
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const statCards = [
    {
      title: "Total Tools",
      value: stats?.totalTools || 0,
      icon: Wrench,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Pending Reviews",
      value: stats?.pendingReviews || 0,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50"
    },
    {
      title: "Total Views",
      value: stats?.totalViews || 0,
      icon: Eye,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600">Monitor your platform's performance and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  </div>
                  <div className={`${stat.bg} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">New tool submitted: "AI Writing Assistant"</p>
                <p className="text-sm text-gray-600">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">User review pending approval</p>
                <p className="text-sm text-gray-600">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">New user registration: john@example.com</p>
                <p className="text-sm text-gray-600">6 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Generic Content Manager Component
interface ContentManagerProps {
  title: string;
  description: string;
  endpoint: string;
  type: string;
}

function ContentManager({ title, description, endpoint, type }: ContentManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Query with better error handling
  const { data, isLoading, error } = useQuery({
    queryKey: [endpoint, searchTerm, statusFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        
        const url = `${endpoint}${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await apiRequest("GET", url);
        // Ensure we always return an array
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        throw error; // Let error boundary handle it
      }
    },
  });

  // Ensure items is always an array
  const items = Array.isArray(data) ? data : [];

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiRequest("PUT", `${endpoint}/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      toast({ title: "Updated successfully" });
    },
    onError: () => {
      toast({ title: "Update failed", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `${endpoint}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      toast({ title: "Deleted successfully" });
    },
    onError: () => {
      toast({ title: "Delete failed", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending", icon: Clock },
      approved: { variant: "default" as const, label: "Approved", icon: CheckCircle },
      rejected: { variant: "destructive" as const, label: "Rejected", icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Error Loading {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Unable to load {type}. This might be because the backend endpoints are not yet implemented.
          </p>
          <Button 
            className="mt-4" 
            onClick={() => queryClient.invalidateQueries({ queryKey: [endpoint] })}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={`Search ${type}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>

      {/* Content Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading {type}...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">No {type} found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : `Start by adding your first ${type.slice(0, -1)}`
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {(item.name || item.title || 'N/A').charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{item.name || item.title || 'Unnamed'}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {item.shortDescription || item.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status || 'pending')}
                    </TableCell>
                    <TableCell>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Select
                          value={item.status || 'pending'}
                          onValueChange={(status) => 
                            updateMutation.mutate({ id: item.id, updates: { status } })
                          }
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approve</SelectItem>
                            <SelectItem value="rejected">Reject</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteMutation.mutate(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Users Management Component
function UsersManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
        <p className="text-gray-600">Manage user accounts, permissions, and activity</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">User management interface coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Reviews Management Component with approval and moderation
function ReviewsManagement() {
  const [activeReviewTab, setActiveReviewTab] = useState("pending");
  const { toast } = useToast();

  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/reviews", activeReviewTab],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/admin/reviews?status=${activeReviewTab}`);
      console.log(`Reviews data for ${activeReviewTab}:`, response);
      return Array.isArray(response) ? response : [];
    },
  });

  const { data: reportedReviews = [] } = useQuery({
    queryKey: ["/api/admin/reported-reviews"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/reported-reviews");
      console.log("Reported reviews data:", response);
      return Array.isArray(response) ? response : [];
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiRequest("PATCH", `/api/admin/reviews/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reported-reviews"] });
      toast({ title: "Review updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update review", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: "secondary" as const, label: "Pending", icon: Clock },
      approved: { variant: "default" as const, label: "Approved", icon: CheckCircle },
      rejected: { variant: "destructive" as const, label: "Rejected", icon: XCircle },
    };
    
    const statusConfig = config[status as keyof typeof config] || config.pending;
    const Icon = statusConfig.icon;
    
    return (
      <Badge variant={statusConfig.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  const getReportBadge = (reportReason: string) => {
    const colors = {
      'spam': 'bg-red-100 text-red-800',
      'inappropriate': 'bg-orange-100 text-orange-800',
      'fake': 'bg-yellow-100 text-yellow-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    
    const colorClass = colors[reportReason as keyof typeof colors] || colors.other;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {reportReason}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reviews Management</h2>
        <p className="text-gray-600">Moderate user reviews, handle reports, and manage approval workflow</p>
      </div>

      <Tabs value={activeReviewTab} onValueChange={setActiveReviewTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="reported">Reported Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <ReviewsTable 
            reviews={reviews} 
            isLoading={isLoading}
            updateMutation={updateReviewMutation}
            getStatusBadge={getStatusBadge}
            title="Pending Reviews"
            showApprovalActions={true}
          />
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <ReviewsTable 
            reviews={reviews} 
            isLoading={isLoading}
            updateMutation={updateReviewMutation}
            getStatusBadge={getStatusBadge}
            title="Approved Reviews"
            showApprovalActions={false}
          />
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <ReviewsTable 
            reviews={reviews} 
            isLoading={isLoading}
            updateMutation={updateReviewMutation}
            getStatusBadge={getStatusBadge}
            title="Rejected Reviews"
            showApprovalActions={false}
          />
        </TabsContent>

        <TabsContent value="reported" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Reported Reviews ({reportedReviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportedReviews.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">No reported reviews at this time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportedReviews.map((review: any) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{review.title}</h4>
                            {getStatusBadge(review.status)}
                            {getReportBadge(review.reportReason)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{review.content}</p>
                          <p className="text-xs text-gray-500">
                            By {review.author?.firstName} {review.author?.lastName} • {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => updateReviewMutation.mutate({
                              id: review.id,
                              updates: { reported: false, reportReason: null, status: 'approved' }
                            })}
                          >
                            Keep Review
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateReviewMutation.mutate({
                              id: review.id,
                              updates: { status: 'rejected' }
                            })}
                          >
                            Remove Review
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {review.rating}/5
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {review.helpful || 0} helpful
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Reusable Reviews Table Component
interface ReviewsTableProps {
  reviews: any[];
  isLoading: boolean;
  updateMutation: any;
  getStatusBadge: (status: string) => JSX.Element;
  title: string;
  showApprovalActions: boolean;
}

function ReviewsTable({ reviews, isLoading, updateMutation, getStatusBadge, title, showApprovalActions }: ReviewsTableProps) {
  console.log(`ReviewsTable for ${title}:`, { reviews, isLoading, reviewsLength: reviews?.length });
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No {title.toLowerCase()} found</p>
          <p className="text-xs text-gray-400 mt-2">Debug: reviews = {JSON.stringify(reviews)}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title} ({reviews.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Review</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review: any) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{review.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-2">{review.content}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      By {review.author?.firstName} {review.author?.lastName}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {review.rating}/5
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(review.status)}
                </TableCell>
                <TableCell>
                  {new Date(review.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {showApprovalActions ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:bg-green-50"
                          onClick={() => updateMutation.mutate({
                            id: review.id,
                            updates: { status: 'approved' }
                          })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => updateMutation.mutate({
                            id: review.id,
                            updates: { status: 'rejected' }
                          })}
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SettingsManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600">Configure platform settings and preferences</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Settings management interface coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}