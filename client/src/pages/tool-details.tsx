import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  Eye, 
  TrendingUp, 
  Bookmark, 
  Share2, 
  ExternalLink,
  Calendar,
  Users,
  Globe,
  CheckCircle,
  XCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AuthDialog from "@/components/AuthDialog";

interface FAQ {
  question: string;
  answer: string;
}

interface ProsAndCons {
  pros?: string[];
  cons?: string[];
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
}

interface ToolDetails {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  url: string;
  logoUrl: string;
  gallery: string[];
  pricingType: "free" | "freemium" | "paid" | "free_trial";
  pricingDetails: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  submittedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
  };
  upvotes: number;
  views: number;
  rating: number;
  ratingCount: number;
  featured: boolean;
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  faqs?: FAQ[];
  prosAndCons?: ProsAndCons;
  tags?: { name: string; slug: string }[];
  createdAt: string;
  updatedAt: string;
}

export default function ToolDetailsPage() {
  const { toolId } = useParams();
  const { isAuthenticated } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const { data: tool, isLoading } = useQuery<ToolDetails>({
    queryKey: ["/api/tools", toolId],
  });

  const { data: alternatives } = useQuery({
    queryKey: ["/api/tools", toolId, "alternatives"],
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/tools", toolId, "reviews"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tool Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The tool you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const handleVote = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    // Handle voting logic
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    // Handle bookmark logic
  };

  const handleRating = (rating: number) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setUserRating(rating);
    // Handle rating submission
  };

  const getPricingBadgeVariant = (type: string) => {
    switch (type) {
      case "free": return "outline";
      case "freemium": return "secondary";
      case "paid": return "default";
      case "free_trial": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Tool Logo and Basic Info */}
            <div className="flex items-start gap-4">
              <img 
                src={tool.logoUrl || "/api/placeholder/80/80"} 
                alt={tool.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1>
                  {tool.featured && (
                    <Badge variant="default" className="bg-yellow-500 text-white">
                      Featured
                    </Badge>
                  )}
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-3">
                  {tool.shortDescription}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{tool.rating}</span>
                    <span>({tool.ratingCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{tool.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Added {new Date(tool.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 lg:w-64">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
                onClick={() => window.open(tool.url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Website
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleVote} className="flex-1">
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {tool.upvotes}
                </Button>
                <Button variant="outline" size="sm" onClick={handleBookmark} className="flex-1">
                  <Bookmark className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <Badge variant={getPricingBadgeVariant(tool.pricingType)} className="w-full justify-center py-2">
                {tool.pricingType.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Gallery */}
            {tool.gallery && tool.gallery.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {tool.gallery.slice(0, 4).map((image, index) => (
                      <img 
                        key={index}
                        src={image} 
                        alt={`${tool.name} screenshot ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs Section */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>What is {tool.name}?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {tool.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Core Features - Show some default features if none provided */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Core Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tool.prosAndCons?.pros ? 
                        tool.prosAndCons.pros.map((pro, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{pro}</span>
                          </li>
                        )) : (
                          <>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">Advanced AI-powered capabilities</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">User-friendly interface</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">Reliable performance</span>
                            </li>
                          </>
                        )}
                    </ul>
                  </CardContent>
                </Card>

                {/* Limitations */}
                {tool.prosAndCons?.cons && tool.prosAndCons.cons.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-500" />
                        Limitations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tool.prosAndCons.cons.map((con, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* FAQ */}
                {tool.faqs && tool.faqs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {tool.faqs.map((faq, index) => (
                        <div key={index} className="border-b pb-4 last:border-b-0">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            {faq.question}
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            {faq.answer}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {/* Rating Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>User Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {tool.rating}
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.floor(tool.rating) 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">{tool.ratingCount} reviews</div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <div key={stars} className="flex items-center gap-2">
                            <span className="text-sm w-8">{stars}★</span>
                            <Progress value={60} className="flex-1 h-2" />
                            <span className="text-sm text-gray-500 w-8">60%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rate this tool */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Rate this tool</h4>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(star)}
                            className="focus:outline-none"
                          >
                            <Star 
                              className={`w-6 h-6 transition-colors ${
                                star <= userRating 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300 hover:text-yellow-400'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Plans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tool.pricingDetails && (
                      <div className="prose max-w-none dark:prose-invert">
                        <p>{tool.pricingDetails}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alternatives" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Alternative Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 dark:text-gray-400">
                      Alternative tools will be displayed here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Tool Info */}
            <Card>
              <CardHeader>
                <CardTitle>Tool Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tool.category && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</div>
                    <Badge variant="outline">{tool.category.name}</Badge>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pricing Model</div>
                  <Badge variant={getPricingBadgeVariant(tool.pricingType)}>
                    {tool.pricingType.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Website</div>
                  <Button variant="link" className="p-0 h-auto" onClick={() => window.open(tool.url, '_blank')}>
                    <Globe className="w-4 h-4 mr-1" />
                    Visit Website
                  </Button>
                </div>
                {tool.socialLinks && Object.keys(tool.socialLinks).length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Social Links</div>
                    <div className="flex gap-2">
                      {Object.entries(tool.socialLinks).map(([platform, url]) => url && (
                        <Button 
                          key={platform}
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(url, '_blank')}
                        >
                          {platform}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submitted By */}
            {tool.submittedBy && (
              <Card>
                <CardHeader>
                  <CardTitle>Submitted By</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={tool.submittedBy.profileImageUrl} />
                      <AvatarFallback>
                        {tool.submittedBy.firstName?.[0]}{tool.submittedBy.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {tool.submittedBy.firstName} {tool.submittedBy.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Tool Contributor
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tool.tags && tool.tags.length > 0 ? 
                    tool.tags.map((tag) => (
                      <Badge key={tag.slug} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    )) : (
                      <>
                        <Badge variant="outline" className="text-xs">AI Tool</Badge>
                        <Badge variant="outline" className="text-xs">Productivity</Badge>
                        <Badge variant="outline" className="text-xs">Technology</Badge>
                      </>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Share Tool */}
            <Card>
              <CardHeader>
                <CardTitle>Share this Tool</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Share2 className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Share on Twitter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        title="Join the AI Community"
        description="Sign up to vote, rate tools, and connect with other AI enthusiasts"
      />
    </div>
  );
}