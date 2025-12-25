/**
 * Idea Edit Page
 * Page for editing existing hackathon ideas
 */

import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { IdeaForm } from '../../components/ideas/IdeaForm';
import { useIdeaDetails } from '../../hooks/useIdeas';
import { Button } from '../../components/ui/button';
import type { Idea } from '../../types/idea';

export function IdeaEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useIdeaDetails(id!);

  const handleSuccess = (idea: Idea) => {
    navigate(`/ideas/${idea.id}`);
  };

  const handleCancel = () => {
    navigate(`/ideas/${id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Idea Not Found</h2>
          <p className="text-gray-600 mb-4">
            The idea you're trying to edit doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/ideas')}>Back to Ideas</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Idea</h1>
          <p className="text-gray-600 mt-2">
            Update your hackathon idea. Changes to the description will trigger AI re-enhancement
            for better discoverability.
          </p>
        </div>

        <IdeaForm idea={data.data} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}
