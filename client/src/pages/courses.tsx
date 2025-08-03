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
  Star, 
  Clock, 
  BookOpen,
  Users,
  Play,
  ExternalLink,
  Bookmark,
  Eye
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor?: string;
  platform?: string;
  url: string;
  thumbnailUrl?: string;
  price: string;
  duration?: string;
  skillLevel: string;
  upvotes: number;
  views: number;
  rating: string;
  ratingCount: number;
  featured?: boolean;
  categoryId?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

export default function Courses() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [skillLevelFilter, setSkillLevelFilter] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses", selectedCategory, searchQuery, skillLevelFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (skillLevelFilter) params.append('skillLevel', skillLevelFilter);
      params.append('limit', '50');
      
      const response = await fetch(`/api/courses?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
  });

  const { data: featuredCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses", { featured: true, limit: 3 }],
  });

  const filteredCourses = courses?.filter(course => {
    if (priceFilter === 'free' && parseFloat(course.price) > 0) return false;
    if (priceFilter === 'paid' && parseFloat(course.price) === 0) return false;
    return true;
  });

  const sortedCourses = filteredCourses?.sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.upvotes - a.upvotes;
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'rating':
        return parseFloat(b.rating) - parseFloat(a.rating);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const skillLevels = [
    { value: 'beginner', label: 'Beginner', color: 'tag-green' },
    { value: 'intermediate', label: 'Intermediate', color: 'tag-yellow' },
    { value: 'advanced', label: 'Advanced', color: 'tag-red' },
  ];

  const platforms = [
    'Coursera',
    'Udemy',
    'edX',
    'YouTube',
    'LinkedIn Learning',
    'Skillshare',
    'Pluralsight',
    'FutureLearn'
  ];

  const CourseCard = ({ course, viewMode }: { course: Course; viewMode: 'grid' | 'list' }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);

    const handleBookmark = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsBookmarked(!isBookmarked);
    };

    const handleTakeCourse = (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(course.url, '_blank', 'noopener,noreferrer');
    };

    const getSkillLevelColor = (level: string) => {
      switch (level) {
        case 'beginner':
          return 'tag-green';
        case 'intermediate':
          return 'tag-yellow';
        case 'advanced':
          return 'tag-red';
        default:
          return 'tag-gray';
      }
    };

    if (viewMode === 'list') {
      return (
        <Card className="tool-card hover:border-primary/20 group cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                {course.thumbnailUrl ? (
                  <img 
                    src={course.thumbnailUrl} 
                    alt={`${course.title} thumbnail`}
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  <BookOpen className="w-8 h-8 text-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-1">{course.title}</h3>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      {course.instructor && (
                        <span>by {course.instructor}</span>
                      )}
                      {course.platform && (
                        <>
                          <span>•</span>
                          <span>{course.platform}</span>
                        </>
                      )}
                      {course.duration && (
                        <>
                          <span>•</span>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{course.duration}</span>
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
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className={`tag ${getSkillLevelColor(course.skillLevel)}`}>
                      {course.skillLevel}
                    </Badge>
                    {parseFloat(course.price) === 0 ? (
                      <Badge variant="default" className="tag-green">Free</Badge>
                    ) : (
                      <Badge variant="outline" className="tag-yellow">
                        ${parseFloat(course.price).toFixed(2)}
                      </Badge>
                    )}
                    {course.featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span>{parseFloat(course.rating).toFixed(1)}</span>
                      <span className="ml-1">({course.ratingCount})</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary/80 font-medium"
                    onClick={handleTakeCourse}
                  >
                    Take Course
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
          {/* Thumbnail */}
          <div className="w-full h-32 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
            {course.thumbnailUrl ? (
              <img 
                src={course.thumbnailUrl} 
                alt={`${course.title} thumbnail`}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="w-12 h-12 text-white" />
            )}
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

          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-2">{course.title}</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                {course.instructor && (
                  <span>by {course.instructor}</span>
                )}
                {course.platform && course.instructor && (
                  <span>•</span>
                )}
                {course.platform && (
                  <span>{course.platform}</span>
                )}
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm line-clamp-3">
              {course.description}
            </p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span>{parseFloat(course.rating).toFixed(1)}</span>
                  <span className="text-muted-foreground ml-1">({course.ratingCount})</span>
                </div>
                {course.duration && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{course.duration}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Users className="w-4 h-4 mr-1" />
                <span>{course.views}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className={`tag ${getSkillLevelColor(course.skillLevel)}`}>
                {course.skillLevel}
              </Badge>
              {course.featured && (
                <Badge variant="secondary" className="tag tag-yellow">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div>
                {parseFloat(course.price) === 0 ? (
                  <Badge variant="default" className="tag-green">Free</Badge>
                ) : (
                  <Badge variant="outline" className="tag-yellow">
                    ${parseFloat(course.price).toFixed(2)}
                  </Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary/80 font-medium"
                onClick={handleTakeCourse}
              >
                <Play className="w-4 h-4 mr-1" />
                Take Course →
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
              AI Courses & Tutorials
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn AI skills with {courses?.length || 2500}+ curated courses from top platforms and instructors
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar 
              placeholder="Search courses..." 
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Submit Course
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Expert reviewed</span>
              <span>•</span>
              <span>All skill levels</span>
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

                {/* Skill Level */}
                <div>
                  <h3 className="font-semibold mb-3">Skill Level</h3>
                  <Select value={skillLevelFilter} onValueChange={setSkillLevelFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All levels</SelectItem>
                      {skillLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Top Platforms */}
                <div>
                  <h3 className="font-semibold mb-3">Popular Platforms</h3>
                  <div className="space-y-2">
                    {platforms.slice(0, 6).map((platform) => (
                      <div key={platform} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{platform}</span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.floor(Math.random() * 100) + 20}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Featured Courses */}
                {featuredCourses && featuredCourses.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      Featured
                    </h3>
                    <div className="space-y-3">
                      {featuredCourses.slice(0, 3).map((course) => (
                        <div key={course.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm truncate">{course.title}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className={`text-xs tag ${getSkillLevelColor(course.skillLevel)}`}>
                                  {course.skillLevel}
                                </Badge>
                                {parseFloat(course.price) === 0 ? (
                                  <Badge variant="default" className="text-xs">Free</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    ${parseFloat(course.price).toFixed(2)}
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
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {sortedCourses?.length || 0} courses found
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
                    <SelectItem value="title">A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Courses Grid/List */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="w-full h-32 bg-muted rounded-lg mb-4"></div>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3 mb-4"></div>
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
            ) : sortedCourses && sortedCourses.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {sortedCourses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSelectedCategory('');
                    setSkillLevelFilter('');
                    setPriceFilter('');
                    setSearchQuery('');
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Load More */}
            {sortedCourses && sortedCourses.length >= 50 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  Load More Courses
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function getSkillLevelColor(level: string) {
  switch (level) {
    case 'beginner':
      return 'tag-green';
    case 'intermediate':
      return 'tag-yellow';
    case 'advanced':
      return 'tag-red';
    default:
      return 'tag-gray';
  }
}
