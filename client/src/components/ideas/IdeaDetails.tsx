/**
 * IdeaDetails Component
 * Displays full details of an idea with voting and actions
 */

import { useState } from 'react';
import {
  Heart,
  Users,
  Clock,
  Tag,
  TrendingUp,
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { useVoteIdea, useDeleteIdea } from '../../hooks/useIdeas';
import { useUser } from '@clerk/clerk-react';
import type { Idea } from '../../types/idea';
import { getCategoryLabel, getDifficultyLabel, formatDateTime } from '../../types/idea';
import { toast } from 'sonner';

interface IdeaDetailsProps {
  idea: Idea;
  onEdit?: (idea: Idea) => void;
  onBack?: () => void;
  onDelete?: () => void;
}

export function IdeaDetails({ idea, onEdit, onBack, onDelete }: IdeaDetailsProps) {
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
    if (!confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteIdea.mutateAsync(idea.id);
      toast.success('Idea deleted successfully');
      onDelete?.();
    } catch (error) {
      toast.error('Failed to delete idea');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFeasibilityColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFeasibilityLabel = (score: number) => {
    if (score >= 8) return 'Highly Feasible';
    if (score >= 6) return 'Moderately Feasible';
    if (score >= 4) return 'Challenging';
    return 'Very Challenging';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Ideas
          </Button>
        )}

        {isOwner && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onEdit?.(idea)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleteIdea.isPending}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="text-sm">
              {getCategoryLabel(idea.category)}
            </Badge>
            <Badge className={`text-sm ${getDifficultyColor(idea.difficulty)}`}>
              {getDifficultyLabel(idea.difficulty)}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {idea.status}
            </Badge>
          </div>

          <CardTitle className="text-2xl font-bold text-gray-900 leading-tight">
            {idea.title}
          </CardTitle>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>by {idea.authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDateTime(idea.createdAt)}</span>
            </div>
            {idea.updatedAt !== idea.createdAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Updated {formatDateTime(idea.updatedAt)}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {idea.description}
              </p>
            </div>
          </div>

          <Separator />

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Team Size */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Team Size</p>
                <p className="text-sm text-gray-600">{idea.teamSize} people</p>
              </div>
            </div>

            {/* Feasibility Score */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">AI Feasibility</p>
                <p className={`text-sm font-medium ${getFeasibilityColor(idea.feasibilityScore)}`}>
                  {idea.feasibilityScore}/10 - {getFeasibilityLabel(idea.feasibilityScore)}
                </p>
              </div>
            </div>

            {/* Votes */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Community Votes</p>
                <p className="text-sm text-gray-600">{idea.votes} votes</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {idea.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* AI Generated Tags */}
          {idea.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI-Generated Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {idea.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className="text-sm bg-purple-100 text-purple-800 border-purple-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Voting Section */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">Like this idea?</h3>
              <p className="text-sm text-gray-600">
                Vote to show your support and help others discover great ideas
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={userVote === 1 ? 'default' : 'outline'}
                onClick={() => handleVote(1)}
                disabled={voteIdea.isPending || !user}
                className="flex items-center gap-2"
              >
                <Heart className={`h-4 w-4 ${userVote === 1 ? 'fill-current' : ''}`} />
                Upvote ({idea.votes})
              </Button>

              {userVote !== 1 && (
                <Button
                  variant={userVote === -1 ? 'default' : 'outline'}
                  onClick={() => handleVote(-1)}
                  disabled={voteIdea.isPending || !user}
                  className="flex items-center gap-2"
                >
                  <Heart
                    className={`h-4 w-4 rotate-180 ${userVote === -1 ? 'fill-current' : ''}`}
                  />
                  Downvote
                </Button>
              )}
            </div>
          </div>

          {!user && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                <a href="/sign-in" className="font-medium hover:underline">
                  Sign in
                </a>{' '}
                to vote on ideas and submit your own!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
