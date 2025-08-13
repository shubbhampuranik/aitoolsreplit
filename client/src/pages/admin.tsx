import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3, Users, Wrench, MessageSquare, Settings, Plus, Search, Eye, 
  ThumbsUp, Star, Edit, Trash2, BookOpen, Briefcase, Newspaper,
  Filter, CheckCircle, XCircle, Clock, AlertTriangle, MoreHorizontal,
  FileText, List, Image, Scale, ArrowRight, HelpCircle, ChevronDown,
  ChevronRight, Home, Tag, FolderOpen, Save, Upload, ArrowLeft
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
  features?: string[];
  alternatives?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  slug: string;
  toolCount: number;
}

type AdminView = 'dashboard' | 'tools-list' | 'tools-add' | 'tools-categories' | 'tool-edit' | 'prompts-list' | 'courses-list' | 'jobs-list' | 'news-list' | 'users-list' | 'reviews-list' | 'settings';

export default function AdminPage() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['tools']));
  
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-96">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Please log in to access the admin panel</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const toggleMenu = (menu: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menu)) {
      newExpanded.delete(menu);
    } else {
      newExpanded.add(menu);
    }
    setExpandedMenus(newExpanded);
  };

  const handleToolEdit = (tool: Tool) => {
    setSelectedTool(tool);
    setCurrentView('tool-edit');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 flex">
        {/* WordPress-style Sidebar */}
        <div className="w-64 bg-gray-800 text-white flex-shrink-0">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
          </div>
          
          <nav className="p-2">
            {/* Dashboard */}
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left hover:bg-gray-700 ${
                currentView === 'dashboard' ? 'bg-blue-600' : ''
              }`}
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>

            {/* Tools Section */}
            <div className="mt-4">
              <button
                onClick={() => toggleMenu('tools')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded text-left hover:bg-gray-700"
              >
                {expandedMenus.has('tools') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <Wrench className="w-4 h-4" />
                Tools
              </button>
              
              {expandedMenus.has('tools') && (
                <div className="ml-6 mt-1 space-y-1">
                  <button
                    onClick={() => setCurrentView('tools-list')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left hover:bg-gray-700 text-sm ${
                      currentView === 'tools-list' ? 'bg-blue-600' : ''
                    }`}
                  >
                    <List className="w-3 h-3" />
                    All Tools
                  </button>
                  <button
                    onClick={() => setCurrentView('tools-add')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left hover:bg-gray-700 text-sm ${
                      currentView === 'tools-add' ? 'bg-blue-600' : ''
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    Add New Tool
                  </button>
                  <button
                    onClick={() => setCurrentView('tools-categories')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left hover:bg-gray-700 text-sm ${
                      currentView === 'tools-categories' ? 'bg-blue-600' : ''
                    }`}
                  >
                    <Tag className="w-3 h-3" />
                    Categories
                  </button>
                </div>
              )}
            </div>

            {/* Other sections */}
            <button
              onClick={() => setCurrentView('prompts-list')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left hover:bg-gray-700 mt-2 ${
                currentView === 'prompts-list' ? 'bg-blue-600' : ''
              }`}
            >
              <FileText className="w-4 h-4" />
              Prompts
            </button>

            <button
              onClick={() => setCurrentView('courses-list')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left hover:bg-gray-700 mt-1 ${
                currentView === 'courses-list' ? 'bg-blue-600' : ''
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Courses
            </button>

            <button
              onClick={() => setCurrentView('jobs-list')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left hover:bg-gray-700 mt-1 ${
                currentView === 'jobs-list' ? 'bg-blue-600' : ''
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Jobs
            </button>

            <button
              onClick={() => setCurrentView('news-list')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left hover:bg-gray-700 mt-1 ${
                currentView === 'news-list' ? 'bg-blue-600' : ''
              }`}
            >
              <Newspaper className="w-4 h-4" />
              News
            </button>

            <button
              onClick={() => setCurrentView('users-list')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left hover:bg-gray-700 mt-1 ${
                currentView === 'users-list' ? 'bg-blue-600' : ''
              }`}
            >
              <Users className="w-4 h-4" />
              Users
            </button>

            <button
              onClick={() => setCurrentView('reviews-list')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left hover:bg-gray-700 mt-1 ${
                currentView === 'reviews-list' ? 'bg-blue-600' : ''
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Reviews
            </button>

            <button
              onClick={() => setCurrentView('settings')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left hover:bg-gray-700 mt-1 ${
                currentView === 'settings' ? 'bg-blue-600' : ''
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">
                {currentView === 'dashboard' && 'Dashboard'}
                {currentView === 'tools-list' && 'All Tools'}
                {currentView === 'tools-add' && 'Add New Tool'}
                {currentView === 'tools-categories' && 'Tool Categories'}
                {currentView === 'tool-edit' && `Edit Tool: ${selectedTool?.name}`}
                {currentView === 'prompts-list' && 'Prompts'}
                {currentView === 'courses-list' && 'Courses'}
                {currentView === 'jobs-list' && 'Jobs'}
                {currentView === 'news-list' && 'News'}
                {currentView === 'users-list' && 'Users'}
                {currentView === 'reviews-list' && 'Reviews'}
                {currentView === 'settings' && 'Settings'}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Welcome back, {user.email}</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 bg-white overflow-auto">
            {currentView === 'dashboard' && <AdminOverview />}
            {currentView === 'tools-list' && <ToolsList onEditTool={handleToolEdit} />}
            {currentView === 'tools-add' && <AddNewTool />}
            {currentView === 'tools-categories' && <ToolCategories />}
            {currentView === 'tool-edit' && selectedTool && <ToolEditor tool={selectedTool} onBack={() => setCurrentView('tools-list')} />}
            {currentView === 'prompts-list' && <PromptsManagement />}
            {currentView === 'courses-list' && <CoursesManagement />}
            {currentView === 'jobs-list' && <JobsManagement />}
            {currentView === 'news-list' && <NewsManagement />}
            {currentView === 'users-list' && <UsersManagement />}
            {currentView === 'reviews-list' && <ReviewsManagement />}
            {currentView === 'settings' && <SettingsManagement />}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Dashboard Overview Component
function AdminOverview() {
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/stats");
      return await response.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tools</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalTools || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingReviews || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalReviews || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Recent activity will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Tools List Component (previously AIToolsManagement)
function ToolsList({ onEditTool }: { onEditTool: (tool: Tool) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ["/api/admin/tools", searchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      
      const response = await apiRequest("GET", `/api/admin/tools?${params}`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tools..."
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
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tools Table */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Loading tools...</p>
          </CardContent>
        </Card>
      ) : tools.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tools found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">Tool</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Rating</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tools.map((tool: any) => (
                    <tr key={tool.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={tool.logoUrl || "/api/placeholder/40/40"}
                            alt={tool.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium">{tool.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {tool.shortDescription}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{tool.category?.name || "Uncategorized"}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={tool.status === "approved" ? "default" : 
                                  tool.status === "pending" ? "secondary" : "destructive"}
                        >
                          {tool.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>{parseFloat(tool.rating || "0").toFixed(1)}</span>
                          <span className="text-gray-400">({tool.ratingCount || 0})</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Button 
                          onClick={() => onEditTool(tool)}
                          variant="outline" 
                          size="sm"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// WordPress-style Tool Editor
function ToolEditor({ tool, onBack }: { tool: Tool; onBack: () => void }) {
  const [formData, setFormData] = useState({
    name: tool.name || "",
    shortDescription: tool.shortDescription || "",
    description: tool.description || "",
    url: tool.url || "",
    logoUrl: tool.logoUrl || "",
    pricingType: tool.pricingType || "free",
    pricingDetails: tool.pricingDetails || "",
    categoryId: tool.categoryId || "",
    features: tool.features || [],
    prosAndCons: tool.prosAndCons || { pros: [], cons: [] },
    faqs: tool.faqs || [],
    alternatives: tool.alternatives || [],
    status: tool.status || "pending",
    featured: tool.featured || false
  });

  const { toast } = useToast();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/categories");
      return await response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/admin/tools/${tool.id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Tool updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
    },
    onError: () => {
      toast({ title: "Error updating tool", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button onClick={onBack} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tools
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Tool Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 min-h-32"
                  />
                </div>
                
                <div>
                  <Label htmlFor="url">Tool URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pricingType">Pricing Type</Label>
                  <Select value={formData.pricingType} onValueChange={(value) => setFormData({ ...formData, pricingType: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="freemium">Freemium</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="pricingDetails">Pricing Details</Label>
                  <Textarea
                    id="pricingDetails"
                    value={formData.pricingDetails}
                    onChange={(e) => setFormData({ ...formData, pricingDetails: e.target.value })}
                    className="mt-1"
                    placeholder="Detailed pricing information..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Publish Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="featured">Featured Tool</Label>
                </div>

                <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? "Updating..." : "Update Tool"}
                </Button>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: Category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Tool Image */}
            <Card>
              <CardHeader>
                <CardTitle>Tool Image</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.logoUrl && (
                  <div className="mb-4">
                    <img
                      src={formData.logoUrl}
                      alt="Tool logo"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

// Placeholder components for other views
function AddNewTool() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Add New Tool form will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ToolCategories() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Categories management will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Use existing components for other views
function PromptsManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Prompts management interface coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}

function CoursesManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Courses management interface coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}

function JobsManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Jobs management interface coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}

function NewsManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">News management interface coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Users management interface coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewsManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Reviews management interface coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Settings management interface coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}