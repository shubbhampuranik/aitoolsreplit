import { useState } from "react";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import PromptCard from "@/components/PromptCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Grid3X3, List, Filter, Plus, TrendingUp, Star, Clock, DollarSign, Zap } from "lucide-react";

interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  price: string;
  isFree: boolean;
  upvotes: number;
  views: number;
  downloads: number;
  featured?: boolean;
  categoryId?: string;
  outputExamples?: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

export default function Prompts() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [priceFilter, setPriceFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: prompts, isLoading } = useQuery<Prompt[]>({
    queryKey: ["/api/prompts", selectedCategory, searchQuery, priceFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (priceFilter === 'free') params.append('isFree', 'true');
      if (priceFilter === 'paid') params.append('isFree', 'false');
      params.append('limit', '50');
      
      const response = await fetch(`/api/prompts?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch prompts');
      return response.json();
    },
  });

  const { data: featuredPrompts } = useQuery<Prompt[]>({
    queryKey: ["/api/prompts", "featured"],
    queryFn: async () => {
      const response = await fetch('/api/prompts?featured=true&limit=3', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch featured prompts');
      return response.json();
    },
  });

  const filteredPrompts = prompts?.filter(prompt => {
    if (selectedType && prompt.type !== selectedType) return false;
    return true;
  });

  const sortedPrompts = filteredPrompts?.sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.upvotes - a.upvotes;
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'downloads':
        return b.downloads - a.downloads;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const promptTypes = [
    { value: 'chatgpt', label: 'ChatGPT', emoji: '🤖' },
    { value: 'midjourney', label: 'Midjourney', emoji: '🎨' },
    { value: 'claude', label: 'Claude', emoji: '🧠' },
    { value: 'gemini', label: 'Gemini', emoji: '💎' },
    { value: 'other', label: 'Other', emoji: '✨' },
  ];

  return (
    <Layout>
      {/* Header */}
      <section className="hero-gradient py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              AI Prompts Marketplace
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover and share {prompts?.length || 15000}+ high-quality prompts for ChatGPT, Midjourney, Claude and more
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar 
              placeholder="Search prompts..." 
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Submit New Prompt
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Quality tested</span>
              <span>•</span>
              <span>Community curated</span>
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
                {/* Prompt Types */}
                <div>
                  <h3 className="font-semibold mb-3">Prompt Types</h3>
                  <div className="space-y-2">
                    <Button
                      variant={selectedType === '' ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedType('')}
                    >
                      All Types
                    </Button>
                    {promptTypes.map((type) => (
                      <Button
                        key={type.value}
                        variant={selectedType === type.value ? 'default' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedType(type.value)}
                      >
                        <span className="mr-2">{type.emoji}</span>
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

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
                    {categories?.slice(0, 6).map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h3 className="font-semibold mb-3">Pricing</h3>
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All pricing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All pricing</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Featured Prompts */}
                {featuredPrompts && featuredPrompts.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      Featured
                    </h3>
                    <div className="space-y-3">
                      {featuredPrompts.slice(0, 3).map((prompt) => (
                        <div key={prompt.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded flex items-center justify-center flex-shrink-0 text-lg">
                              {promptTypes.find(t => t.value === prompt.type)?.emoji || '✨'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm truncate">{prompt.title}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">{prompt.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {prompt.type.toUpperCase()}
                                </Badge>
                                {prompt.isFree ? (
                                  <Badge variant="default" className="text-xs">Free</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    ${parseFloat(prompt.price).toFixed(2)}
                                  </Badge>
                                )}
                              </div>
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
            {/* Tabs for Free vs Premium */}
            <Tabs defaultValue="all" className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  All Prompts
                </TabsTrigger>
                <TabsTrigger value="free" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Free
                </TabsTrigger>
                <TabsTrigger value="premium" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Premium
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {sortedPrompts?.length || 0} prompts found
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
                        <SelectItem value="downloads">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Downloads
                          </div>
                        </SelectItem>
                        <SelectItem value="title">A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Prompts Grid/List */}
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
                ) : sortedPrompts && sortedPrompts.length > 0 ? (
                  <div className={
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }>
                    {sortedPrompts.map((prompt) => (
                      <PromptCard 
                        key={prompt.id} 
                        prompt={prompt} 
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
                      <h3 className="text-lg font-semibold mb-2">No prompts found</h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your filters or search terms
                      </p>
                      <Button variant="outline" onClick={() => {
                        setSelectedCategory('');
                        setSelectedType('');
                        setPriceFilter('');
                        setSearchQuery('');
                      }}>
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Load More */}
                {sortedPrompts && sortedPrompts.length >= 50 && (
                  <div className="text-center mt-8">
                    <Button variant="outline" size="lg">
                      Load More Prompts
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="free" className="mt-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">Free Prompts</h3>
                  <p className="text-muted-foreground">
                    Filter will show only free prompts when implemented.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="premium" className="mt-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">Premium Prompts</h3>
                  <p className="text-muted-foreground">
                    Filter will show only premium prompts when implemented.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
