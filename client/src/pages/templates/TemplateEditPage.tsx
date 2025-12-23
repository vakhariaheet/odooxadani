import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { TemplateForm } from '../../components/templates/TemplateForm';
import { TemplatePreview } from '../../components/templates/TemplatePreview';
import { useTemplate, useTemplateMutations } from '../../hooks/useTemplates';
import type { UpdateTemplateRequest, Template } from '../../types/template';

export function TemplateEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewVariables, setPreviewVariables] = useState<string[]>([]);

  const { data: template, isLoading, error } = useTemplate(id!);
  const { updateTemplate } = useTemplateMutations();

  // Create a mock template for preview
  const mockTemplate: Template | null = previewContent
    ? {
        ...(template || ({} as Template)),
        content: previewContent,
        variables: previewVariables,
      }
    : null;

  const handleSubmit = async (data: UpdateTemplateRequest) => {
    if (!id) return;

    try {
      await updateTemplate.mutateAsync({ id, data });
      toast.success('Template updated successfully!');
      navigate('/templates');
    } catch (error) {
      toast.error('Failed to update template');
      console.error('Update error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/templates');
  };

  const handlePreview = (content: string, variables: string[]) => {
    setPreviewContent(content);
    setPreviewVariables(variables);
    setPreviewOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-destructive mb-2">Template Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The template you're looking for doesn't exist or you don't have permission to edit it.
          </p>
          <button onClick={() => navigate('/templates')} className="text-primary hover:underline">
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TemplateForm
        template={template}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onPreview={handlePreview}
        loading={updateTemplate.isPending}
        mode="edit"
      />

      <TemplatePreview
        template={mockTemplate}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
