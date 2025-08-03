import { useState } from "react";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Grid3X3, List, Filter, Plus, TrendingUp, Star, Clock, Brain, Code, Image, Volume2, Video, Eye } from "lucide-react";
import { Link } from "wouter";

interface Model {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  developer: string;
  modelType: "language" | "image" | "audio" | "video" | "multimodal" | "code";
  accessType: "open_source" | "api" | "closed" | "research";
  parameters?: string;
  url?: string;
  paperUrl?: string;
  demoUrl?: string;
  licenseType?: string;
  pricingDetails?: string;
  capabilities?: string[];
  limitations?: string[];
  categoryId?: string;
  upvotes: number;
  views: number;
  rating: string;
  ratingCount: number;
  featured: boolean;
  releaseDate?: string;
  benchmarkScores?: any;
  createdAt?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  toolCount: number;
  icon?: string;
  color?: string;
}

const modelTypeIcons = {
  language: Brain,
  image: Image,
  audio: Volume2,
  video: Video,
  multimodal: Eye,
  code: Code
};

const accessTypeColors = {
  open_source: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  api: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  research: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
};

function ModelCard({ model }: { model: Model }) {
  const TypeIcon = modelTypeIcons[model.modelType] || Brain;
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <TypeIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <Link href={`/models/${model.id}`} className="hover:underline">
                  {model.name}
                </Link>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">by {model.developer}</p>
            </div>
          </div>
          {model.featured && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {model.shortDescription || model.description}
        </p>
        
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className={accessTypeColors[model.accessType]}>
            {model.accessType.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {model.modelType}
          </Badge>
          {model.parameters && (
            <Badge variant="outline">
              {model.parameters}
            </Badge>
          )}
        </div>

        {model.capabilities && model.capabilities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {model.capabilities.slice(0, 3).map((capability, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                  {capability}
                </span>
              ))}
              {model.capabilities.length > 3 && (
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                  +{model.capabilities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{model.upvotes}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{model.views}</span>
            </div>
            {parseFloat(model.rating) > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{model.rating} ({model.ratingCount})</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {model.demoUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={model.demoUrl} target="_blank" rel="noopener noreferrer">
                  Demo
                </a>
              </Button>
            )}
            {model.url && (
              <Button size="sm" asChild>
                <a href={model.url} target="_blank" rel="noopener noreferrer">
                  View Model
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Models() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [modelTypeFilter, setModelTypeFilter] = useState<string>('');
  const [accessTypeFilter, setAccessTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: models, isLoading } = useQuery<Model[]>({
    queryKey: ["/api/models"],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (modelTypeFilter) params.append('modelType', modelTypeFilter);
      if (accessTypeFilter) params.append('accessType', accessTypeFilter);
      params.append('limit', '50');
      
      const response = await fetch(`/api/models?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch models');
      return response.json();
    },
  });

  const { data: featuredModels } = useQuery<Model[]>({
    queryKey: ["/api/models", "featured"],
    queryFn: async () => {
      const response = await fetch('/api/models?featured=true&limit=3', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch featured models');
      return response.json();
    },
  });

  const filteredModels = models?.filter(model => {
    if (modelTypeFilter && model.modelType !== modelTypeFilter) return false;
    if (accessTypeFilter && model.accessType !== accessTypeFilter) return false;
    return true;
  });

  const sortedModels = filteredModels?.sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.upvotes - a.upvotes;
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'rating':
        return parseFloat(b.rating) - parseFloat(a.rating);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Models
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover cutting-edge AI models from language to vision and beyond
          </p>
        </div>

        {/* Featured Models */}
        {featuredModels && featuredModels.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Featured Models
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredModels.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <SearchBar 
            onSearch={setSearchQuery}
            placeholder="Search AI models..."
          />
          
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={modelTypeFilter} onValueChange={setModelTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Model Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="language">Language</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="multimodal">Multimodal</SelectItem>
                <SelectItem value="code">Code</SelectItem>
              </SelectContent>
            </Select>

            <Select value={accessTypeFilter} onValueChange={setAccessTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Access Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Access</SelectItem>
                <SelectItem value="open_source">Open Source</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="research">Research</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Models Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {sortedModels?.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>

        {(!sortedModels || sortedModels.length === 0) && !isLoading && (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No models found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}