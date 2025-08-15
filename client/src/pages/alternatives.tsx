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
  Filter
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

  // Filter and sort alternatives
  const filteredAlternatives = alternatives
    .filter(alt => 
      alt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alt.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'upvotes':
        default:
          return (b.upvotes || 0) - (a.upvotes || 0);
      }
    });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/tools/${toolId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {tool?.name}
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Alternatives to {tool?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Discover {alternatives.length} alternative tools similar to {tool?.name}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
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
                          <Link href={`/tools/${alt.id}`}>
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
                          
                          {alt.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <span>⭐</span>
                              <span>{alt.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Link href={`/tools/${alt.id}`}>
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

      {/* Auth Dialog */}
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        mode="vote"
        toolName={tool?.name}
      />
    </div>
  );
}