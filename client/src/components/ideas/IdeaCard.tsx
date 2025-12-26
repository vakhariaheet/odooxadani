import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Clock, Users, Lightbulb, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import type { Idea } from '../../types/idea';
import { COMPLEXITY_LEVELS, TIME_COMMITMENTS } from '../../types/idea';
import { formatDistanceToNow } from 'date-fns';

interface IdeaCardProps {
  idea: Idea;
  onEdit?: (idea: Idea) => void;
  onDelete?: (idea: Idea) => void;
  showActions?: boolean;
}

export const IdeaCard = ({ idea, onEdit, onDelete, showActions = false }: IdeaCardProps) => {
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
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/ideas/${idea.id}`} className="flex-1 hover:text-primary transition-colors">
            <h3 className="font-semibold text-lg line-clamp-2 leading-tight">{idea.title}</h3>
          </Link>

          {showActions && isOwner && (
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(idea)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(idea)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className={complexityColor[idea.complexityLevel]}>
            <Lightbulb className="w-3 h-3 mr-1" />
            {getComplexityLabel(idea.complexityLevel)}
          </Badge>

          <Badge variant="outline" className={statusColor[idea.status]}>
            {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{idea.description}</p>

        <div className="space-y-3">
          {/* Tech Stack */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Tech Stack</p>
            <div className="flex flex-wrap gap-1">
              {idea.techStack.slice(0, 4).map((tech, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {idea.techStack.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{idea.techStack.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          {/* Tags */}
          {idea.tags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Tags</p>
              <div className="flex flex-wrap gap-1">
                {idea.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {idea.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{idea.tags.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{idea.teamSizeNeeded} members</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{getTimeCommitmentLabel(idea.timeCommitment)}</span>
            </div>
          </div>

          <div className="text-right">
            <p>Created {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}</p>
            {idea.updatedAt !== idea.createdAt && (
              <p className="text-xs">
                Updated {formatDistanceToNow(new Date(idea.updatedAt), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
