import { useState } from "react";
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
  Settings,
  Users,
  BarChart3,
  Shield,
  Star,
  Eye,
  ThumbsUp,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
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

interface AdminStats {
  totalTools: number;
  pendingTools: number;
  approvedTools: number;
  rejectedTools: number;
  totalUsers: number;
  totalViews: number;
  totalUpvotes: number;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Admin stats query
  const { data: adminStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
  });

  // Tools query with filters
  const { data: tools, isLoading: toolsLoading } = useQuery({
    queryKey: ["/api/admin/tools", searchTerm, statusFilter],
    enabled: isAuthenticated,
  });

  // Categories query
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  // Tool update mutation
  const updateToolMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Tool> }) => {
      return apiRequest("PATCH", `/api/admin/tools/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Tool updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedTool(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Tool deletion mutation
  const deleteToolMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/tools/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Tool deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToolEdit = (tool: Tool) => {
    setSelectedTool(tool);
    setIsEditDialogOpen(true);
  };

  const handleToolUpdate = (updates: Partial<Tool>) => {
    if (selectedTool) {
      updateToolMutation.mutate({ id: selectedTool.id, updates });
    }
  };

  const handleStatusChange = (toolId: string, newStatus: string) => {
    updateToolMutation.mutate({ 
      id: toolId, 
      updates: { status: newStatus }
    });
  };

  const handleDeleteTool = (toolId: string) => {
    if (confirm("Are you sure you want to delete this tool?")) {
      deleteToolMutation.mutate(toolId);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      approved: { variant: "default" as const, icon: CheckCircle, label: "Approved" },
      rejected: { variant: "destructive" as const, icon: XCircle, label: "Rejected" },
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

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="loading-shimmer w-32 h-8 rounded"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-6">
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">Manage tools, users, and platform content</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Administrator
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="tools">
              <Settings className="w-4 h-4 mr-2" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="w-4 h-4 mr-2" />
              Reviews
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

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Tools</p>
                      <p className="text-2xl font-bold">{adminStats?.totalTools || 0}</p>
                    </div>
                    <Settings className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                      <p className="text-2xl font-bold text-orange-600">{adminStats?.pendingTools || 0}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                      <p className="text-2xl font-bold">{adminStats?.totalViews?.toLocaleString() || 0}</p>
                    </div>
                    <Eye className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Upvotes</p>
                      <p className="text-2xl font-bold">{adminStats?.totalUpvotes?.toLocaleString() || 0}</p>
                    </div>
                    <ThumbsUp className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="font-medium">New tool submitted</p>
                      <p className="text-sm text-muted-foreground">ChatGPT submitted by user@example.com</p>
                    </div>
                    <Badge variant="secondary">2 mins ago</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1">
                      <p className="font-medium">Tool approved</p>
                      <p className="text-sm text-muted-foreground">DALL-E 3 has been approved and published</p>
                    </div>
                    <Badge variant="secondary">1 hour ago</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools Management Tab */}
          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Tools Management</CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tool
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search tools..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tools Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tool</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stats</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tools?.map((tool: Tool) => (
                        <TableRow key={tool.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-sm">
                                  {tool.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{tool.name}</div>
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {tool.shortDescription}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {tool.category?.name || "Uncategorized"}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(tool.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {tool.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {tool.upvotes}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {tool.rating}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={tool.featured}
                              onCheckedChange={(checked) => 
                                updateToolMutation.mutate({ 
                                  id: tool.id, 
                                  updates: { featured: checked }
                                })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(tool.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToolEdit(tool)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Select
                                value={tool.status}
                                onValueChange={(status) => handleStatusChange(tool.id, status)}
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
                                onClick={() => handleDeleteTool(tool.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs placeholders */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reviews Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Review management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>User management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Settings interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Tool Dialog */}
        <ToolEditDialog
          tool={selectedTool}
          categories={categories}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleToolUpdate}
          isLoading={updateToolMutation.isPending}
        />
      </div>
    </Layout>
  );
}

// Tool Edit Dialog Component
interface ToolEditDialogProps {
  tool: Tool | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<Tool>) => void;
  isLoading: boolean;
}

function ToolEditDialog({ tool, categories, open, onOpenChange, onSave, isLoading }: ToolEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Tool>>({});

  // Initialize form data when tool changes
  React.useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name,
        shortDescription: tool.shortDescription,
        description: tool.description,
        url: tool.url,
        logoUrl: tool.logoUrl,
        pricingType: tool.pricingType,
        pricingDetails: tool.pricingDetails,
        categoryId: tool.categoryId,
        featured: tool.featured,
        gallery: tool.gallery,
        socialLinks: tool.socialLinks,
        faqs: tool.faqs,
        prosAndCons: tool.prosAndCons,
      });
    }
  }, [tool]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!tool) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Tool: {tool.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tool Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.categoryId || ""} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricingType">Pricing Type</Label>
                  <Select 
                    value={formData.pricingType || ""} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, pricingType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="freemium">Freemium</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="free_trial">Free Trial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="featured"
                    checked={formData.featured || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">Featured Tool</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div>
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="pricingDetails">Pricing Details</Label>
                <Textarea
                  id="pricingDetails"
                  value={formData.pricingDetails || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricingDetails: e.target.value }))}
                  rows={3}
                  placeholder="Detailed pricing information..."
                />
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="gallery">Gallery URLs (one per line)</Label>
                <Textarea
                  id="gallery"
                  value={formData.gallery?.join('\n') || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    gallery: e.target.value.split('\n').filter(url => url.trim()) 
                  }))}
                  rows={4}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                />
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div>
                <Label htmlFor="socialLinks">Social Links (JSON)</Label>
                <Textarea
                  id="socialLinks"
                  value={JSON.stringify(formData.socialLinks || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData(prev => ({ ...prev, socialLinks: parsed }));
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={4}
                  placeholder='{"twitter": "https://twitter.com/...", "github": "https://github.com/..."}'
                />
              </div>

              <div>
                <Label htmlFor="faqs">FAQs (JSON)</Label>
                <Textarea
                  id="faqs"
                  value={JSON.stringify(formData.faqs || [], null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData(prev => ({ ...prev, faqs: parsed }));
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={6}
                  placeholder='[{"question": "Question?", "answer": "Answer..."}]'
                />
              </div>

              <div>
                <Label htmlFor="prosAndCons">Pros & Cons (JSON)</Label>
                <Textarea
                  id="prosAndCons"
                  value={JSON.stringify(formData.prosAndCons || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData(prev => ({ ...prev, prosAndCons: parsed }));
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={6}
                  placeholder='{"pros": ["Pro 1", "Pro 2"], "cons": ["Con 1", "Con 2"]}'
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}