import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { IdeaForm } from '../../components/ideas/IdeaForm';
import { useCreateIdea } from '../../hooks/useIdeas';
import type { CreateIdeaRequest, UpdateIdeaRequest } from '../../types/idea';

export const IdeaCreatePage = () => {
  const navigate = useNavigate();
  const createIdea = useCreateIdea();

  const handleSubmit = async (data: CreateIdeaRequest | UpdateIdeaRequest) => {
    try {
      const newIdea = await createIdea.mutateAsync(data as CreateIdeaRequest);
      navigate(`/ideas/${newIdea.id}`);
    } catch (error) {
      // Error is handled by the mutation hook
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/ideas');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/ideas')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Ideas
        </Button>

        <h1 className="text-3xl font-bold">Create New Idea</h1>
        <p className="text-muted-foreground mt-2">
          Share your innovative idea and find teammates to bring it to life.
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Idea Details</CardTitle>
        </CardHeader>
        <CardContent>
          <IdeaForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createIdea.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};
