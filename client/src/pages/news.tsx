import { useState } from "react";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { 
  Grid3X3, 
  List, 
  Filter, 
  Plus, 
  TrendingUp, 
  Clock, 
  Eye,
  MessageCircle,
  Share2,
  Bookmark,
  ThumbsUp,
  Calendar,
  User,
  ExternalLink,
  Newspaper,
  Rss
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  slug: string;
  upvotes: number;
  views: number;
  featured?: boolean;
  categoryId?: string;
  authorId?: string;
  publishedAt?: string;
  createdAt?: string;
  author?: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    email?: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

export default function News() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", { 
      categoryId: selectedCategory || undefined,
      search: searchQuery || undefined,
      status: "approved",
      limit: 50 
    }],
  });

  const { data: featuredPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts", { featured: true, limit: 3 }],
  });

  const sortedPosts = posts?.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime();
      case 'popular':
        return b.upvotes - a.upvotes;
      case 'views':
        return b.views - a.views;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const PostCard = ({ post, viewMode }: { post: Post; viewMode: 'grid' | 'list' }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [hasUpvoted, setHasUpvoted] = useState(false);

    const handleBookmark = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsBookmarked(!isBookmarked);
    };

    const handleUpvote = (e: React.MouseEvent) => {
      e.stopPropagation();
      setHasUpvoted(!hasUpvoted);
    };

    const handleReadMore = () => {
      // In a real app, this would navigate to the full post
      console.log('Navigate to post:', post.slug);
    };

    const formatDate = (dateString?: string) => {
      if (!dateString) return 'Unknown date';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const getAuthorName = () => {
      if (post.author?.firstName && post.author?.lastName) {
        return `${post.author.firstName} ${post.author.lastName}`;
      }
      if (post.author?.firstName) {
        return post.author.firstName;
      }
      if (post.author?.email) {
        return post.author.email.split('@')[0];
      }
      return 'Anonymous';
    };

    const getAuthorInitials = () => {
      const name = getAuthorName();
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (viewMode === 'list') {
      return (
        <Card className="tool-card hover:border-primary/20 group cursor-pointer" onClick={handleReadMore}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Cover Image */}
              {post.coverImage && (
                <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                  <img 
                    src={post.coverImage} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-2">{post.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={post.author?.profileImageUrl} />
                        <AvatarFallback className="text-xs">{getAuthorInitials()}</AvatarFallback>
                      </Avatar>
                      <span>{getAuthorName()}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{post.views} views</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="bookmark-btn opacity-0 group-hover:opacity-100 p-2"
                    onClick={handleBookmark}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-primary' : ''}`} />
                  </Button>
                </div>
                
                <p className="text-muted-foreground mb-3 line-clamp-2">
                  {post.excerpt || post.content.substring(0, 200) + '...'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-auto p-0 text-muted-foreground hover:text-primary"
                      onClick={handleUpvote}
                    >
                      <ThumbsUp className={`w-4 h-4 mr-1 ${hasUpvoted ? 'fill-current text-primary' : ''}`} />
                      <span className="text-xs">{post.upvotes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-primary">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      <span className="text-xs">0</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-primary">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {post.featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="tool-card hover:border-primary/20 group cursor-pointer" onClick={handleReadMore}>
        <CardContent className="p-0">
          {/* Cover Image */}
          {post.coverImage && (
            <div className="w-full h-48 bg-muted overflow-hidden rounded-t-lg relative">
              <img 
                src={post.coverImage} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="bookmark-btn opacity-0 group-hover:opacity-100 p-2 bg-background/80 hover:bg-background"
                  onClick={handleBookmark}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-primary' : ''}`} />
                </Button>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="space-y-3">
              {/* Author and Date */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={post.author?.profileImageUrl} />
                  <AvatarFallback className="text-xs">{getAuthorInitials()}</AvatarFallback>
                </Avatar>
                <span>{getAuthorName()}</span>
                <span>•</span>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-foreground text-lg line-clamp-3">{post.title}</h3>
              
              {/* Excerpt */}
              <p className="text-muted-foreground text-sm line-clamp-3">
                {post.excerpt || post.content.substring(0, 150) + '...'}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-primary"
                    onClick={handleUpvote}
                  >
                    <ThumbsUp className={`w-4 h-4 mr-1 ${hasUpvoted ? 'fill-current text-primary' : ''}`} />
                    <span className="text-xs">{post.upvotes}</span>
                  </Button>
                  <div className="flex items-center text-muted-foreground">
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="text-xs">{post.views}</span>
                  </div>
                </div>
                {post.featured && (
                  <Badge variant="secondary" className="tag tag-yellow">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary" className="tag tag-blue">AI News</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      {/* Header */}
      <section className="hero-gradient py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              AI News & Insights
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest {posts?.length || 500}+ articles, trends, and breakthroughs in AI
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar 
              placeholder="Search articles, topics, authors..." 
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Submit Article
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Expert curated</span>
              <span>•</span>
              <span>Updated daily</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
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
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Featured Articles */}
                {featuredPosts && featuredPosts.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Featured
                    </h3>
                    <div className="space-y-3">
                      {featuredPosts.slice(0, 3).map((post) => (
                        <div key={post.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm line-clamp-2">{post.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={post.author?.profileImageUrl} />
                                <AvatarFallback className="text-xs">
                                  {post.author?.firstName?.[0] || 'A'}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {post.author?.firstName || 'Anonymous'}
                              </span>
                              <span>•</span>
                              <span>{new Date(post.publishedAt || post.createdAt || '').toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">Featured</Badge>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Eye className="w-3 h-3 mr-1" />
                                <span>{post.views}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Topics */}
                <div>
                  <h3 className="font-semibold mb-3">Trending Topics</h3>
                  <div className="space-y-2">
                    {['GPT-4', 'Machine Learning', 'Computer Vision', 'NLP', 'Robotics'].map((topic) => (
                      <div key={topic} className="flex items-center justify-between text-sm">
                        <span className="text-foreground cursor-pointer hover:text-primary transition-colors">
                          #{topic}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.floor(Math.random() * 50) + 10}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Newsletter Signup */}
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Rss className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-sm">Stay Updated</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Get the latest AI news delivered to your inbox
                    </p>
                    <Button size="sm" className="w-full">
                      Subscribe
                    </Button>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <Tabs defaultValue="all" className="mb-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  <Newspaper className="w-4 h-4 mr-2" />
                  All News
                </TabsTrigger>
                <TabsTrigger value="trending">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="featured">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Featured
                </TabsTrigger>
                <TabsTrigger value="recent">
                  <Clock className="w-4 h-4 mr-2" />
                  Recent
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {sortedPosts?.length || 0} articles found
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
                        <SelectItem value="newest">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Newest
                          </div>
                        </SelectItem>
                        <SelectItem value="popular">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Popular
                          </div>
                        </SelectItem>
                        <SelectItem value="views">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Most Viewed
                          </div>
                        </SelectItem>
                        <SelectItem value="title">A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Articles Grid/List */}
                {isLoading ? (
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-0">
                          <div className="w-full h-48 bg-muted rounded-t-lg"></div>
                          <div className="p-6">
                            <div className="h-4 bg-muted rounded mb-2"></div>
                            <div className="h-3 bg-muted rounded w-2/3 mb-4"></div>
                            <div className="h-16 bg-muted rounded mb-4"></div>
                            <div className="flex gap-2">
                              <div className="h-6 bg-muted rounded w-16"></div>
                              <div className="h-6 bg-muted rounded w-20"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : sortedPosts && sortedPosts.length > 0 ? (
                  <div className={
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }>
                    {sortedPosts.map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Newspaper className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your filters or search terms
                      </p>
                      <Button variant="outline" onClick={() => {
                        setSelectedCategory('');
                        setSearchQuery('');
                      }}>
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Load More */}
                {sortedPosts && sortedPosts.length >= 50 && (
                  <div className="text-center mt-8">
                    <Button variant="outline" size="lg">
                      Load More Articles
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trending" className="mt-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">Trending Articles</h3>
                  <p className="text-muted-foreground">
                    Articles with the highest engagement in the last 24 hours.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="featured" className="mt-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">Featured Articles</h3>
                  <p className="text-muted-foreground">
                    Hand-picked articles by our editorial team.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="recent" className="mt-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">Recent Articles</h3>
                  <p className="text-muted-foreground">
                    The latest articles published in the last week.
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
