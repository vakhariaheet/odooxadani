import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Eye, Edit, Trash2, Copy, Users } from 'lucide-react';
import type { Template, TemplateVariables } from '../../types/template';
import { TEMPLATE_CATEGORY_LABELS } from '../../types/template';
import { formatDistanceToNow } from 'date-fns';

interface TemplateCardProps {
  template: Template;
  isOwner?: boolean;
  onView?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onUse?: (template: Template, variables?: TemplateVariables) => void;
  className?: string;
}

export function TemplateCard({
  template,
  isOwner = false,
  onView,
  onEdit,
  onDelete,
  onUse,
  className = '',
}: TemplateCardProps) {
  const categoryLabel = TEMPLATE_CATEGORY_LABELS[template.category] || template.category;
  const createdAt = new Date(template.createdAt);
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">{template.name}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">{template.description}</CardDescription>
          </div>
          {template.isPublic && (
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              <Users className="w-3 h-3 mr-1" />
              Public
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline">{categoryLabel}</Badge>
          {template.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{template.tags.length - 2}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="text-sm text-muted-foreground space-y-1">
          <div>Variables: {template.variables.length}</div>
          <div>Used: {template.usageCount} times</div>
          <div>Created: {timeAgo}</div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center gap-2 w-full">
          <Button variant="outline" size="sm" onClick={() => onView?.(template)} className="flex-1">
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>

          {onUse && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onUse && onUse(template, {})}
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-1" />
              Use Template
            </Button>
          )}

          {isOwner && (
            <>
              <Button variant="outline" size="sm" onClick={() => onEdit?.(template)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete?.(template)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
