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
  Trash2,
  GripVertical,
  AlertCircle
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
  onGalleryChange: (gallery: string[]) => void;
  onVideosChange: (videos: VideoData[]) => void;
}

export function GalleryManager({
  toolId,
  toolUrl,
  toolName,
  gallery,
  videos,
  onGalleryChange,
  onVideosChange
}: GalleryManagerProps) {
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ type: 'image' | 'video', url: string, title?: string } | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const { toast } = useToast();

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const captureScreenshot = async () => {
    if (!imageUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to capture screenshot",
        variant: "destructive"
      });
      return;
    }

    if (!validateUrl(imageUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    setIsCapturingScreenshot(true);
    try {
      const response = await apiRequest("POST", "/api/media/capture-screenshots", {
        websiteUrl: imageUrl.trim(),
        toolName: toolName
      });

      if (response.ok) {
        const data = await response.json();
        if (data.screenshots && data.screenshots.length > 0) {
          const newScreenshot = data.screenshots[0].url;
          onGalleryChange([...gallery, newScreenshot]);
          setImageUrl("");
          toast({
            title: "Screenshot Captured",
            description: "Screenshot successfully captured and added to gallery"
          });
        } else {
          throw new Error("No screenshot was captured");
        }
      } else {
        throw new Error("Failed to capture screenshot");
      }
    } catch (error) {
      toast({
        title: "Screenshot Capture Failed", 
        description: error instanceof Error ? error.message : "Failed to capture screenshot",
        variant: "destructive"
      });
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  const addImageUrl = () => {
    if (!imageUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter an image URL",
        variant: "destructive"
      });
      return;
    }

    if (!validateUrl(imageUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    onGalleryChange([...gallery, imageUrl.trim()]);
    setImageUrl("");
    toast({
      title: "Image Added",
      description: "Image URL added to gallery"
    });
  };

  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const addVideoUrl = () => {
    if (!videoUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a YouTube video URL",
        variant: "destructive"
      });
      return;
    }

    if (!validateUrl(videoUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    const youtubeId = extractYouTubeId(videoUrl);
    if (!youtubeId) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube video URL",
        variant: "destructive"
      });
      return;
    }

    const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    
    const newVideo: VideoData = {
      id: youtubeId,
      url: embedUrl,
      title: `YouTube Video ${youtubeId}`,
      thumbnail: thumbnailUrl,
      source: 'youtube'
    };

    onVideosChange([...videos, newVideo]);
    setVideoUrl("");
    toast({
      title: "Video Added",
      description: "YouTube video added to gallery"
    });
  };

  const removeImage = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    onGalleryChange(newGallery);
    toast({
      title: "Image Removed",
      description: "Image removed from gallery"
    });
  };

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index);
    onVideosChange(newVideos);
    toast({
      title: "Video Removed",
      description: "Video removed from gallery"
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newGallery = [...gallery];
    const [movedItem] = newGallery.splice(fromIndex, 1);
    newGallery.splice(toIndex, 0, movedItem);
    onGalleryChange(newGallery);
  };

  const moveVideo = (fromIndex: number, toIndex: number) => {
    const newVideos = [...videos];
    const [movedItem] = newVideos.splice(fromIndex, 1);
    newVideos.splice(toIndex, 0, movedItem);
    onVideosChange(newVideos);
  };

  return (
    <div className="space-y-8">
      {/* Screenshots Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Screenshots & Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter URL to capture screenshot or add image..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={captureScreenshot}
              disabled={isCapturingScreenshot}
              className="flex items-center gap-2"
            >
              {isCapturingScreenshot ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              Capture
            </Button>
            <Button 
              onClick={addImageUrl}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add URL
            </Button>
          </div>

          {gallery.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No screenshots added yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <Card>
                    <CardContent className="p-3">
                      <div className="relative">
                        <img
                          src={imageUrl}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-32 object-cover rounded cursor-pointer"
                          onClick={() => setPreviewMedia({ type: 'image', url: imageUrl })}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewMedia({ type: 'image', url: imageUrl })}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-4 h-4 text-white cursor-move" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
            <Video className="w-5 h-5" />
            YouTube Videos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter YouTube video URL..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={addVideoUrl}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Video
            </Button>
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No videos added yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((video, index) => (
                <div key={video.id} className="relative group">
                  <Card>
                    <CardContent className="p-3">
                      <div className="relative">
                        <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                          {video.thumbnail ? (
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => setPreviewMedia({ type: 'video', url: video.url, title: video.title })}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Youtube className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPreviewMedia({ type: 'video', url: video.url, title: video.title })}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeVideo(index)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-4 h-4 text-white cursor-move" />
                        </div>
                      </div>
                      <p className="text-sm mt-2 truncate">{video.title}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Dialog open={!!previewMedia} onOpenChange={() => setPreviewMedia(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {previewMedia?.type === 'image' ? 'Image Preview' : 'Video Preview'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewMedia?.type === 'image' ? (
              <img
                src={previewMedia.url}
                alt="Preview"
                className="w-full max-h-96 object-contain rounded"
              />
            ) : previewMedia?.type === 'video' ? (
              <div className="aspect-video">
                <iframe
                  src={previewMedia.url}
                  title={previewMedia.title}
                  className="w-full h-full rounded"
                  allowFullScreen
                />
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}