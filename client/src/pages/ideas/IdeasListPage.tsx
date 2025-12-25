/**
 * Ideas List Page
 * Main page for browsing and discovering hackathon ideas
 */

import { useNavigate } from 'react-router-dom';
import { IdeaList } from '../../components/ideas/IdeaList';
import type { Idea } from '../../types/idea';

export function IdeasListPage() {
  const navigate = useNavigate();

  const handleCreateIdea = () => {
    navigate('/ideas/new');
  };

  const handleEditIdea = (idea: Idea) => {
    navigate(`/ideas/${idea.id}/edit`);
  };

  const handleViewIdea = (idea: Idea) => {
    navigate(`/ideas/${idea.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <IdeaList
        onCreateIdea={handleCreateIdea}
        onEditIdea={handleEditIdea}
        onViewIdea={handleViewIdea}
      />
    </div>
  );
}
