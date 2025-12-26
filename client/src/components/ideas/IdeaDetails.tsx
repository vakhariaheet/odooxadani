import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  Users,
  Lightbulb,
  Edit,
  Trash2,
  Calendar,
  User,
  Target,
  Wrench,
  Tag,
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import type { Idea } from '../../types/idea';
import { COMPLEXITY_LEVELS, TIME_COMMITMENTS } from '../../types/idea';
import { formatDistanceToNow, format } from 'date-fns';

interface IdeaDetailsProps {
  idea: Idea;
  onEdit?: (idea: Idea) => void;
  onDelete?: (idea: Idea) => void;
  showActions?: boolean;
}

export const IdeaDetails = ({ idea, onEdit, onDelete, showActions = true }: IdeaDetailsProps) => {
  const { userId } = useAuth();
  const isOwner = userId === idea.creatorId;

  const complexityColor = {
    beginner: 'bg-green-100 text-green-800 border-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    advanced: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusColor = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    published: 'bg-blue-100 text-blue-800 border-blue-200',
    archived: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  const getComplexityLabel = (level: string) => {
    return COMPLEXITY_LEVELS.find((c) => c.value === level)?.label || level;
  };

  const getTimeCommitmentLabel = (commitment: string) => {
    return TIME_COMMITMENTS.find((t) => t.value === commitment)?.label || commitment;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{idea.title}</h1>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className={complexityColor[idea.complexityLevel]}>
              <Lightbulb className="w-3 h-3 mr-1" />
              {getComplexityLabel(idea.complexityLevel)}
            </Badge>

            <Badge variant="outline" className={statusColor[idea.status]}>
              {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
            </Badge>

            <Badge variant="outline">
              <Users className="w-3 h-3 mr-1" />
              {idea.teamSizeNeeded} members needed
            </Badge>

            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              {getTimeCommitmentLabel(idea.timeCommitment)}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Created {format(new Date(idea.createdAt), 'MMM d, yyyy')}</span>
            </div>

            {idea.updatedAt !== idea.createdAt && (
              <div className="flex items-center gap-1">
                <span>
                  Updated {formatDistanceToNow(new Date(idea.updatedAt), { addSuffix: true })}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>Creator ID: {idea.creatorId}</span>
            </div>
          </div>
        </div>

        {showActions && isOwner && (
          <div className="flex gap-2">
            {onEdit && (
              <Button onClick={() => onEdit(idea)} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => onDelete(idea)}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{idea.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Problem Statement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Problem Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{idea.problemStatement}</p>
              </div>
            </CardContent>
          </Card>

          {/* Proposed Solution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Proposed Solution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{idea.proposedSolution}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tech Stack */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tech Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {idea.techStack.map((tech, index) => (
                  <Badge key={index} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {idea.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="w-4 h-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {idea.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Team Size</span>
                <Badge variant="outline">
                  <Users className="w-3 h-3 mr-1" />
                  {idea.teamSizeNeeded} members
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Complexity</span>
                <Badge variant="outline" className={complexityColor[idea.complexityLevel]}>
                  {getComplexityLabel(idea.complexityLevel)}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Time Commitment</span>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  {getTimeCommitmentLabel(idea.timeCommitment)}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status</span>
                <Badge variant="outline" className={statusColor[idea.status]}>
                  {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          {!isOwner && idea.status === 'published' && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Interested?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This idea is looking for {idea.teamSizeNeeded} team members. Join the team and
                  help bring this idea to life!
                </p>
                <Button className="w-full">Join Team</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
