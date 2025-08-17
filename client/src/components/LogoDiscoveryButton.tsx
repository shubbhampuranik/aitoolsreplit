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
import { Loader2, Image, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LogoResult {
  url: string;
  confidence: number;
  source: 'favicon' | 'meta' | 'og' | 'logo-element' | 'brand-asset';
  size?: { width: number; height: number };
}

interface LogoDiscoveryResult {
  logos: LogoResult[];
  bestLogo: LogoResult | null;
  totalFound: number;
}

interface LogoDiscoveryButtonProps {
  websiteUrl: string;
  onLogoSelected: (logoUrl: string) => void;
  className?: string;
  disabled?: boolean;
}

export function LogoDiscoveryButton({ 
  websiteUrl, 
  onLogoSelected, 
  className,
  disabled 
}: LogoDiscoveryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<LogoDiscoveryResult | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const { toast } = useToast();

  const discoverLogos = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      const response = await apiRequest("POST", "/api/ai/discover-logo", {
        url: websiteUrl
      });
      
      if (!response.ok) {
        throw new Error("Failed to discover logos");
      }
      
      const data = await response.json();
      setResults(data);
      
      if (data.totalFound === 0) {
        toast({
          title: "No logos found",
          description: "Could not find any logos for this website. You can add one manually.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Logos discovered",
          description: `Found ${data.totalFound} logo options. Select the best one.`
        });
      }
    } catch (error) {
      console.error("Error discovering logos:", error);
      toast({
        title: "Discovery failed",
        description: "Failed to discover logos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoSelect = (logoUrl: string) => {
    setSelectedLogo(logoUrl);
    onLogoSelected(logoUrl);
    setIsOpen(false);
    toast({
      title: "Logo selected",
      description: "Logo has been automatically applied to your tool."
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getSourceLabel = (source: string) => {
    const labels = {
      'favicon': 'Favicon',
      'meta': 'Meta Tag',
      'og': 'Open Graph',
      'logo-element': 'Logo Element',
      'brand-asset': 'Brand Asset'
    };
    return labels[source as keyof typeof labels] || source;
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
              discoverLogos();
            }
          }}
        >
          <Image className="w-4 h-4 mr-2" />
          Auto-Discover Logo
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Logo Discovery Results</DialogTitle>
          <DialogDescription>
            Automatically discovered logos from {websiteUrl}. Select the best option for your tool.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Discovering logos...</span>
          </div>
        )}

        {results && !isLoading && (
          <div className="space-y-6">
            {/* Best Logo Recommendation */}
            {results.bestLogo && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Recommended Logo
                </h3>
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={results.bestLogo.url} 
                          alt="Recommended logo"
                          className="w-16 h-16 object-contain bg-white border rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getConfidenceColor(results.bestLogo.confidence)}>
                            {Math.round(results.bestLogo.confidence * 100)}% confidence
                          </Badge>
                          <Badge variant="outline">
                            {getSourceLabel(results.bestLogo.source)}
                          </Badge>
                          {results.bestLogo.size && (
                            <Badge variant="outline">
                              {results.bestLogo.size.width}×{results.bestLogo.size.height}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {results.bestLogo.url}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(results.bestLogo!.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleLogoSelect(results.bestLogo!.url)}
                        >
                          Use This Logo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* All Logo Options */}
            {results.logos.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  All Options ({results.totalFound} found)
                </h3>
                <div className="grid gap-3">
                  {results.logos.map((logo, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img 
                              src={logo.url} 
                              alt={`Logo option ${index + 1}`}
                              className="w-12 h-12 object-contain bg-white border rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={getConfidenceColor(logo.confidence)}>
                                {Math.round(logo.confidence * 100)}%
                              </Badge>
                              <Badge variant="outline">
                                {getSourceLabel(logo.source)}
                              </Badge>
                              {logo.size && (
                                <Badge variant="outline">
                                  {logo.size.width}×{logo.size.height}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 truncate">
                              {logo.url}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(logo.url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLogoSelect(logo.url)}
                            >
                              Select
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {results.totalFound === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No logos found</h3>
                <p className="text-gray-600">
                  Could not find any logos for this website. You can add one manually 
                  or try a different URL.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}