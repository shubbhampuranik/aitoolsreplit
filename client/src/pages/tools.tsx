import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import ToolCard from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Grid3X3, List, Filter, Plus, TrendingUp, Star, Clock, Eye } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  logoUrl?: string;
  pricingType: string;
  rating: string;
  upvotes: number;
  views: number;
  featured: boolean;
  categoryId?: string;
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

export default function Tools() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [pricingFilter, setPricingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [allTools, setAllTools] = useState<Tool[]>([]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: tools, isLoading } = useQuery<Tool[]>({
    queryKey: ["/api/tools", selectedCategory, searchQuery, sortBy, pricingFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy) params.append('sort', sortBy);
      if (pricingFilter && pricingFilter !== 'all') params.append('pricingType', pricingFilter);
      params.append('limit', '24');
      params.append('offset', ((currentPage - 1) * 24).toString());
      
      const response = await fetch(`/api/tools?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch tools');
      return response.json();
    },
  });

  // Handle pagination data accumulation with useEffect
  useEffect(() => {
    if (tools) {
      if (currentPage === 1) {
        setAllTools(tools);
      } else {
        setAllTools(prev => [...prev, ...tools]);
      }
    }
  }, [tools, currentPage]);

  const { data: featuredTools } = useQuery<Tool[]>({
    queryKey: ["/api/tools", "featured"],
    queryFn: async () => {
      const response = await fetch('/api/tools?featured=true&limit=3', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch featured tools');
      return response.json();
    },
  });

  const displayTools = currentPage === 1 ? tools : allTools;

  const filteredTools = displayTools?.filter(tool => {
    if (pricingFilter && pricingFilter !== 'all' && tool.pricingType !== pricingFilter) return false;
    return true;
  });

  const sortedTools = filteredTools?.sort((a, b) => {
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

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  // Reset pagination when filters change
  const resetPagination = () => {
    setCurrentPage(1);
    setAllTools([]);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AI Tools
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover cutting-edge AI tools from productivity to creativity and beyond
          </p>
        </div>

        {/* Featured Tools */}
        {featuredTools && featuredTools.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Featured Tools</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTools.slice(0, 3).map((tool) => (
                <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-lg">
                          {tool.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{tool.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{tool.developer || 'AI Tool'}</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Featured
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {tool.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{tool.upvotes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{tool.views}</span>
                        </div>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        View Tool
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <SearchBar 
                placeholder="Search AI tools..." 
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={(value) => {
                setSelectedCategory(value);
                resetPagination();
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories?.slice(0, 10).map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={pricingFilter} onValueChange={(value) => {
                setPricingFilter(value);
                resetPagination();
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Pricing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All pricing</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="freemium">Freemium</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <Button className="bg-blue-600 hover:bg-blue-700">
                Search
              </Button>

              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-2"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Tools Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-muted rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="h-16 bg-muted rounded mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-8 bg-muted rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedTools && sortedTools.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-6"
          }>
            {sortedTools.map((tool) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No tools found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button variant="outline" onClick={() => {
                setSelectedCategory('');
                setPricingFilter('all');
                setSearchQuery('');
                resetPagination();
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Load More */}
        {sortedTools && tools && tools.length >= 24 && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More Tools"}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
