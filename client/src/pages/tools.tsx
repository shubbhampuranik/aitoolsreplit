import { useState } from "react";
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [pricingFilter, setPricingFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: tools, isLoading } = useQuery<Tool[]>({
    queryKey: ["/api/tools"],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '50');
      
      const response = await fetch(`/api/tools?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch tools');
      return response.json();
    },
  });

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

  const filteredTools = tools?.filter(tool => {
    if (pricingFilter && tool.pricingType !== pricingFilter) return false;
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold mb-3">Categories</h3>
                  <div className="space-y-2">
                    <Button
                      variant={selectedCategory === '' ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory('')}
                    >
                      All Categories
                    </Button>
                    {categories?.slice(0, 8).map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'ghost'}
                        size="sm"
                        className="w-full justify-between"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.toolCount}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h3 className="font-semibold mb-3">Pricing</h3>
                  <Select value={pricingFilter} onValueChange={setPricingFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All pricing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All pricing</SelectItem>
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
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {sortedTools?.length || 0} tools found
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
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
                        Rating
                      </div>
                    </SelectItem>
                    <SelectItem value="name">A-Z</SelectItem>
                  </SelectContent>
                </Select>
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
                  : "space-y-4"
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
                    setPricingFilter('');
                    setSearchQuery('');
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Load More */}
            {sortedTools && sortedTools.length >= 50 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  Load More Tools
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
