import { useState } from "react";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { 
  Grid3X3, 
  List, 
  Filter, 
  Plus, 
  TrendingUp, 
  Clock, 
  MapPin,
  Building2,
  ExternalLink,
  Bookmark,
  Eye,
  DollarSign,
  Home,
  Briefcase
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location?: string;
  remote: boolean;
  salary?: string;
  applyUrl: string;
  companyLogo?: string;
  views: number;
  featured?: boolean;
  categoryId?: string;
  createdAt?: string;
  expiresAt?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

export default function Jobs() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [remoteFilter, setRemoteFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs", selectedCategory, searchQuery, remoteFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (remoteFilter === 'remote') params.append('remote', 'true');
      if (remoteFilter === 'onsite') params.append('remote', 'false');
      params.append('limit', '50');
      
      const response = await fetch(`/api/jobs?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return response.json();
    },
  });

  const { data: featuredJobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs", "featured"],
    queryFn: async () => {
      const response = await fetch('/api/jobs?featured=true&limit=3', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch featured jobs');
      return response.json();
    },
  });

  const filteredJobs = jobs?.filter(job => {
    if (locationFilter && job.location && !job.location.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  const sortedJobs = filteredJobs?.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'company':
        return a.company.localeCompare(b.company);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const JobCard = ({ job, viewMode }: { job: Job; viewMode: 'grid' | 'list' }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);

    const handleBookmark = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsBookmarked(!isBookmarked);
    };

    const handleApply = (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    };

    const isExpiringSoon = job.expiresAt && new Date(job.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

    if (viewMode === 'list') {
      return (
        <Card className="tool-card hover:border-primary/20 group cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Company Logo */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                {job.companyLogo ? (
                  <img 
                    src={job.companyLogo} 
                    alt={`${job.company} logo`}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-1">{job.title}</h3>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-1" />
                        <span>{job.company}</span>
                      </div>
                      {job.location && (
                        <>
                          <span>•</span>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{job.location}</span>
                          </div>
                        </>
                      )}
                      {job.remote && (
                        <>
                          <span>•</span>
                          <div className="flex items-center">
                            <Home className="w-4 h-4 mr-1" />
                            <span>Remote</span>
                          </div>
                        </>
                      )}
                      {job.salary && (
                        <>
                          <span>•</span>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span>{job.salary}</span>
                          </div>
                        </>
                      )}
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
                  {job.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {job.remote ? (
                      <Badge variant="secondary" className="tag-green">Remote</Badge>
                    ) : (
                      <Badge variant="secondary" className="tag-blue">On-site</Badge>
                    )}
                    {job.featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {isExpiringSoon && (
                      <Badge variant="destructive" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Expires Soon
                      </Badge>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{job.views}</span>
                    </div>
                  </div>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="sm"
                    onClick={handleApply}
                  >
                    Apply Now
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="tool-card hover:border-primary/20 group cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                {job.companyLogo ? (
                  <img 
                    src={job.companyLogo} 
                    alt={`${job.company} logo`}
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">{job.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-muted-foreground">{job.company}</span>
                  {job.views > 0 && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{job.views} views</span>
                      </div>
                    </>
                  )}
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

          <div className="space-y-3">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {job.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.remote && (
                <div className="flex items-center">
                  <Home className="w-4 h-4 mr-1" />
                  <span>Remote</span>
                </div>
              )}
              {job.salary && (
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span>{job.salary}</span>
                </div>
              )}
            </div>
            
            <p className="text-muted-foreground line-clamp-3">
              {job.description}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {job.remote ? (
                <Badge variant="secondary" className="tag tag-green">Remote</Badge>
              ) : (
                <Badge variant="secondary" className="tag tag-blue">On-site</Badge>
              )}
              {job.featured && (
                <Badge variant="secondary" className="tag tag-yellow">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {isExpiringSoon && (
                <Badge variant="destructive" className="tag">
                  <Clock className="w-3 h-3 mr-1" />
                  Expires Soon
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'recently'}
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                size="sm"
                onClick={handleApply}
              >
                Apply Now →
              </Button>
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
              AI Jobs Board
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find your next AI career opportunity from {jobs?.length || 1200}+ curated job listings
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar 
              placeholder="Search jobs, companies, locations..." 
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Post a Job
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Remote friendly</span>
              <span>•</span>
              <span>Updated daily</span>
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
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Work Type */}
                <div>
                  <h3 className="font-semibold mb-3">Work Type</h3>
                  <Select value={remoteFilter} onValueChange={setRemoteFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <h3 className="font-semibold mb-3">Location</h3>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      <SelectItem value="san francisco">San Francisco</SelectItem>
                      <SelectItem value="new york">New York</SelectItem>
                      <SelectItem value="london">London</SelectItem>
                      <SelectItem value="berlin">Berlin</SelectItem>
                      <SelectItem value="toronto">Toronto</SelectItem>
                      <SelectItem value="singapore">Singapore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Featured Jobs */}
                {featuredJobs && featuredJobs.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Featured Jobs
                    </h3>
                    <div className="space-y-3">
                      {featuredJobs.slice(0, 3).map((job) => (
                        <div key={job.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm truncate">{job.title}</h4>
                              <p className="text-xs text-muted-foreground">{job.company}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {job.remote ? 'Remote' : 'On-site'}
                                </Badge>
                                {job.location && (
                                  <Badge variant="outline" className="text-xs">
                                    {job.location}
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

                {/* Quick Stats */}
                <div>
                  <h3 className="font-semibold mb-3">Quick Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Jobs</span>
                      <Badge variant="secondary">{jobs?.length || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Remote Jobs</span>
                      <Badge variant="secondary">
                        {jobs?.filter(job => job.remote).length || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">New This Week</span>
                      <Badge variant="secondary">
                        {jobs?.filter(job => 
                          job.createdAt && 
                          new Date(job.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                        ).length || 0}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {sortedJobs?.length || 0} jobs found
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
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
                    <SelectItem value="company">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Company
                      </div>
                    </SelectItem>
                    <SelectItem value="title">A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Jobs Grid/List */}
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded mb-2"></div>
                          <div className="h-3 bg-muted rounded w-2/3 mb-4"></div>
                          <div className="h-16 bg-muted rounded mb-4"></div>
                          <div className="flex gap-2">
                            <div className="h-6 bg-muted rounded w-16"></div>
                            <div className="h-6 bg-muted rounded w-20"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedJobs && sortedJobs.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                  : "space-y-4"
              }>
                {sortedJobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSelectedCategory('');
                    setLocationFilter('');
                    setRemoteFilter('');
                    setSearchQuery('');
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Load More */}
            {sortedJobs && sortedJobs.length >= 50 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  Load More Jobs
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
