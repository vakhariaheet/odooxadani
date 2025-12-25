/**
 * Idea Details Page
 * Page for viewing full details of a specific idea
 */

import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { IdeaDetails } from '../../components/ideas/IdeaDetails';
import { useIdeaDetails } from '../../hooks/useIdeas';
import { Button } from '../../components/ui/button';
import type { Idea } from '../../types/idea';

export function IdeaDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useIdeaDetails(id!);

  const handleEdit = (idea: Idea) => {
    navigate(`/ideas/${idea.id}/edit`);
  };

  const handleBack = () => {
    navigate('/ideas');
  };

  const handleDelete = () => {
    navigate('/ideas');
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
            The idea you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={handleBack}>Back to Ideas</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <IdeaDetails
        idea={data.data}
        onEdit={handleEdit}
        onBack={handleBack}
        onDelete={handleDelete}
      />
    </div>
  );
}
