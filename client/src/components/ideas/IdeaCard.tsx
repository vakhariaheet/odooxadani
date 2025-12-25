/**
 * IdeaCard Component
 * Displays an individual idea in a card format with voting functionality
 */

import { useState } from 'react';
import { Heart, Users, Clock, Tag, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useVoteIdea, useDeleteIdea } from '../../hooks/useIdeas';
import { useUser } from '@clerk/clerk-react';
import type { Idea } from '../../types/idea';
import { getCategoryLabel, getDifficultyLabel, formatDate } from '../../types/idea';
import { toast } from 'sonner';

interface IdeaCardProps {
  idea: Idea;
  onEdit?: (idea: Idea) => void;
  onView?: (idea: Idea) => void;
  showActions?: boolean;
}

export function IdeaCard({ idea, onEdit, onView, showActions = true }: IdeaCardProps) {
  const { user } = useUser();
  const [userVote, setUserVote] = useState<number | null>(null);

  const voteIdea = useVoteIdea();
  const deleteIdea = useDeleteIdea();

  const isOwner = user?.id === idea.authorId;

  const handleVote = async (vote: number) => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      await voteIdea.mutateAsync({ id: idea.id, vote });
      setUserVote(vote);
      toast.success(vote === 1 ? 'Upvoted!' : 'Downvoted!');
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this idea?')) {
      return;
    }

    try {
      await deleteIdea.mutateAsync(idea.id);
      toast.success('Idea deleted successfully');
    } catch (error) {
      toast.error('Failed to delete idea');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFeasibilityColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle
            className="text-lg font-semibold line-clamp-2 cursor-pointer hover:text-blue-600"
            onClick={() => onView?.(idea)}
          >
            {idea.title}
          </CardTitle>
          {showActions && isOwner && (
            <div className="flex gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(idea)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                disabled={deleteIdea.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary">{getCategoryLabel(idea.category)}</Badge>
          <Badge className={getDifficultyColor(idea.difficulty)}>
            {getDifficultyLabel(idea.difficulty)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">{idea.description}</p>

        <div className="space-y-3">
          {/* Skills */}
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <div className="flex flex-wrap gap-1">
              {idea.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {idea.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{idea.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* AI Tags */}
          {idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {idea.tags.slice(0, 4).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{idea.teamSize} people</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span className={getFeasibilityColor(idea.feasibilityScore)}>
                  {idea.feasibilityScore}/10
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(idea.createdAt)}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500">by {idea.authorName}</div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button
              variant={userVote === 1 ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleVote(1)}
              disabled={voteIdea.isPending}
              className="h-8"
            >
              <Heart className={`h-4 w-4 mr-1 ${userVote === 1 ? 'fill-current' : ''}`} />
              {idea.votes}
            </Button>

            {userVote !== 1 && (
              <Button
                variant={userVote === -1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote(-1)}
                disabled={voteIdea.isPending}
                className="h-8"
              >
                <Heart className={`h-4 w-4 rotate-180 ${userVote === -1 ? 'fill-current' : ''}`} />
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView?.(idea)}
            className="text-blue-600 hover:text-blue-700"
          >
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
