import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sparkles, Loader2 } from 'lucide-react';
import { useEnhanceIdea } from '../../hooks/useIdeas';
import type { EnhanceIdeaResponse } from '../../types/idea';

interface IdeaEnhancementButtonProps {
  description: string;
  onEnhanced: (result: EnhanceIdeaResponse) => void;
  disabled?: boolean;
}

export const IdeaEnhancementButton = ({
  description,
  onEnhanced,
  disabled = false,
}: IdeaEnhancementButtonProps) => {
  const [result, setResult] = useState<EnhanceIdeaResponse | null>(null);
  const enhanceIdea = useEnhanceIdea();

  const handleEnhance = async () => {
    if (!description.trim() || description.length < 50) {
      toast.error('Please write at least 50 characters before enhancing');
      return;
    }

    try {
      const enhancementResult = await enhanceIdea.mutateAsync({
        description: description.trim(),
        complexityLevel: 'intermediate',
      });

      setResult(enhancementResult);
    } catch (error) {
      console.error('Enhancement error:', error);
      // Error is already handled by the mutation hook
    }
  };

  const acceptEnhancement = () => {
    if (result) {
      onEnhanced(result);
      setResult(null);
      toast.success('Idea enhanced successfully!');
    }
  };

  return (
    <div className="enhancement-section">
      <Button
        type="button"
        onClick={handleEnhance}
        disabled={disabled || enhanceIdea.isPending || description.length < 50}
        variant="outline"
        size="sm"
        className="ml-2"
      >
        {enhanceIdea.isPending ? (
          <>
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Enhancing...
          </>
        ) : (
          <>
            <Sparkles className="w-3 h-3 mr-1" />
            Enhance with AI
          </>
        )}
      </Button>

      {result && (
        <div className="mt-4 p-4 bg-muted rounded-lg border">
          <div className="text-sm font-medium mb-2">
            AI Enhancement (confidence: {Math.round(result.confidence * 100)}%)
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Enhanced Description:</div>
              <div className="text-sm p-2 bg-background rounded border">
                {result.enhancedDescription}
              </div>
            </div>

            {result.suggestedTechStack.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Suggested Tech Stack:</div>
                <div className="flex flex-wrap gap-1">
                  {result.suggestedTechStack.map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.recommendedTeamRoles.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Recommended Team Roles:</div>
                <div className="text-sm">{result.recommendedTeamRoles.join(', ')}</div>
              </div>
            )}

            {result.improvementSuggestions.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Improvement Suggestions:</div>
                <ul className="text-sm space-y-1">
                  {result.improvementSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-muted-foreground mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={acceptEnhancement}>
              Use Enhancement
            </Button>
            <Button size="sm" variant="outline" onClick={() => setResult(null)}>
              Dismiss
            </Button>
            <Button size="sm" variant="ghost" onClick={handleEnhance}>
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
