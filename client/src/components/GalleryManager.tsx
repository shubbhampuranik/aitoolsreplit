import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Image, 
  Video, 
  Camera, 
  Upload, 
  X, 
  Eye, 
  Loader2, 
  Youtube,
  ExternalLink,
  Plus,
  Trash2
} from "lucide-react";

interface VideoData {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  source: 'youtube' | 'vimeo' | 'embedded';
}

interface GalleryManagerProps {
  toolId: string;
  toolUrl: string;
  toolName: string;
  gallery: string[];
  videos: VideoData[];
  onGalleryUpdate: (gallery: string[]) => void;
  onVideosUpdate: (videos: VideoData[]) => void;
}

export function GalleryManager({
  toolId,
  toolUrl,
  toolName,
  gallery,
  videos,
  onGalleryUpdate,
  onVideosUpdate
}: GalleryManagerProps) {
  const [isCapturingScreenshots, setIsCapturingScreenshots] = useState(false);
  const [isDiscoveringVideos, setIsDiscoveringVideos] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ type: 'image' | 'video', url: string, title?: string } | null>(null);
  const [uploadUrl, setUploadUrl] = useState("");
  const { toast } = useToast();

  const captureScreenshots = async () => {
    setIsCapturingScreenshots(true);
    try {
      const response = await apiRequest("POST", "/api/media/capture-screenshots", {
        url: toolUrl,
        toolId: toolId
      });

      if (response.ok) {
        const data = await response.json();
        const newScreenshots = data.screenshots.map((s: any) => s.url);
        onGalleryUpdate([...gallery, ...newScreenshots]);
        toast({
          title: "Screenshots Captured",
          description: `Successfully captured ${newScreenshots.length} screenshots`
        });
      } else {
        throw new Error("Failed to capture screenshots");
      }
    } catch (error) {
      toast({
        title: "Screenshot Capture Failed",
        description: error instanceof Error ? error.message : "Failed to capture screenshots",
        variant: "destructive"
      });
    } finally {
      setIsCapturingScreenshots(false);
    }
  };

  const discoverVideos = async () => {
    setIsDiscoveringVideos(true);
    try {
      const response = await apiRequest("POST", "/api/media/discover-videos", {
        toolName: toolName,
        toolUrl: toolUrl,
        description: `AI tool for ${toolName}`
      });

      if (response.ok) {
        const data = await response.json();
        onVideosUpdate(data.videos);
        toast({
          title: "Videos Discovered",
          description: `Found ${data.videos.length} relevant videos`
        });
      } else {
        throw new Error("Failed to discover videos");
      }
    } catch (error) {
      toast({
        title: "Video Discovery Failed",
        description: error instanceof Error ? error.message : "Failed to discover videos",
        variant: "destructive"
      });
    } finally {
      setIsDiscoveringVideos(false);
    }
  };

  const addImageUrl = () => {
    if (uploadUrl.trim()) {
      onGalleryUpdate([...gallery, uploadUrl.trim()]);
      setUploadUrl("");
      toast({
        title: "Image Added",
        description: "Image URL added to gallery"
      });
    }
  };

  const removeImage = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    onGalleryUpdate(newGallery);
  };

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index);
    onVideosUpdate(newVideos);
  };

  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-6">
      {/* Screenshot Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Screenshots
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={captureScreenshots}
              disabled={isCapturingScreenshots}
              className="flex items-center gap-2"
            >
              {isCapturingScreenshots ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              Capture Screenshots
            </Button>
            
            <div className="flex gap-2 flex-1 min-w-[300px]">
              <Input
                placeholder="Or paste image URL..."
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
              />
              <Button onClick={addImageUrl} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {gallery.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPreviewMedia({ type: 'image', url: imageUrl })}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Videos Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5" />
            Videos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={discoverVideos}
            disabled={isDiscoveringVideos}
            className="flex items-center gap-2"
          >
            {isDiscoveringVideos ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Video className="w-4 h-4" />
            )}
            Discover Relevant Videos
          </Button>

          {videos.length > 0 && (
            <div className="space-y-4">
              {videos.map((video, index) => {
                const youtubeId = extractYouTubeId(video.url);
                return (
                  <div key={video.id || index} className="border rounded-lg p-4">
                    <div className="flex gap-4">
                      <div className="w-32 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {youtubeId ? (
                          <img
                            src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                        {video.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{video.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {video.source}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPreviewMedia({ 
                              type: 'video', 
                              url: video.url, 
                              title: video.title 
                            })}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(video.url, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeVideo(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Dialog open={!!previewMedia} onOpenChange={() => setPreviewMedia(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {previewMedia?.type === 'image' ? 'Image Preview' : 'Video Preview'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {previewMedia?.type === 'image' ? (
              <img
                src={previewMedia.url}
                alt="Preview"
                className="max-w-full max-h-[60vh] object-contain"
              />
            ) : previewMedia?.type === 'video' && previewMedia.url ? (
              <div className="w-full aspect-video">
                {extractYouTubeId(previewMedia.url) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(previewMedia.url)}`}
                    className="w-full h-full"
                    allowFullScreen
                    title={previewMedia.title || 'Video Preview'}
                  />
                ) : (
                  <video
                    src={previewMedia.url}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}