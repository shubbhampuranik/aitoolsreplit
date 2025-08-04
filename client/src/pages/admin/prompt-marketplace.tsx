import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, DollarSign, Eye, Download, Edit, Trash2, Star } from "lucide-react";

interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  type: "chatgpt" | "midjourney" | "claude" | "gemini" | "other";
  categoryId?: string;
  price: string;
  isFree: boolean;
  outputExamples?: string[];
  submittedBy?: string;
  status: "pending" | "approved" | "rejected";
  upvotes: number;
  views: number;
  downloads: number;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function PromptMarketplace() {
  const { toast } = useToast();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Prompt>>({
    title: "",
    description: "",
    content: "",
    type: "chatgpt",
    price: "0.00",
    isFree: true,
    status: "approved",
    featured: false,
  });

  // Fetch prompts
  const { data: prompts, isLoading: promptsLoading } = useQuery({
    queryKey: ["/api/admin/prompts"],
  });

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Create prompt mutation
  const createPromptMutation = useMutation({
    mutationFn: async (promptData: Partial<Prompt>) => {
      return apiRequest("POST", "/api/admin/prompts", promptData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompts"] });
      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        content: "",
        type: "chatgpt",
        price: "0.00",
        isFree: true,
        status: "approved",
        featured: false,
      });
      toast({
        title: "Success",
        description: "Premium prompt created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create prompt: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update prompt mutation
  const updatePromptMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Prompt> }) => {
      return apiRequest("PATCH", `/api/admin/prompts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompts"] });
      setIsEditDialogOpen(false);
      setSelectedPrompt(null);
      toast({
        title: "Success",
        description: "Prompt updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update prompt: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete prompt mutation
  const deletePromptMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/prompts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompts"] });
      toast({
        title: "Success",
        description: "Prompt deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete prompt: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreatePrompt = async () => {
    createPromptMutation.mutate(formData);
  };

  const handleUpdatePrompt = async () => {
    if (selectedPrompt) {
      updatePromptMutation.mutate({ id: selectedPrompt.id, data: formData });
    }
  };

  const handleEditClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setFormData({
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      type: prompt.type,
      categoryId: prompt.categoryId,
      price: prompt.price,
      isFree: prompt.isFree,
      status: prompt.status,
      featured: prompt.featured,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm("Are you sure you want to delete this prompt?")) {
      deletePromptMutation.mutate(id);
    }
  };

  const formatPrice = (price: string, isFree: boolean) => {
    if (isFree) return "Free";
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "chatgpt": return "bg-green-100 text-green-800";
      case "midjourney": return "bg-purple-100 text-purple-800";
      case "claude": return "bg-orange-100 text-orange-800";
      case "gemini": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prompt Marketplace</h1>
          <p className="text-muted-foreground">
            Manage premium prompts and marketplace transactions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Premium Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Premium Prompt</DialogTitle>
              <DialogDescription>
                Add a new premium prompt to the marketplace
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter prompt title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this prompt does"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Prompt Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the actual prompt content"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">AI Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chatgpt">ChatGPT</SelectItem>
                      <SelectItem value="midjourney">Midjourney</SelectItem>
                      <SelectItem value="claude">Claude</SelectItem>
                      <SelectItem value="gemini">Gemini</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFree"
                    checked={formData.isFree}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })}
                  />
                  <Label htmlFor="isFree">Free prompt</Label>
                </div>

                {!formData.isFree && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured prompt</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePrompt} disabled={createPromptMutation.isPending}>
                {createPromptMutation.isPending ? "Creating..." : "Create Prompt"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Prompts Grid */}
      <div className="grid gap-6">
        {promptsLoading ? (
          <div className="text-center py-8">Loading prompts...</div>
        ) : prompts?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No prompts found. Create your first premium prompt!
          </div>
        ) : (
          <div className="grid gap-4">
            {prompts?.map((prompt: Prompt) => (
              <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{prompt.title}</h3>
                        {prompt.featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {prompt.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getTypeColor(prompt.type)}>
                          {prompt.type}
                        </Badge>
                        <Badge className={getStatusColor(prompt.status)}>
                          {prompt.status}
                        </Badge>
                        <Badge variant="outline" className="font-semibold">
                          {formatPrice(prompt.price, prompt.isFree)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(prompt)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(prompt.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {prompt.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        {prompt.downloads || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {prompt.upvotes || 0} votes
                      </span>
                    </div>
                    <span>
                      {prompt.createdAt && new Date(prompt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>
              Update the prompt details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter prompt title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this prompt does"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Prompt Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter the actual prompt content"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">AI Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chatgpt">ChatGPT</SelectItem>
                    <SelectItem value="midjourney">Midjourney</SelectItem>
                    <SelectItem value="claude">Claude</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isFree"
                  checked={formData.isFree}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })}
                />
                <Label htmlFor="edit-isFree">Free prompt</Label>
              </div>

              {!formData.isFree && (
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="edit-featured">Featured prompt</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePrompt} disabled={updatePromptMutation.isPending}>
              {updatePromptMutation.isPending ? "Updating..." : "Update Prompt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}