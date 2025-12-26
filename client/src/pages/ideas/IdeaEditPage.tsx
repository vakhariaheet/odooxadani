import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { IdeaForm } from '../../components/ideas/IdeaForm';
import { useIdea, useUpdateIdea } from '../../hooks/useIdeas';
import type { UpdateIdeaRequest } from '../../types/idea';

export const IdeaEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const updateIdea = useUpdateIdea();

  const { data: idea, isLoading, error } = useIdea(id);

  const handleSubmit = async (data: UpdateIdeaRequest) => {
    if (!id) return;

    try {
      const updatedIdea = await updateIdea.mutateAsync({ id, data });
      navigate(`/ideas/${updatedIdea.id}`);
    } catch (error) {
      // Error is handled by the mutation hook
      throw error;
    }
  };

  const handleCancel = () => {
    navigate(`/ideas/${id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading idea...</span>
        </div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error ? 'Failed to load idea' : 'Idea not found'}</p>
          <Button onClick={() => navigate('/ideas')} variant="outline">
            Back to Ideas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(`/ideas/${id}`)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Idea
        </Button>

        <h1 className="text-3xl font-bold">Edit Idea</h1>
        <p className="text-muted-foreground mt-2">
          Update your idea details and improve your pitch.
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Idea Details</CardTitle>
        </CardHeader>
        <CardContent>
          <IdeaForm
            idea={idea}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={updateIdea.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};
