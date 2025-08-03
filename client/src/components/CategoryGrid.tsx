import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  PenTool, 
  Image, 
  Code, 
  Video, 
  BarChart3, 
  MessageSquare, 
  Music, 
  Cog,
  Brain,
  Palette
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  toolCount: number;
  icon?: string;
  color?: string;
}

interface CategoryGridProps {
  compact?: boolean;
  limit?: number;
}

const getCategoryIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case 'writing & editing':
    case 'writing':
      return PenTool;
    case 'image generation':
    case 'image':
      return Image;
    case 'coding & development':
    case 'code':
      return Code;
    case 'video & animation':
    case 'video':
      return Video;
    case 'marketing & advertising':
    case 'marketing':
      return BarChart3;
    case 'chatbots & ai assistants':
    case 'chatbots':
      return MessageSquare;
    case 'music & audio':
    case 'audio':
      return Music;
    case 'productivity':
      return Cog;
    case 'art & design':
      return Palette;
    default:
      return Brain;
  }
};

const getCategoryColor = (name: string, color?: string) => {
  if (color) return color;
  
  switch (name.toLowerCase()) {
    case 'writing & editing':
    case 'writing':
      return 'from-blue-500 to-blue-600';
    case 'image generation':
    case 'image':
      return 'from-purple-500 to-purple-600';
    case 'coding & development':
    case 'code':
      return 'from-green-500 to-green-600';
    case 'video & animation':
    case 'video':
      return 'from-red-500 to-red-600';
    case 'marketing & advertising':
    case 'marketing':
      return 'from-yellow-500 to-orange-500';
    case 'chatbots & ai assistants':
    case 'chatbots':
      return 'from-indigo-500 to-indigo-600';
    case 'music & audio':
    case 'audio':
      return 'from-pink-500 to-pink-600';
    case 'productivity':
      return 'from-teal-500 to-teal-600';
    case 'art & design':
      return 'from-violet-500 to-violet-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

const defaultCategories = [
  { id: '1', name: 'Writing & Editing', slug: 'writing-editing', toolCount: 1247, description: 'Create compelling content with AI' },
  { id: '2', name: 'Image Generation', slug: 'image-generation', toolCount: 892, description: 'Generate stunning visuals with AI' },
  { id: '3', name: 'Coding & Development', slug: 'coding-development', toolCount: 1156, description: 'Build faster with AI assistance' },
  { id: '4', name: 'Video & Animation', slug: 'video-animation', toolCount: 634, description: 'Create engaging video content' },
  { id: '5', name: 'Marketing & Advertising', slug: 'marketing-advertising', toolCount: 1423, description: 'Boost your marketing campaigns' },
  { id: '6', name: 'Chatbots & AI Assistants', slug: 'chatbots-assistants', toolCount: 987, description: 'Build intelligent conversations' },
  { id: '7', name: 'Music & Audio', slug: 'music-audio', toolCount: 456, description: 'Compose and edit with AI' },
  { id: '8', name: 'Productivity', slug: 'productivity', toolCount: 2134, description: 'Streamline your workflow' },
];

export default function CategoryGrid({ compact = false, limit }: CategoryGridProps) {
  const { data: categories = defaultCategories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const displayCategories = limit ? categories.slice(0, limit) : categories;

  if (isLoading) {
    return (
      <div className={compact ? "space-y-3" : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"}>
        {Array.from({ length: compact ? 6 : 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            {compact ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-8 h-8 bg-muted rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded mb-1"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-3"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {displayCategories.map((category) => {
          const Icon = getCategoryIcon(category.name);
          const colorClass = getCategoryColor(category.name, category.color);
          
          return (
            <Link key={category.id} href={`/tools?category=${category.slug}`}>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{category.name}</div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {category.toolCount.toLocaleString()}
                </Badge>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {displayCategories.map((category) => {
        const Icon = getCategoryIcon(category.name);
        const colorClass = getCategoryColor(category.name, category.color);
        
        return (
          <Link key={category.id} href={`/tools?category=${category.slug}`}>
            <Card className="category-hover cursor-pointer group">
              <CardContent className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{category.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {category.description || 'Discover AI tools in this category'}
                </p>
                <div className="text-xs text-primary font-medium">
                  {category.toolCount.toLocaleString()} tools
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
