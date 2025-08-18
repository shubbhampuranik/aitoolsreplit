import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Camera, Video, ExternalLink, CheckCircle, AlertCircle, Play, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ScreenshotResult {
  url: string;
  title: string;
  description: string;
  type: 'homepage' | 'pricing' | 'features' | 'dashboard' | 'demo';
  confidence: number;
  viewport: 'desktop' | 'tablet' | 'mobile';
}

interface VideoResult {
  url: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  source: 'youtube' | 'vimeo' | 'embedded';
  confidence: number;
}

interface MediaDiscoveryResult {
  screenshots: ScreenshotResult[];
  videos: VideoResult[];
  totalFound: number;
  bestScreenshots: ScreenshotResult[];
  bestVideos: VideoResult[];
}

interface MediaDiscoveryButtonProps {
  websiteUrl: string;
  onMediaSelected: (media: string[]) => void;
  className?: string;
  disabled?: boolean;
}

export function MediaDiscoveryButton({ 
  websiteUrl, 
  onMediaSelected, 
  className,
  disabled 
}: MediaDiscoveryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MediaDiscoveryResult | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const { toast } = useToast();

  const discoverMedia = async () => {
    setIsLoading(true);
    setResults(null);
    setSelectedMedia([]);
    
    try {
      console.log('🔍 Starting media discovery for:', websiteUrl);
      const response = await apiRequest("POST", "/api/ai/discover-media", {
        url: websiteUrl
      });
      
      if (!response.ok) {
        throw new Error("Failed to discover media");
      }
      
      const data = await response.json();
      console.log('📊 Media discovery results:', data);
      setResults(data);
      
      // Auto-select best media items
      const autoSelected = [
        ...data.bestScreenshots.map((s: ScreenshotResult) => s.url),
        ...data.bestVideos.map((v: VideoResult) => v.url)
      ];
      console.log('✅ Auto-selected media:', autoSelected);
      setSelectedMedia(autoSelected);
      
      if (data.totalFound === 0) {
        toast({
          title: "No media found",
          description: "Could not find any screenshots or videos for this website.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Media discovered",
          description: `Found ${data.totalFound} media items. ${autoSelected.length} automatically selected.`
        });
      }
    } catch (error) {
      console.error("Error discovering media:", error);
      toast({
        title: "Discovery failed",
        description: "Failed to discover media. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMediaSelection = (mediaUrl: string) => {
    setSelectedMedia(prev => 
      prev.includes(mediaUrl) 
        ? prev.filter(url => url !== mediaUrl)
        : [...prev, mediaUrl]
    );
  };

  const handleApplySelection = () => {
    if (selectedMedia.length === 0) {
      toast({
        title: "No media selected",
        description: "Please select at least one media item to apply.",
        variant: "destructive"
      });
      return;
    }
    
    onMediaSelected(selectedMedia);
    setIsOpen(false);
    setResults(null);
    setSelectedMedia([]);
    toast({
      title: "Media applied",
      description: `${selectedMedia.length} media items added to your tool gallery.`
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getTypeColor = (type: string) => {
    const colors = {
      homepage: "bg-blue-100 text-blue-800",
      pricing: "bg-green-100 text-green-800", 
      features: "bg-purple-100 text-purple-800",
      dashboard: "bg-orange-100 text-orange-800",
      demo: "bg-pink-100 text-pink-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getViewportIcon = (viewport: string) => {
    switch (viewport) {
      case 'desktop': return '🖥️';
      case 'tablet': return '📱';
      case 'mobile': return '📱';
      default: return '🖥️';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={className}
          disabled={disabled || !websiteUrl}
          onClick={() => {
            setIsOpen(true);
            if (!results) {
              discoverMedia();
            }
          }}
        >
          <Camera className="w-4 h-4 mr-2" />
          Auto-Discover Media
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Media Discovery Results</DialogTitle>
          <DialogDescription>
            Automatically discovered screenshots and videos from {websiteUrl}. Select the best content for your tool gallery.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <div className="text-center">
              <div className="font-medium">Discovering media content...</div>
              <div className="text-sm text-gray-500 mt-1">This may take a few moments</div>
            </div>
          </div>
        )}

        {results && !isLoading && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-medium">{results.totalFound}</span> items found
                </div>
                <div className="text-sm">
                  <span className="font-medium">{selectedMedia.length}</span> selected
                </div>
              </div>
              <Button onClick={handleApplySelection} disabled={selectedMedia.length === 0}>
                Apply Selected ({selectedMedia.length})
              </Button>
            </div>

            {/* Recommended Selection */}
            {(results.bestScreenshots.length > 0 || results.bestVideos.length > 0) && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Recommended Selection
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.bestScreenshots.map((screenshot, index) => (
                    <Card 
                      key={`best-screenshot-${index}`} 
                      className={`cursor-pointer transition-all ${
                        selectedMedia.includes(screenshot.url) 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => toggleMediaSelection(screenshot.url)}
                    >
                      <CardContent className="p-3">
                        <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                          <img 
                            src={screenshot.url} 
                            alt={screenshot.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Failed to load screenshot:', screenshot.url);
                              // Try Microlink fallback if original fails
                              const img = e.target as HTMLImageElement;
                              if (!img.src.includes('api.microlink.io') && !img.src.includes('placeholder')) {
                                const originalUrl = new URL(screenshot.url).searchParams.get('url');
                                if (originalUrl) {
                                  img.src = `https://api.microlink.io/screenshot?url=${encodeURIComponent(originalUrl)}&viewport.width=300&viewport.height=200&viewport.deviceScaleFactor=1&waitFor=2000&type=png`;
                                  return;
                                }
                              }
                              img.src = '/api/placeholder/300/200';
                            }}
                            crossOrigin="anonymous"
                            onLoad={() => {
                              console.log('Successfully loaded screenshot:', screenshot.url);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="font-medium text-sm truncate">{screenshot.title}</div>
                          <div className="flex flex-wrap gap-1">
                            <Badge className={getTypeColor(screenshot.type)} variant="secondary">
                              {screenshot.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getViewportIcon(screenshot.viewport)} {screenshot.viewport}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {results.bestVideos.map((video, index) => (
                    <Card 
                      key={`best-video-${index}`} 
                      className={`cursor-pointer transition-all ${
                        selectedMedia.includes(video.url) 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => toggleMediaSelection(video.url)}
                    >
                      <CardContent className="p-3">
                        <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden relative">
                          <img 
                            src={video.thumbnail || '/api/placeholder/300/200'} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="w-8 h-8 text-white drop-shadow-lg" />
                          </div>
                          {video.duration && (
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                              {video.duration}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="font-medium text-sm truncate">{video.title}</div>
                          <div className="flex flex-wrap gap-1">
                            <Badge className="bg-red-100 text-red-800" variant="secondary">
                              <Video className="w-3 h-3 mr-1" />
                              {video.source}
                            </Badge>
                            <Badge className={getConfidenceColor(video.confidence)}>
                              {Math.round(video.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Results */}
            <Tabs defaultValue="screenshots" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="screenshots" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Screenshots ({results.screenshots.length})
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Videos ({results.videos.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="screenshots" className="space-y-4">
                {results.screenshots.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.screenshots.map((screenshot, index) => (
                      <Card 
                        key={index} 
                        className={`cursor-pointer transition-all ${
                          selectedMedia.includes(screenshot.url) 
                            ? 'ring-2 ring-blue-500 bg-blue-50' 
                            : 'hover:shadow-md'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="aspect-video bg-gray-100 rounded mb-3 overflow-hidden">
                            <img 
                              src={screenshot.url} 
                              alt={screenshot.title}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => toggleMediaSelection(screenshot.url)}
                              onError={(e) => {
                                console.error('Failed to load detailed screenshot:', screenshot.url);
                                // Try Microlink fallback if original fails
                                const img = e.target as HTMLImageElement;
                                if (!img.src.includes('api.microlink.io') && !img.src.includes('placeholder')) {
                                  const originalUrl = new URL(screenshot.url).searchParams.get('url');
                                  if (originalUrl) {
                                    img.src = `https://api.microlink.io/screenshot?url=${encodeURIComponent(originalUrl)}&viewport.width=400&viewport.height=300&viewport.deviceScaleFactor=1&waitFor=2000&type=png`;
                                    return;
                                  }
                                }
                                img.src = '/api/placeholder/400/300';
                              }}
                              crossOrigin="anonymous"
                              onLoad={() => {
                                console.log('Successfully loaded detailed screenshot:', screenshot.url);
                              }}
                            />
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="font-medium text-sm mb-1">{screenshot.title}</div>
                              <div className="text-xs text-gray-600">{screenshot.description}</div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={getTypeColor(screenshot.type)}>
                                {screenshot.type}
                              </Badge>
                              <Badge variant="outline">
                                {getViewportIcon(screenshot.viewport)} {screenshot.viewport}
                              </Badge>
                              <Badge className={getConfidenceColor(screenshot.confidence)}>
                                {Math.round(screenshot.confidence * 100)}%
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(screenshot.url, '_blank');
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={selectedMedia.includes(screenshot.url) ? "default" : "outline"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMediaSelection(screenshot.url);
                                }}
                                className="flex-1"
                              >
                                {selectedMedia.includes(screenshot.url) ? 'Selected' : 'Select'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No screenshots found</h3>
                    <p className="text-gray-600">Could not capture screenshots for this website.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="videos" className="space-y-4">
                {results.videos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.videos.map((video, index) => (
                      <Card 
                        key={index} 
                        className={`cursor-pointer transition-all ${
                          selectedMedia.includes(video.url) 
                            ? 'ring-2 ring-blue-500 bg-blue-50' 
                            : 'hover:shadow-md'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="aspect-video bg-gray-100 rounded mb-3 overflow-hidden relative">
                            <img 
                              src={video.thumbnail || '/api/placeholder/400/300'} 
                              alt={video.title}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => toggleMediaSelection(video.url)}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="w-12 h-12 text-white drop-shadow-lg" />
                            </div>
                            {video.duration && (
                              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                {video.duration}
                              </div>
                            )}
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="font-medium text-sm mb-1 line-clamp-2">{video.title}</div>
                              <div className="text-xs text-gray-600 line-clamp-2">{video.description}</div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge className="bg-red-100 text-red-800">
                                <Video className="w-3 h-3 mr-1" />
                                {video.source}
                              </Badge>
                              <Badge className={getConfidenceColor(video.confidence)}>
                                {Math.round(video.confidence * 100)}%
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(video.url, '_blank');
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={selectedMedia.includes(video.url) ? "default" : "outline"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMediaSelection(video.url);
                                }}
                                className="flex-1"
                              >
                                {selectedMedia.includes(video.url) ? 'Selected' : 'Select'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No videos found</h3>
                    <p className="text-gray-600">Could not find any relevant videos for this tool.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* No Results */}
            {results.totalFound === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-xl mb-2">No media found</h3>
                <p className="text-gray-600 mb-4">
                  Could not find any screenshots or videos for this website.
                </p>
                <p className="text-sm text-gray-500">
                  You can add media manually or try a different URL.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}