/**
 * AI Enhancement Button Component
 * Provides AI-powered enhancement for text content with suggestions
 */

import { useState } from 'react';
import { Sparkles, Loader2, Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { useAiEnhancement } from '../../hooks/useAiEnhancement';
import type { EnhanceRequest } from '../../services/aiEnhancementApi';

interface AiEnhancementButtonProps {
  type: 'title' | 'description';
  content: string;
  context?: EnhanceRequest['context'];
  onEnhanced: (enhancedContent: string) => void;
  disabled?: boolean;
  className?: string;
}

export function AiEnhancementButton({
  type,
  content,
  context,
  onEnhanced,
  disabled = false,
  className = '',
}: AiEnhancementButtonProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const aiEnhancement = useAiEnhancement();

  const handleEnhance = async () => {
    if (!content.trim()) {
      return;
    }

    try {
      const response = await aiEnhancement.mutateAsync({
        type,
        content: content.trim(),
        context,
      });

      // Clean any markdown formatting from the enhanced content
      const cleanedContent = response.data.enhancedContent
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/`(.*?)`/g, '$1') // Remove code
        .replace(/#{1,6}\s/g, '') // Remove headers
        .replace(/^\s*[-*+]\s/gm, '• ') // Convert markdown lists to bullet points
        .trim();

      setEnhancedContent(cleanedContent);
      setSuggestions(response.data.suggestions);
      setShowSuggestions(true);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleAccept = () => {
    // Clean any remaining markdown from enhanced content
    const cleanedContent = enhancedContent
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove code
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/^\s*[-*+]\s/gm, '• ') // Convert markdown lists to bullet points
      .trim();

    onEnhanced(cleanedContent);
    setShowSuggestions(false);
    setEnhancedContent('');
    setSuggestions([]);
  };

  const handleReject = () => {
    setShowSuggestions(false);
    setEnhancedContent('');
    setSuggestions([]);
  };

  const isLoading = aiEnhancement.isPending;
  const canEnhance = content.trim().length > 0 && !disabled && !isLoading;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Enhancement Button */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleEnhance}
          disabled={!canEnhance}
          className="flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isLoading ? 'Enhancing...' : `AI Enhance ${type === 'title' ? 'Title' : 'Description'}`}
        </Button>
      </div>

      {/* Enhancement Results */}
      {showSuggestions && enhancedContent && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-purple-700">
              <Lightbulb className="h-4 w-4" />
              AI Enhancement Results
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Enhanced Content */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Enhanced {type === 'title' ? 'Title' : 'Description'}:
              </label>
              {type === 'title' ? (
                <div className="p-3 bg-white rounded-md border text-sm font-medium">
                  {enhancedContent}
                </div>
              ) : (
                <Textarea
                  value={enhancedContent}
                  onChange={(e) => setEnhancedContent(e.target.value)}
                  rows={6}
                  className="bg-white text-sm"
                  placeholder="Enhanced description..."
                />
              )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">
                  AI Improvements Applied:
                </label>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-gray-600">
                      <div className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAccept}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Accept Enhancement
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReject}
                className="flex-1"
              >
                Keep Original
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEnhance}
                disabled={isLoading}
                className="px-3"
                title="Generate new enhancement"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AiEnhancementButton;
