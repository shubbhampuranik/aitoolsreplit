import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import ToolCard from "@/components/ToolCard";
import CategoryGrid from "@/components/CategoryGrid";
import CommunityFeed from "@/components/CommunityFeed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  Clock, 
  Star, 
  Users,
  Bookmark,
  Zap
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Tool {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  url: string;
  pricingType: string;
  rating: string;
  upvotes: number;
  views: number;
  featured: boolean;
  createdAt?: string;
}

interface Stats {
  toolsCount: number;
  promptsCount: number;
  coursesCount: number;
  jobsCount: number;
  modelsCount: number;
  usersCount: number;
}

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const { data: featuredTools } = useQuery<Tool[]>({
    queryKey: ["/api/tools", "featured"],
    queryFn: async () => {
      const response = await fetch('/api/tools?featured=true&limit=6', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch featured tools');
      return response.json();
    },
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const { data: recentTools } = useQuery<Tool[]>({
    queryKey: ["/api/tools", "recent"],
    queryFn: async () => {
      const response = await fetch('/api/tools?limit=5', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch recent tools');
      return response.json();
    },
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="loading-shimmer w-32 h-8 rounded"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section with Search */}
      <section className="hero-gradient py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Welcome back, AI Explorer!
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the latest AI tools, trending prompts, and connect with the community
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar placeholder="Search tools, prompts, courses, jobs..." />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">
                  {stats?.toolsCount?.toLocaleString() || "25K+"}
                </div>
                <div className="text-sm text-muted-foreground">Tools</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">
                  {stats?.modelsCount?.toLocaleString() || "5K+"}
                </div>
                <div className="text-sm text-muted-foreground">Models</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">
                  {stats?.promptsCount?.toLocaleString() || "15K+"}
                </div>
                <div className="text-sm text-muted-foreground">Prompts</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">
                  {stats?.coursesCount?.toLocaleString() || "2.5K+"}
                </div>
                <div className="text-sm text-muted-foreground">Courses</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">
                  {stats?.jobsCount?.toLocaleString() || "1.2K+"}
                </div>
                <div className="text-sm text-muted-foreground">Jobs</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => window.location.href = '/tools/submit'}
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-sm">Submit Tool</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => window.location.href = '/prompts/submit'}
                  >
                    <Star className="w-6 h-6" />
                    <span className="text-sm">Add Prompt</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => window.location.href = '/posts'}
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Join Discussion</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => window.location.href = '/profile?tab=bookmarks'}
                  >
                    <Bookmark className="w-6 h-6" />
                    <span className="text-sm">My Bookmarks</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Featured Tools */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Featured Tools
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.href = '/tools?featured=true'}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredTools?.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recently Added */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recently Added
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.href = '/tools?recent=true'}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTools?.map((tool) => (
                    <div key={tool.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {tool.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">{tool.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">{tool.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={tool.pricingType === 'free' ? 'default' : 'secondary'} className="text-xs">
                          {tool.pricingType === 'free' ? 'Free' : 
                           tool.pricingType === 'freemium' ? 'Freemium' :
                           tool.pricingType === 'free_trial' ? 'Free Trial' : 'Paid'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ↗ {tool.upvotes}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryGrid compact />
              </CardContent>
            </Card>

            {/* Community Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Community Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CommunityFeed />
              </CardContent>
            </Card>

            {/* Trending */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Trending Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">#AI Video Generation</span>
                    <Badge variant="secondary" className="text-xs">+247</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">#ChatGPT Prompts</span>
                    <Badge variant="secondary" className="text-xs">+189</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">#Code Assistant</span>
                    <Badge variant="secondary" className="text-xs">+156</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">#Image Generation</span>
                    <Badge variant="secondary" className="text-xs">+134</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">#Automation</span>
                    <Badge variant="secondary" className="text-xs">+98</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
