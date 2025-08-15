import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { 
  ExternalLink, 
  ThumbsUp, 
  Eye,
  ArrowLeft,
  Search,
  Filter,
  Star,
  TrendingUp,
  Award,
  BarChart3,
  Users2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import AuthDialog from '@/components/AuthDialog';
import Layout from '@/components/Layout';

type Tool = {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  url: string;
  logoUrl?: string;
  pricingType: string;
  rating: number;
  upvotes: number;
  userVoted?: boolean;
  category?: {
    name: string;
    color: string;
  };
};

export default function AlternativesPage() {
  const [location] = useLocation();
  const toolId = location.split('/')[2]; // /tools/:toolId/alternatives
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('upvotes');

  // Fetch original tool data
  const { data: tool } = useQuery<Tool>({
    queryKey: ['/api/tools', toolId],
  });

  // Fetch all alternatives
  const { data: alternatives = [], isLoading } = useQuery<Array<Tool & { upvotes: number; userVoted: boolean }>>({
    queryKey: ['/api/tools', toolId, 'alternatives'],
  });

  const voteAlternativeMutation = useMutation({
    mutationFn: async (alternativeId: string) => {
      const response = await fetch(`/api/tools/${toolId}/alternatives/${alternativeId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to vote');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools', toolId, 'alternatives'] });
    },
  });

  const handleVote = (alternativeId: string) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    voteAlternativeMutation.mutate(alternativeId);
  };

  // Enhanced filtering and sorting with additional filters
  const [pricingFilter, setPricingFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  const filteredAlternatives = alternatives
    .filter(alt => {
      const matchesSearch = alt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alt.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPricing = pricingFilter === 'all' || alt.pricingType === pricingFilter;
      
      const rating = parseFloat(String(alt.rating || "0"));
      const matchesRating = ratingFilter === 'all' || 
        (ratingFilter === '4+' && rating >= 4) ||
        (ratingFilter === '3+' && rating >= 3) ||
        (ratingFilter === '2+' && rating >= 2);
      
      return matchesSearch && matchesPricing && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return parseFloat(String(b.rating || "0")) - parseFloat(String(a.rating || "0"));
        case 'upvotes':
        default:
          return (b.upvotes || 0) - (a.upvotes || 0);
      }
    });

  // Calculate statistics for sidebar
  const alternativeStats = {
    totalAlternatives: alternatives.length,
    averageRating: alternatives.length > 0 
      ? alternatives.reduce((sum, alt) => sum + parseFloat(String(alt.rating || "0")), 0) / alternatives.length 
      : 0,
    totalVotes: alternatives.reduce((sum, alt) => sum + (alt.upvotes || 0), 0),
    pricingBreakdown: alternatives.reduce((acc, alt) => {
      acc[alt.pricingType] = (acc[alt.pricingType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    ratingBreakdown: alternatives.reduce((acc, alt) => {
      const rating = Math.floor(parseFloat(String(alt.rating || "0")));
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>)
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link to={`/tools/${toolId}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {tool?.name}
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={tool?.logoUrl || '/api/placeholder/64/64'} 
                alt={tool?.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {tool?.name} Alternatives
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Discover {alternativeStats.totalAlternatives} alternative tools similar to {tool?.name}
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Alternative Stats & Filters */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {alternativeStats.averageRating.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(alternativeStats.averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Average from {alternativeStats.totalAlternatives} alternatives
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Votes</span>
                      </div>
                      <span className="font-medium">{alternativeStats.totalVotes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Alternatives</span>
                      </div>
                      <span className="font-medium">{alternativeStats.totalAlternatives}</span>
                    </div>
                  </div>

                  {/* Pricing Filter */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Pricing Type
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(alternativeStats.pricingBreakdown).map(([pricing, count]) => {
                        const percentage = (count / alternativeStats.totalAlternatives) * 100;
                        return (
                          <div key={pricing} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <button
                                onClick={() => setPricingFilter(pricingFilter === pricing ? 'all' : pricing)}
                                className={`text-left hover:text-blue-600 ${pricingFilter === pricing ? 'text-blue-600 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
                              >
                                {pricing.charAt(0).toUpperCase() + pricing.slice(1)}
                              </button>
                              <span className="text-gray-500">{count}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Filter by Rating</h4>
                    <div className="space-y-2">
                      {['4+', '3+', '2+'].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setRatingFilter(ratingFilter === rating ? 'all' : rating)}
                          className={`block w-full text-left text-sm py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                            ratingFilter === rating ? 'bg-blue-50 dark:bg-blue-900 text-blue-600' : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {rating} stars & up
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(pricingFilter !== 'all' || ratingFilter !== 'all') && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setPricingFilter('all');
                        setRatingFilter('all');
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Alternatives List */}
            <div className="lg:col-span-3">
              {/* Search and Sort */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search alternatives..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upvotes">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="name">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Alternatives Grid */}
              {filteredAlternatives.length > 0 ? (
                <div className="grid gap-6">
                  {filteredAlternatives.map((alt) => (
                    <Card key={alt.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Logo */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                            {alt.logoUrl ? (
                              <img 
                                src={alt.logoUrl} 
                                alt={alt.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ExternalLink className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Link to={`/tools/${alt.id}`}>
                                    <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                                      {alt.name}
                                    </h3>
                                  </Link>
                                  
                                  {alt.category && (
                                    <Badge 
                                      variant="secondary" 
                                      className="text-xs"
                                      style={{ backgroundColor: `${alt.category.color}20`, color: alt.category.color }}
                                    >
                                      {alt.category.name}
                                    </Badge>
                                  )}
                                  
                                  <Badge variant={alt.pricingType === 'free' ? 'default' : 'secondary'}>
                                    {alt.pricingType}
                                  </Badge>
                                </div>
                                
                                <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                  {alt.shortDescription || alt.description || 'No description available'}
                                </p>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleVote(alt.id)}
                                      className={`p-1 h-auto ${alt.userVoted ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
                                      disabled={voteAlternativeMutation.isPending}
                                    >
                                      <ThumbsUp className={`w-4 h-4 ${alt.userVoted ? 'fill-current' : ''}`} />
                                    </Button>
                                    <span>{alt.upvotes || 0} votes</span>
                                  </div>
                                  
                                  {parseFloat(String(alt.rating || "0")) > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      <span>{parseFloat(String(alt.rating || "0")).toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex flex-col gap-2 ml-4">
                                <Link to={`/tools/${alt.id}`}>
                                  <Button variant="outline" size="sm" className="w-full">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </Button>
                                </Link>
                                {alt.url && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(alt.url, '_blank')}
                                    className="w-full"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Visit Site
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ExternalLink className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No alternatives found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ? 
                      `No alternatives match "${searchQuery}"` : 
                      `No alternatives available for ${tool?.name} yet`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        mode="vote"
        toolName={tool?.name}
      />
    </Layout>
  );
}