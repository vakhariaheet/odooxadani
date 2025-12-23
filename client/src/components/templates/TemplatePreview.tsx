import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Copy, Download, Eye, Edit3 } from 'lucide-react';
import type { Template, TemplateVariables } from '../../types/template';
import { replaceVariables, TEMPLATE_CATEGORY_LABELS } from '../../types/template';
import { formatDistanceToNow } from 'date-fns';

interface TemplatePreviewProps {
  template: Template | null;
  open: boolean;
  onClose: () => void;
  onUse?: (template: Template, variables: TemplateVariables) => void;
  onEdit?: (template: Template) => void;
  isOwner?: boolean;
}

export function TemplatePreview({
  template,
  open,
  onClose,
  onUse,
  onEdit,
  isOwner = false,
}: TemplatePreviewProps) {
  const [variables, setVariables] = useState<TemplateVariables>({});
  const [activeTab, setActiveTab] = useState('preview');

  if (!template) return null;

  const processedContent = replaceVariables(template.content, variables);
  const categoryLabel = TEMPLATE_CATEGORY_LABELS[template.category] || template.category;
  const createdAt = new Date(template.createdAt);
  const updatedAt = new Date(template.updatedAt);

  const handleVariableChange = (variableName: string, value: string) => {
    setVariables((prev) => ({
      ...prev,
      [variableName]: value,
    }));
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(processedContent);
      // You might want to show a toast notification here
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const handleUseTemplate = () => {
    if (onUse) {
      onUse(template, variables);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([processedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{template.name}</DialogTitle>
              <DialogDescription className="mt-1">{template.description}</DialogDescription>
            </div>
            <div className="flex gap-2">
              {isOwner && onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(template)}>
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleCopyContent}>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              {onUse && <Button onClick={handleUseTemplate}>Use Template</Button>}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview">
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="flex-1 overflow-hidden">
              <div className="h-full border rounded-md p-4 overflow-auto bg-muted/30">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {processedContent}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="variables" className="flex-1 overflow-hidden">
              <div className="h-full overflow-auto space-y-4">
                {template.variables.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    This template doesn't have any variables.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {template.variables.map((variable) => (
                      <div key={variable}>
                        <Label htmlFor={variable} className="capitalize">
                          {variable.replace(/_/g, ' ')}
                        </Label>
                        <Input
                          id={variable}
                          value={variables[variable] || ''}
                          onChange={(e) => handleVariableChange(variable, e.target.value)}
                          placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="flex-1 overflow-hidden">
              <div className="h-full overflow-auto space-y-6">
                {/* Template Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <div className="mt-1">
                      <Badge variant="outline">{categoryLabel}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Visibility</Label>
                    <div className="mt-1">
                      <Badge variant={template.isPublic ? 'default' : 'secondary'}>
                        {template.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Usage Count</Label>
                    <div className="mt-1">{template.usageCount} times</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Variables</Label>
                    <div className="mt-1">{template.variables.length} variables</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <div className="mt-1">
                      {formatDistanceToNow(createdAt, { addSuffix: true })}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Updated</Label>
                    <div className="mt-1">
                      {formatDistanceToNow(updatedAt, { addSuffix: true })}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {template.tags.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variables List */}
                {template.variables.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Available Variables</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="font-mono text-xs">
                          {'{{'}
                          {variable}
                          {'}}'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Content */}
                <div>
                  <Label className="text-muted-foreground">Raw Template Content</Label>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <pre className="text-xs whitespace-pre-wrap font-mono">{template.content}</pre>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
