import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import ToolCard from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Grid3X3, List, Filter, Plus, TrendingUp, Star, Clock } from "lucide-react";

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
      {/* Header */}
      <section className="hero-gradient py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              AI Tools Directory
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover and explore {tools?.length || 25000}+ AI tools to supercharge your productivity
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar 
              placeholder="Search AI tools..." 
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Submit New Tool
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Updated daily</span>
              <span>•</span>
              <span>Community verified</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-4">
            {/* Sort & Filter Controls */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Popular
                    </div>
                  </SelectItem>
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Newest
                    </div>
                  </SelectItem>
                  <SelectItem value="rating">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Top Rated
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Categories */}
                <div>
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-1">
                    <Button
                      variant={selectedCategory === '' ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start h-8"
                      onClick={() => {
                        setSelectedCategory('');
                        resetPagination();
                      }}
                    >
                      All Categories
                    </Button>
                    {categories?.slice(0, 8).map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'ghost'}
                        size="sm"
                        className="w-full justify-start h-8"
                        onClick={() => {
                          setSelectedCategory(category.id);
                          resetPagination();
                        }}
                      >
                        <span className="truncate">{category.name}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {category.toolCount}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h4 className="font-medium mb-3">Pricing</h4>
                  <Select value={pricingFilter} onValueChange={(value) => {
                    setPricingFilter(value);
                    resetPagination();
                  }}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="All pricing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All pricing</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="freemium">Freemium</SelectItem>
                      <SelectItem value="free_trial">Free Trial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Featured Tools */}
                {featuredTools && featuredTools.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      Featured
                    </h3>
                    <div className="space-y-3">
                      {featuredTools.slice(0, 3).map((tool) => (
                        <div key={tool.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-semibold">
                                {tool.name.charAt(0)}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm truncate">{tool.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">{tool.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedCategory ? categories?.find(c => c.id === selectedCategory)?.name || 'Tools' : 'All Tools'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {sortedTools?.length || 0} tools found
                </p>
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
        </div>
      </div>
    </Layout>
  );
}
