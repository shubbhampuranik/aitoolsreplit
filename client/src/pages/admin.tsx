import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BarChart3, Users, Wrench, MessageSquare, Settings, Plus, Search, Eye, 
  ThumbsUp, Star, Edit, Trash2, BookOpen, Briefcase, Newspaper,
  Filter, CheckCircle, XCircle, Clock, AlertTriangle, MoreHorizontal,
  FileText, List, Image, Scale, ArrowRight, HelpCircle, ChevronDown,
  ChevronRight, Home, Tag, FolderOpen, Save, Upload, ArrowLeft, Pencil,
  Layers, ThumbsDown, Users2, MessageCircle, Minus, X, Bot, RotateCcw
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
  const [fetchingData, setFetchingData] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [showAiPreview, setShowAiPreview] = useState(false);
  const [currentUpdateFormData, setCurrentUpdateFormData] = useState<any>(null);
  const { toast } = useToast();
  
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

  const handleFetchAIData = async (url: string) => {
    if (!url) {
      toast({ title: "Error", description: "Please enter a URL", variant: "destructive" });
      return;
    }

    setFetchingData(true);
    try {
      const response = await apiRequest('POST', `/api/tools/fetch-data`, { url });
      const data = await response.json();
      console.log('Frontend received parsed data:', data);
      
      // Check if response has success property and data
      if (data && data.success && data.data) {
        setAiAnalysisResult(data);
        setShowAiPreview(true);
        toast({
          title: "AI Analysis Complete",
          description: `Successfully analyzed ${data.data.name}. Review the data before applying.`
        });
      } else {
        console.error('Response validation failed:', data);
        throw new Error(data?.error || data?.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('AI fetch error:', error);
      toast({
        title: "AI Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze the website",
        variant: "destructive"
      });
    } finally {
      setFetchingData(false);
    }
  };

  const applyAIData = async () => {
    console.log('Apply and Save AI Data called');
    
    if (!aiAnalysisResult?.data) {
      console.log('No AI analysis data available');
      return;
    }

    const data = aiAnalysisResult.data;
    
    // If we're in the tool editor, apply data directly to form
    if (currentUpdateFormData) {
      const updateFormData = currentUpdateFormData;
      
      // Apply the AI-generated data using updateFormData function
      updateFormData('name', data.name);
      updateFormData('description', data.description);
      updateFormData('shortDescription', data.shortDescription);
      updateFormData('pricingType', data.pricingType);
      updateFormData('pricingDetails', data.pricingDetails || '');
      
      if (data.logoUrl) {
        updateFormData('logoUrl', data.logoUrl);
      }
      
      if (data.screenshots && data.screenshots.length > 0) {
        updateFormData('gallery', data.screenshots);
      }

      // Handle features
      if (data.features && data.features.length > 0) {
        updateFormData('features', data.features);
      }

      // Handle pros and cons
      if (data.pros && data.cons) {
        updateFormData('prosAndCons', {
          pros: data.pros,
          cons: data.cons
        });
      }

      setShowAiPreview(false);
      setAiAnalysisResult(null);
      
      toast({
        title: "Data Applied",
        description: "AI-generated data has been applied to the form. Review and save when ready."
      });
    } else {
      // If not in tool editor, create a new tool directly with AI data
      try {
        // Get categories for mapping
        const categoriesResponse = await apiRequest('GET', '/api/categories');
        const categories = await categoriesResponse.json();
        
        // Find matching category
        const category = categories.find((cat: any) => 
          cat.name.toLowerCase() === data.category.toLowerCase()
        );
        
        // Prepare tool data for creation
        let toolUrl = '';
        console.log('webContentPreview:', aiAnalysisResult.webContentPreview);
        
        try {
          if (aiAnalysisResult.webContentPreview) {
            toolUrl = new URL(aiAnalysisResult.webContentPreview).origin;
          }
        } catch (e) {
          console.log('URL parsing failed, using fallback');
          // If URL parsing fails, use a default URL based on the tool name
          toolUrl = `https://${data.name.toLowerCase().replace(/\s+/g, '')}.com`;
        }
        
        const newToolData = {
          name: data.name,
          description: data.description,
          shortDescription: data.shortDescription,
          url: toolUrl,
          categoryId: category?.id || categories[0]?.id,
          pricingType: data.pricingType,
          pricingDetails: data.pricingDetails || null,
          logoUrl: data.logoUrl || null,
          gallery: data.screenshots || [],
          features: data.features || [],
          prosAndCons: {
            pros: data.pros || [],
            cons: data.cons || []
          },
          tags: data.tags || [],
          targetAudience: data.targetAudience || null,
          useCases: data.useCases || [],
          status: 'approved',
          aiGenerated: true,
          aiConfidenceScore: data.confidenceScore?.toString() || '0.80'
        };

        // Create the tool
        console.log('Sending tool data:', newToolData);
        const response = await apiRequest('POST', '/api/tools', newToolData);
        const result = await response.json();
        
        setShowAiPreview(false);
        setAiAnalysisResult(null);
        
        // Refresh the tools list
        queryClient.invalidateQueries({ queryKey: ['/api/admin/tools'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
        
        toast({
          title: "Tool Created Successfully",
          description: `${data.name} has been created and added to the platform with AI-generated content.`
        });
        
      } catch (error) {
        console.error('Error creating tool:', error);
        toast({
          title: "Creation Failed",
          description: "Failed to create the tool. Please try again.",
          variant: "destructive"
        });
      }
    }
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
                <span className="text-sm text-gray-500">Welcome back, {user?.email || 'Admin'}</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 bg-white overflow-auto">
            {currentView === 'dashboard' && <AdminOverview />}
            {currentView === 'tools-list' && <ToolsList onEditTool={handleToolEdit} />}
            {currentView === 'tools-add' && <AddNewTool />}
            {currentView === 'tools-categories' && <ToolCategories />}
            {currentView === 'tool-edit' && selectedTool && <ToolEditor tool={selectedTool} onBack={() => setCurrentView('tools-list')} onSetUpdateFormData={setCurrentUpdateFormData} fetchingData={fetchingData} onFetchAIData={handleFetchAIData} />}
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

      {/* AI Analysis Preview Dialog */}
      <Dialog open={showAiPreview} onOpenChange={setShowAiPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              AI Analysis Preview
            </DialogTitle>
          </DialogHeader>
          
          {aiAnalysisResult && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span>Confidence Score:</span>
                    <Badge variant="outline">{Math.round((aiAnalysisResult.data.confidenceScore || 0) * 100)}%</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Review the generated data. "Apply & Save" will create/update the tool immediately.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowAiPreview(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => applyAIData()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Apply & Save Tool
                  </Button>
                </div>
              </div>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Tool Name</Label>
                    <p className="mt-1 p-2 bg-gray-50 rounded border">{aiAnalysisResult.data.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Short Description</Label>
                    <p className="mt-1 p-2 bg-gray-50 rounded border">{aiAnalysisResult.data.shortDescription}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Full Description</Label>
                    <p className="mt-1 p-2 bg-gray-50 rounded border whitespace-pre-wrap">{aiAnalysisResult.data.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Pricing Type</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded border">{aiAnalysisResult.data.pricingType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Pricing Details</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded border">{aiAnalysisResult.data.pricingDetails || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              {aiAnalysisResult.data.features && aiAnalysisResult.data.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {aiAnalysisResult.data.features.map((feature: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded border">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="font-medium">{feature.title}</span>
                          </div>
                          <p className="text-sm text-gray-600 ml-4">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pros and Cons */}
              {(aiAnalysisResult.data.pros || aiAnalysisResult.data.cons) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pros & Cons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {aiAnalysisResult.data.pros && (
                        <div>
                          <h4 className="font-medium text-green-600 mb-3">Pros</h4>
                          <div className="space-y-2">
                            {aiAnalysisResult.data.pros.map((pro: string, index: number) => (
                              <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded border">
                                <ThumbsUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{pro}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {aiAnalysisResult.data.cons && (
                        <div>
                          <h4 className="font-medium text-red-600 mb-3">Cons</h4>
                          <div className="space-y-2">
                            {aiAnalysisResult.data.cons.map((con: string, index: number) => (
                              <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded border">
                                <ThumbsDown className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{con}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Images */}
              {(aiAnalysisResult.data.logoUrl || (aiAnalysisResult.data.screenshots && aiAnalysisResult.data.screenshots.length > 0)) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {aiAnalysisResult.data.logoUrl && (
                      <div>
                        <Label className="text-sm font-medium">Logo</Label>
                        <div className="mt-2 p-4 border rounded">
                          <img 
                            src={aiAnalysisResult.data.logoUrl} 
                            alt="Logo"
                            className="w-16 h-16 object-contain rounded"
                          />
                        </div>
                      </div>
                    )}
                    {aiAnalysisResult.data.screenshots && aiAnalysisResult.data.screenshots.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Screenshots ({aiAnalysisResult.data.screenshots.length})</Label>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                          {aiAnalysisResult.data.screenshots.slice(0, 6).map((screenshot: string, index: number) => (
                            <div key={index} className="border rounded p-2">
                              <img 
                                src={screenshot} 
                                alt={`Screenshot ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
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

// Comprehensive Tool Editor with Tabbed Interface
function ToolEditor({ tool, onBack, onSetUpdateFormData, fetchingData, onFetchAIData }: { tool: Tool; onBack: () => void; onSetUpdateFormData: (fn: any) => void; fetchingData: boolean; onFetchAIData: (url: string) => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({
    // Overview fields
    name: tool.name || "",
    shortDescription: tool.shortDescription || "",
    description: tool.description || "",
    url: tool.url || "",
    logoUrl: tool.logoUrl || "",
    pricingType: tool.pricingType || "freemium",
    pricingDetails: tool.pricingDetails || "",
    categoryId: tool.categoryId || "",
    status: tool.status || "pending",
    featured: tool.featured || false,
    
    // Features
    features: tool.features || [],
    
    // Gallery
    gallery: tool.gallery || [],
    
    // Pros and Cons
    prosAndCons: tool.prosAndCons || { pros: [], cons: [] },
    
    // Alternatives
    alternatives: tool.alternatives || [],
    
    // Q&A
    faqs: tool.faqs || [],
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await apiRequest("PUT", `/api/admin/tools/${tool.id}`, formData);
      
      if (response.ok) {
        toast({ title: "Tool updated successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
      } else {
        throw new Error("Failed to update tool");
      }
    } catch (error) {
      toast({ 
        title: "Error updating tool", 
        description: "Please try again",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Set the updateFormData function reference for AI data application
  useEffect(() => {
    // Use setTimeout to defer the state update until after render
    const timer = setTimeout(() => {
      onSetUpdateFormData(updateFormData);
    }, 0);
    
    return () => {
      clearTimeout(timer);
      onSetUpdateFormData(null);
    };
  }, [onSetUpdateFormData]);

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={onBack} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tools
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Tool: {tool.name}</h1>
            <p className="text-gray-600">Manage all aspects of this tool</p>
          </div>
          <Button onClick={handleSubmit} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="pros-cons" className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Pros & Cons
          </TabsTrigger>
          <TabsTrigger value="alternatives" className="flex items-center gap-2">
            <Users2 className="w-4 h-4" />
            Alternatives
          </TabsTrigger>
          <TabsTrigger value="qa" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Q&A
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <OverviewTab 
            formData={formData} 
            updateFormData={updateFormData} 
            categories={categories} 
            fetchingData={fetchingData}
            onFetchAIData={onFetchAIData}
          />
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features">
          <FeaturesTab 
            features={formData.features} 
            updateFeatures={(features) => updateFormData('features', features)} 
          />
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery">
          <GalleryTab 
            gallery={formData.gallery} 
            updateGallery={(gallery) => updateFormData('gallery', gallery)} 
          />
        </TabsContent>

        {/* Pros & Cons Tab */}
        <TabsContent value="pros-cons">
          <ProsConsTab 
            prosAndCons={formData.prosAndCons} 
            updateProsAndCons={(prosAndCons) => updateFormData('prosAndCons', prosAndCons)} 
          />
        </TabsContent>

        {/* Alternatives Tab */}
        <TabsContent value="alternatives">
          <AlternativesTab toolId={tool.id} />
        </TabsContent>

        {/* Q&A Tab */}
        <TabsContent value="qa">
          <QATab 
            faqs={formData.faqs} 
            updateFaqs={(faqs) => updateFormData('faqs', faqs)} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ formData, updateFormData, categories, fetchingData, onFetchAIData }: any) {
  return (
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
                onChange={(e) => updateFormData('name', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => updateFormData('shortDescription', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                className="mt-1 min-h-32"
              />
            </div>
            
            <div>
              <Label htmlFor="url">Tool URL</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => updateFormData('url', e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => onFetchAIData(formData.url)}
                  disabled={fetchingData || !formData.url}
                  variant="outline"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Bot className="w-4 h-4" />
                  {fetchingData ? 'Analyzing...' : 'Fetch Data'}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                type="url"
                value={formData.logoUrl}
                onChange={(e) => updateFormData('logoUrl', e.target.value)}
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
              <Select value={formData.pricingType} onValueChange={(value) => updateFormData('pricingType', value)}>
                <SelectTrigger className="mt-1">
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
            
            <div>
              <Label htmlFor="pricingDetails">Pricing Details</Label>
              <Textarea
                id="pricingDetails"
                value={formData.pricingDetails}
                onChange={(e) => updateFormData('pricingDetails', e.target.value)}
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
              <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
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
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.categoryId} onValueChange={(value) => updateFormData('categoryId', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => updateFormData('featured', e.target.checked)}
              />
              <Label htmlFor="featured">Featured Tool</Label>
            </div>
          </CardContent>
        </Card>

        {/* Logo Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Logo Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {formData.logoUrl ? (
              <img 
                src={formData.logoUrl} 
                alt="Tool logo" 
                className="w-24 h-24 rounded-lg object-cover mb-4"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <span className="text-gray-500 text-sm">No logo</span>
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
  );
}

// Features Tab Component
function FeaturesTab({ features, updateFeatures }: { features: any[], updateFeatures: (features: any[]) => void }) {
  const addFeature = () => {
    updateFeatures([...features, { title: "", description: "" }]);
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_: any, i: number) => i !== index);
    updateFeatures(newFeatures);
  };

  const updateFeature = (index: number, field: string, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    updateFeatures(newFeatures);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tool Features</h3>
          <p className="text-sm text-gray-600">Add key features and capabilities of this tool</p>
        </div>
        <Button onClick={addFeature}>
          <Plus className="w-4 h-4 mr-2" />
          Add Feature
        </Button>
      </div>

      {features.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No features added yet</p>
            <Button onClick={addFeature} variant="outline" className="mt-4">
              Add First Feature
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature: any, index: number) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Feature {index + 1}</h4>
                  <Button
                    onClick={() => removeFeature(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label>Feature Title</Label>
                    <Input
                      value={feature.title || ""}
                      onChange={(e) => updateFeature(index, 'title', e.target.value)}
                      placeholder="e.g. Advanced AI Model"
                    />
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={feature.description || ""}
                      onChange={(e) => updateFeature(index, 'description', e.target.value)}
                      placeholder="Describe this feature..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Gallery Tab Component
function GalleryTab({ gallery, updateGallery }: { gallery: any[], updateGallery: (gallery: any[]) => void }) {
  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      updateGallery([...gallery, url]);
    }
  };

  const removeImage = (index: number) => {
    const newGallery = gallery.filter((_: any, i: number) => i !== index);
    updateGallery(newGallery);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Image Gallery</h3>
          <p className="text-sm text-gray-600">Add screenshots and images showcasing the tool</p>
        </div>
        <Button onClick={addImage}>
          <Plus className="w-4 h-4 mr-2" />
          Add Image
        </Button>
      </div>

      {gallery.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No images added yet</p>
            <Button onClick={addImage} variant="outline" className="mt-4">
              Add First Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gallery.map((imageUrl: string, index: number) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      onClick={() => removeImage(index)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 truncate">{imageUrl}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Pros & Cons Tab Component
function ProsConsTab({ prosAndCons, updateProsAndCons }: { prosAndCons: any, updateProsAndCons: (prosAndCons: any) => void }) {
  const addPro = () => {
    const newProsAndCons = {
      ...prosAndCons,
      pros: [...(prosAndCons.pros || []), ""]
    };
    updateProsAndCons(newProsAndCons);
  };

  const addCon = () => {
    const newProsAndCons = {
      ...prosAndCons,
      cons: [...(prosAndCons.cons || []), ""]
    };
    updateProsAndCons(newProsAndCons);
  };

  const updatePro = (index: number, value: string) => {
    const newPros = [...(prosAndCons.pros || [])];
    newPros[index] = value;
    updateProsAndCons({ ...prosAndCons, pros: newPros });
  };

  const updateCon = (index: number, value: string) => {
    const newCons = [...(prosAndCons.cons || [])];
    newCons[index] = value;
    updateProsAndCons({ ...prosAndCons, cons: newCons });
  };

  const removePro = (index: number) => {
    const newPros = (prosAndCons.pros || []).filter((_: any, i: number) => i !== index);
    updateProsAndCons({ ...prosAndCons, pros: newPros });
  };

  const removeCon = (index: number) => {
    const newCons = (prosAndCons.cons || []).filter((_: any, i: number) => i !== index);
    updateProsAndCons({ ...prosAndCons, cons: newCons });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Pros & Cons</h3>
        <p className="text-sm text-gray-600">List the advantages and disadvantages of this tool</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pros Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-green-600">Pros</h4>
            <Button onClick={addPro} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Pro
            </Button>
          </div>
          
          <div className="space-y-3">
            {(prosAndCons.pros || []).map((pro: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                <Input
                  value={pro}
                  onChange={(e) => updatePro(index, e.target.value)}
                  placeholder="Enter a pro..."
                  className="flex-1"
                />
                <Button
                  onClick={() => removePro(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            {(!prosAndCons.pros || prosAndCons.pros.length === 0) && (
              <Card>
                <CardContent className="p-6 text-center">
                  <ThumbsUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No pros added yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Cons Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-red-600">Cons</h4>
            <Button onClick={addCon} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Con
            </Button>
          </div>
          
          <div className="space-y-3">
            {(prosAndCons.cons || []).map((con: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <ThumbsDown className="w-4 h-4 text-red-600 flex-shrink-0" />
                <Input
                  value={con}
                  onChange={(e) => updateCon(index, e.target.value)}
                  placeholder="Enter a con..."
                  className="flex-1"
                />
                <Button
                  onClick={() => removeCon(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            {(!prosAndCons.cons || prosAndCons.cons.length === 0) && (
              <Card>
                <CardContent className="p-6 text-center">
                  <ThumbsDown className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No cons added yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Alternatives Tab Component
function AlternativesTab({ toolId }: { toolId: string }) {
  const { data: alternatives = [], refetch } = useQuery<Tool[]>({
    queryKey: ['/api/tools', toolId, 'alternatives'],
    enabled: !!toolId
  });
  
  const { data: suggestedAlternatives = [] } = useQuery<Tool[]>({
    queryKey: ['/api/admin/tools', toolId, 'suggested-alternatives'],
    enabled: !!toolId
  });

  const { data: allTools = [] } = useQuery<Tool[]>({
    queryKey: ['/api/admin/tools'],
    select: (data: Tool[]) => data.filter((tool: Tool) => tool.id !== toolId && tool.status === 'approved')
  });

  const addAlternativeMutation = useMutation({
    mutationFn: async (alternativeId: string) => {
      const response = await fetch(`/api/admin/tools/${toolId}/alternatives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alternativeId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['/api/tools', toolId, 'alternatives'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tools', toolId, 'suggested-alternatives'] });
    },
    onError: (error: any) => {
      // Toast notification will be handled by error boundary
      console.error("Error adding alternative:", error.message);
    }
  });

  const removeAlternativeMutation = useMutation({
    mutationFn: async (alternativeId: string) => {
      return fetch(`/api/admin/tools/${toolId}/alternatives/${alternativeId}`, {
        method: 'DELETE'
      }).then(res => res.json());
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['/api/tools', toolId, 'alternatives'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tools', toolId, 'suggested-alternatives'] });
    }
  });

  const handleAddAlternative = (alternativeId: string) => {
    addAlternativeMutation.mutate(alternativeId);
  };

  const handleRemoveAlternative = (alternativeId: string) => {
    removeAlternativeMutation.mutate(alternativeId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Alternative Tools</h3>
          <p className="text-sm text-gray-600">Manage database-driven alternatives with auto-matching</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {alternatives.length} alternatives
        </Badge>
      </div>

      {/* Auto-Suggested Alternatives */}
      {suggestedAlternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Auto-Suggested Alternatives
            </CardTitle>
            <CardDescription>
              Based on similarity scoring (category, pricing, ratings)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestedAlternatives.map((tool: any) => (
              <div key={tool.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <img 
                    src={tool.logoUrl || '/api/placeholder/40/40'} 
                    alt={tool.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                  <div>
                    <h4 className="font-medium">{tool.name}</h4>
                    <p className="text-sm text-gray-600 mb-1">{tool.shortDescription || tool.description || 'No description available'}</p>
                    <p className="text-xs text-gray-500">{tool.pricingType} • ⭐ {tool.rating}/5 • {tool.upvotes || 0} votes</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleAddAlternative(tool.id)}
                  size="sm"
                  disabled={addAlternativeMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Current Alternatives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Alternatives</CardTitle>
          <CardDescription>
            Active alternatives displayed on the tool page
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alternatives.length === 0 ? (
            <div className="text-center py-8">
              <Users2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No alternatives configured yet</p>
              <p className="text-sm text-gray-500 mt-1">Use auto-suggestions above or manual selection below</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alternatives.map((alternative: any) => (
                <div key={alternative.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <img 
                      src={alternative.logoUrl || '/api/placeholder/40/40'} 
                      alt={alternative.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                    <div>
                      <h4 className="font-medium">{alternative.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">{alternative.shortDescription || alternative.description || 'No description available'}</p>
                      <p className="text-xs text-gray-500">
                        {alternative.pricingType} • ⭐ {alternative.rating}/5 • {alternative.upvotes || 0} upvotes
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRemoveAlternative(alternative.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                    disabled={removeAlternativeMutation.isPending}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Manual Alternative</CardTitle>
          <CardDescription>
            Select from all approved tools in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Select onValueChange={handleAddAlternative}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Search and select a tool to add as alternative..." />
                </SelectTrigger>
                <SelectContent>
                  {allTools.map((tool: any) => (
                    <SelectItem 
                      key={tool.id} 
                      value={tool.id}
                      disabled={alternatives.some((alt: any) => alt.id === tool.id)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{tool.name}</span>
                        <span className="text-xs text-gray-500">
                          {(tool.shortDescription || tool.description || '').substring(0, 60)}... • {tool.pricingType}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500">
              Search through {allTools.length} approved tools to add as alternatives
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Q&A Tab Component
function QATab({ faqs, updateFaqs }: { faqs: any[], updateFaqs: (faqs: any[]) => void }) {
  const addFaq = () => {
    updateFaqs([...faqs, { question: "", answer: "" }]);
  };

  const removeFaq = (index: number) => {
    const newFaqs = faqs.filter((_: any, i: number) => i !== index);
    updateFaqs(newFaqs);
  };

  const updateFaq = (index: number, field: string, value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    updateFaqs(newFaqs);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
          <p className="text-sm text-gray-600">Add common questions and answers about this tool</p>
        </div>
        <Button onClick={addFaq}>
          <Plus className="w-4 h-4 mr-2" />
          Add Q&A
        </Button>
      </div>

      {faqs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No Q&A added yet</p>
            <Button onClick={addFaq} variant="outline" className="mt-4">
              Add First Q&A
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq: any, index: number) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Q&A {index + 1}</h4>
                  <Button
                    onClick={() => removeFaq(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Question</Label>
                    <Input
                      value={faq.question || ""}
                      onChange={(e) => updateFaq(index, 'question', e.target.value)}
                      placeholder="What is the question?"
                    />
                  </div>
                  
                  <div>
                    <Label>Answer</Label>
                    <Textarea
                      value={faq.answer || ""}
                      onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                      placeholder="Provide a detailed answer..."
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Placeholder components for other views
function AddNewTool() {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Check for pending AI data on component mount
  useEffect(() => {
    const pendingData = sessionStorage.getItem('pendingAIData');
    if (pendingData && !isInitialized) {
      try {
        const aiData = JSON.parse(pendingData);
        sessionStorage.removeItem('pendingAIData'); // Clean up
        setIsInitialized(true);
        
        toast({
          title: "AI Data Loaded",
          description: `Loaded AI-generated data for ${aiData.name}. You can review and edit before creating the tool.`
        });
      } catch (error) {
        console.error('Error loading AI data:', error);
        sessionStorage.removeItem('pendingAIData');
      }
    }
  }, [isInitialized, toast]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Plus className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Add New AI Tool</h3>
              <p className="text-gray-600">Create a new tool entry for the community platform</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bot className="w-5 h-5 text-blue-600" />
                <h4 className="text-lg font-medium text-blue-900">AI-Powered Tool Creation</h4>
              </div>
              <p className="text-blue-800 mb-4">
                Use our AI analysis feature to automatically generate comprehensive tool data from any website URL.
              </p>
              <div className="space-y-3 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Enter any AI tool website URL</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>AI analyzes and generates descriptions, features, pros/cons</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Review and edit the generated data before publishing</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white rounded border">
                <p className="text-sm text-gray-600 mb-3">
                  <strong>How to use:</strong> Go to any existing tool and click "Fetch Data" to analyze a new tool, or edit an existing tool to generate improved content.
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Refresh to Check for AI Data
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToolCategories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const { toast } = useToast();

  const { data: categories = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/categories"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/categories", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Category created successfully" });
      setIsDialogOpen(false);
      setEditingCategory(null);
      refetch();
    },
    onError: () => {
      toast({ title: "Error creating category", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest("PUT", `/api/admin/categories/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Category updated successfully" });
      setIsDialogOpen(false);
      setEditingCategory(null);
      refetch();
    },
    onError: () => {
      toast({ title: "Error updating category", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/categories/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Category deleted successfully" });
      refetch();
    },
    onError: () => {
      toast({ title: "Error deleting category", variant: "destructive" });
    },
  });

  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color").optional(),
        slug: z.string().optional(),
      })
    ),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
      color: "#2563eb",
      slug: "",
    },
  });

  const filteredCategories = (categories as any[]).filter((category: any) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    form.reset({
      name: category.name || "",
      description: category.description || "",
      icon: category.icon || "",
      color: category.color || "#2563eb",
      slug: category.slug || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      deleteMutation.mutate(categoryId);
    }
  };

  const onSubmit = (data: any) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    form.reset({
      name: "",
      description: "",
      icon: "",
      color: "#2563eb",
      slug: "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Categories</h3>
          <p className="text-sm text-gray-600">Manage tool categories</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No categories found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category: any) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {category.icon && (
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon}
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-sm text-gray-500">
                        {category.toolCount || 0} tools
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {category.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {category.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Slug: {category.slug}</span>
                  {category.createdAt && (
                    <span>
                      Created {new Date(category.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Category name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Category description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon (emoji)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="🤖" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input {...field} type="color" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="auto-generated from name" />
                    </FormControl>
                    <FormDescription>
                      Leave empty to auto-generate from name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    "Saving..."
                  ) : editingCategory ? (
                    "Update Category"
                  ) : (
                    "Create Category"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: reviews = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/reviews", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      const response = await apiRequest("GET", `/api/admin/reviews?${params}`);
      return await response.json();
    },
  });

  const { data: reportedReviews = [] } = useQuery({
    queryKey: ["/api/admin/reported-reviews"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/reported-reviews");
      return await response.json();
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, status, reported, reportReason }: { id: string; status?: string; reported?: boolean; reportReason?: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/reviews/${id}`, { status, reported, reportReason });
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Review updated successfully" });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reported-reviews"] });
    },
    onError: () => {
      toast({ title: "Error updating review", variant: "destructive" });
    },
  });

  const handleApprove = (reviewId: string) => {
    updateReviewMutation.mutate({ id: reviewId, status: "approved" });
  };

  const handleReject = (reviewId: string) => {
    updateReviewMutation.mutate({ id: reviewId, status: "rejected" });
  };

  const handleKeepReported = (reviewId: string) => {
    updateReviewMutation.mutate({ id: reviewId, reported: false, reportReason: "" });
  };

  const handleRemoveReported = (reviewId: string) => {
    updateReviewMutation.mutate({ id: reviewId, status: "rejected", reported: false });
  };

  const filteredReviews = reviews.filter((review: any) =>
    review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.author?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search reviews..."
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
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="reported">Reported</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reported Reviews Section */}
      {reportedReviews.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Reported Reviews ({reportedReviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportedReviews.map((review: any) => (
                <div key={review.id} className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{review.title}</h4>
                      <p className="text-sm text-gray-600">
                        By {review.author?.firstName} {review.author?.lastName} • Tool: {review.tool?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleKeepReported(review.id)}
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Keep
                      </Button>
                      <Button
                        onClick={() => handleRemoveReported(review.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{review.content}</p>
                  {review.reportReason && (
                    <div className="bg-red-100 p-2 rounded text-sm">
                      <strong>Report Reason:</strong> {review.reportReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews Table */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Loading reviews...</p>
          </CardContent>
        </Card>
      ) : filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No reviews found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">Review</th>
                    <th className="p-4 font-medium">Tool</th>
                    <th className="p-4 font-medium">Author</th>
                    <th className="p-4 font-medium">Rating</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review: any) => (
                    <tr key={review.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium line-clamp-1">{review.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2 mt-1">
                            {review.content}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{review.tool?.name || "Unknown"}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {review.author?.firstName} {review.author?.lastName}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>{review.rating}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={
                            review.status === "approved" ? "default" : 
                            review.status === "pending" ? "secondary" : 
                            review.reported ? "destructive" : "destructive"
                          }
                        >
                          {review.reported ? "Reported" : review.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {review.status === "pending" && (
                            <>
                              <Button
                                onClick={() => handleApprove(review.id)}
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleReject(review.id)}
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {review.status !== "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
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