import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Wand2, Copy, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

interface QuickFixSuggestion {
  type: 'grammar' | 'clarity' | 'structure' | 'completeness' | 'optimization';
  original: string;
  improved: string;
  reason: string;
}

interface QuickFixResult {
  suggestions: QuickFixSuggestion[];
  improvedContent: string;
}

interface QuickFixButtonProps {
  content: string;
  contentType: 'description' | 'code' | 'features' | 'name' | 'pricing';
  onApplyFix?: (improvedContent: string) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

const typeColors = {
  grammar: 'bg-red-100 text-red-800 border-red-200',
  clarity: 'bg-blue-100 text-blue-800 border-blue-200', 
  structure: 'bg-purple-100 text-purple-800 border-purple-200',
  completeness: 'bg-orange-100 text-orange-800 border-orange-200',
  optimization: 'bg-green-100 text-green-800 border-green-200'
};

const typeLabels = {
  grammar: 'Grammar',
  clarity: 'Clarity',
  structure: 'Structure', 
  completeness: 'Completeness',
  optimization: 'Optimization'
};

export function QuickFixButton({ 
  content, 
  contentType, 
  onApplyFix, 
  className,
  variant = 'outline',
  size = 'sm'
}: QuickFixButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [quickFixResult, setQuickFixResult] = useState<QuickFixResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedImproved, setCopiedImproved] = useState(false);

  const generateQuickFixes = async () => {
    if (!content.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/tools/quick-fix', {
        content,
        contentType
      });
      
      const result = await response.json();
      if (result.success) {
        setQuickFixResult(result.data);
      }
    } catch (error) {
      console.error('Quick fix generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (index !== undefined) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        setCopiedImproved(true);
        setTimeout(() => setCopiedImproved(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const applyImprovement = () => {
    if (quickFixResult && onApplyFix) {
      onApplyFix(quickFixResult.improvedContent);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant={variant}
          size={size}
          onClick={generateQuickFixes}
          className={cn("flex items-center gap-2", className)}
          disabled={!content.trim()}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
          Quick Fix
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            AI Quick Fix Suggestions
          </DialogTitle>
        </DialogHeader>
        
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-3">Analyzing and generating improvements...</span>
          </div>
        ) : quickFixResult ? (
          <div className="space-y-6">
            {/* Improved Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-green-700">Improved Content</CardTitle>
                    <CardDescription>Complete enhanced version with all suggestions applied</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(quickFixResult.improvedContent)}
                    >
                      {copiedImproved ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedImproved ? 'Copied!' : 'Copy'}
                    </Button>
                    {onApplyFix && (
                      <Button
                        size="sm"
                        onClick={applyImprovement}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Apply Changes
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 whitespace-pre-wrap">{quickFixResult.improvedContent}</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Individual Suggestions */}
            {quickFixResult.suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Specific Improvements</CardTitle>
                  <CardDescription>Individual suggestions with explanations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quickFixResult.suggestions.map((suggestion, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={typeColors[suggestion.type]}>
                          {typeLabels[suggestion.type]}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(suggestion.improved, index)}
                        >
                          {copiedIndex === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          {copiedIndex === index ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Original:</h4>
                          <p className="bg-red-50 border border-red-200 rounded p-2 text-red-800 text-sm">
                            {suggestion.original}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Improved:</h4>
                          <p className="bg-green-50 border border-green-200 rounded p-2 text-green-800 text-sm">
                            {suggestion.improved}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Why this helps:</h4>
                          <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                        </div>
                      </div>
                      
                      {index < quickFixResult.suggestions.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Click "Quick Fix" to get AI-powered suggestions for improving your content.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}