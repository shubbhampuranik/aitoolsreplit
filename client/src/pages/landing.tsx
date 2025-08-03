import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import CategoryGrid from "@/components/CategoryGrid";
import { useQuery } from "@tanstack/react-query";
import { 
  Brain, 
  Users, 
  Lightbulb, 
  Rocket, 
  Star, 
  TrendingUp,
  BookOpen,
  Briefcase,
  Zap,
  Search
} from "lucide-react";

interface Stats {
  toolsCount: number;
  promptsCount: number;
  coursesCount: number;
  jobsCount: number;
  usersCount: number;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  pricingType: string;
  rating: string;
  upvotes: number;
  views: number;
}

export default function Landing() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: featuredTools } = useQuery<Tool[]>({
    queryKey: ["/api/tools", { featured: true, limit: 6 }],
  });

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleSignup = () => {
    window.location.href = "/api/login";
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-pattern opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-4xl mx-auto">
            {/* Trust badges */}
            <div className="flex justify-center items-center space-x-6 mb-8 opacity-60">
              <span className="text-sm font-medium text-muted-foreground">TRUSTED BY</span>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                  <span className="text-xs font-bold">G</span>
                </div>
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                  <span className="text-xs font-bold">M</span>
                </div>
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                  <span className="text-xs font-bold">N</span>
                </div>
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                  <span className="text-xs font-bold">U</span>
                </div>
              </div>
            </div>

            <h1 className="hero-title text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Everything your business needs to{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                master AI
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover {stats?.toolsCount?.toLocaleString() || "25,000+"}+ AI tools, learn from expert courses, 
              find the perfect prompts, and connect with {stats?.usersCount?.toLocaleString() || "500K+"}+ AI enthusiasts. All in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl"
                onClick={handleSignup}
              >
                Join {stats?.usersCount ? (stats.usersCount / 1000).toFixed(0) + "K+" : "500K+"} Members Free
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 px-8 py-4 text-lg font-semibold"
              >
                Explore AI Tools
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary stats-counter">
                  {stats?.toolsCount?.toLocaleString() || "25,847"}
                </div>
                <div className="text-sm text-muted-foreground font-medium">AI Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary stats-counter">
                  {stats?.usersCount ? (stats.usersCount / 1000).toFixed(0) + "K+" : "500K+"}
                </div>
                <div className="text-sm text-muted-foreground font-medium">Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary stats-counter">
                  {stats?.promptsCount?.toLocaleString() || "15K+"}
                </div>
                <div className="text-sm text-muted-foreground font-medium">Prompts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary stats-counter">
                  {stats?.coursesCount?.toLocaleString() || "2,500+"}
                </div>
                <div className="text-sm text-muted-foreground font-medium">Courses</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Popular Categories</h2>
            <p className="text-xl text-muted-foreground">Explore AI tools organized by industry and use case</p>
          </div>

          <CategoryGrid />

          <div className="text-center mt-10">
            <Button variant="ghost" className="text-primary hover:text-primary/80 font-semibold text-lg">
              View All Categories <TrendingUp className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured AI Tools</h2>
              <p className="text-xl text-muted-foreground">Discover the most popular and highest-rated AI tools</p>
            </div>
            <div className="hidden md:flex space-x-2">
              <Button size="sm" className="bg-primary text-primary-foreground">Popular</Button>
              <Button size="sm" variant="outline">New</Button>
              <Button size="sm" variant="outline">Free</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTools?.map((tool) => (
              <Card key={tool.id} className="tool-card hover:border-primary/20 group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                        <Brain className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{tool.name}</h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium text-muted-foreground ml-1">
                              {parseFloat(tool.rating).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {tool.views > 1000 ? `${(tool.views / 1000).toFixed(1)}k` : tool.views} users
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="bookmark-btn opacity-0 group-hover:opacity-100 p-2"
                    >
                      <BookOpen className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {tool.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="tag tag-blue">AI Tool</Badge>
                    <Badge variant="secondary" className="tag tag-green">Popular</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={tool.pricingType === 'free' ? 'tag-green' : 'tag-yellow'}
                      >
                        {tool.pricingType === 'free' ? 'Free' : 
                         tool.pricingType === 'freemium' ? 'Freemium' :
                         tool.pricingType === 'free_trial' ? 'Free Trial' : 'Paid'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ↗ {tool.upvotes > 1000 ? `${(tool.upvotes / 1000).toFixed(1)}k` : tool.upvotes}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-medium">
                      Try Now →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-semibold">
              Explore All {stats?.toolsCount?.toLocaleString() || "25,000+"}+ AI Tools
            </Button>
          </div>
        </div>
      </section>

      {/* Community Features */}
      <section className="py-16 hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Join the AI Revolution</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with like-minded innovators, share knowledge, and stay ahead of AI trends
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Active Community</h3>
              <p className="text-muted-foreground">
                Join {stats?.usersCount ? (stats.usersCount / 1000).toFixed(0) + "K+" : "500K+"} AI enthusiasts sharing insights, tips, and discoveries daily
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Expert Insights</h3>
              <p className="text-muted-foreground">
                Learn from industry leaders and get exclusive access to AI trends and analysis
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Early Access</h3>
              <p className="text-muted-foreground">
                Be the first to discover and try new AI tools before they go mainstream
              </p>
            </div>
          </div>

          {/* Recent Community Activity Placeholder */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">Recent Community Activity</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-4 hover:bg-muted/30 rounded-lg transition-colors activity-item">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">AC</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-foreground">Alex Chen</span>
                      <span className="text-muted-foreground">shared a new tool</span>
                      <span className="text-sm text-muted-foreground">2 hours ago</span>
                    </div>
                    <p className="text-foreground mb-2">
                      "Just discovered this amazing AI video editor - completely game-changing for content creators!"
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-primary">
                        <Star className="w-4 h-4 mr-1" />24 likes
                      </Button>
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-primary">
                        <Zap className="w-4 h-4 mr-1" />8 replies
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 hover:bg-muted/30 rounded-lg transition-colors activity-item">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">SM</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-foreground">Sarah Martinez</span>
                      <span className="text-muted-foreground">published a prompt</span>
                      <span className="text-sm text-muted-foreground">4 hours ago</span>
                    </div>
                    <p className="text-foreground mb-2">
                      "New ChatGPT prompt for creating detailed user personas - tested on 20+ projects!"
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-primary">
                        <Star className="w-4 h-4 mr-1" />67 likes
                      </Button>
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-primary">
                        <Zap className="w-4 h-4 mr-1" />15 replies
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 hover:bg-muted/30 rounded-lg transition-colors activity-item">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">MJ</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-foreground">Mike Johnson</span>
                      <span className="text-muted-foreground">started a discussion</span>
                      <span className="text-sm text-muted-foreground">6 hours ago</span>
                    </div>
                    <p className="text-foreground mb-2">
                      "What are your predictions for AI in 2025? Share your thoughts on the biggest trends coming up."
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-primary">
                        <Star className="w-4 h-4 mr-1" />43 likes
                      </Button>
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-primary">
                        <Zap className="w-4 h-4 mr-1" />32 replies
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <Button variant="ghost" className="text-primary hover:text-primary/80 font-semibold" onClick={handleSignup}>
                  Join the Discussion →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-foreground text-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Ahead of the AI Curve</h2>
          <p className="text-xl opacity-80 mb-8">
            Get weekly insights, new tool discoveries, and exclusive content delivered to your inbox
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 bg-background/10 border-background/20 text-background placeholder:text-background/60"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold whitespace-nowrap">
                Subscribe Free
              </Button>
            </div>
            <p className="text-sm opacity-60 mt-3">Join 150,000+ subscribers. No spam, unsubscribe anytime.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-8 border-t border-background/20">
            <div className="text-center">
              <div className="text-2xl font-bold">150K+</div>
              <div className="text-sm opacity-60">Newsletter Subscribers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">25K+</div>
              <div className="text-sm opacity-60">Tools Discovered Weekly</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">4.9★</div>
              <div className="text-sm opacity-60">Community Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats?.usersCount ? (stats.usersCount / 1000).toFixed(0) + "K+" : "500K+"}</div>
              <div className="text-sm opacity-60">Active Members</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
