/**
 * Idea Create Page
 * Page for creating new hackathon ideas
 */

import { useNavigate } from 'react-router-dom';
import { IdeaForm } from '../../components/ideas/IdeaForm';
import type { Idea } from '../../types/idea';

export function IdeaCreatePage() {
  const navigate = useNavigate();

  const handleSuccess = (idea: Idea) => {
    navigate(`/ideas/${idea.id}`);
  };

  const handleCancel = () => {
    navigate('/ideas');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Submit Your Idea</h1>
          <p className="text-gray-600 mt-2">
            Share your innovative hackathon idea with the community. Our AI will help enhance your
            description and suggest relevant tags to make it more discoverable.
          </p>
        </div>

        <IdeaForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}
