/**
 * AI Enhancement Hook
 * React hook for AI-powered content enhancement
 */

import { useMutation } from '@tanstack/react-query';
import { aiEnhancementApi, type EnhanceRequest } from '../services/aiEnhancementApi';
import { toast } from 'sonner';

export const useAiEnhancement = () => {
  return useMutation({
    mutationFn: (request: EnhanceRequest) => aiEnhancementApi.enhanceContent(request),
    onError: (error) => {
      console.error('AI Enhancement failed:', error);
      toast.error('Failed to enhance content. Please try again.');
    },
  });
};

export default useAiEnhancement;
