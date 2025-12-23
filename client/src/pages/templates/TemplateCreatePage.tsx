import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TemplateForm } from '../../components/templates/TemplateForm';
import { TemplatePreview } from '../../components/templates/TemplatePreview';
import { useTemplateMutations } from '../../hooks/useTemplates';
import type { CreateTemplateRequest, UpdateTemplateRequest, Template } from '../../types/template';

export function TemplateCreatePage() {
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewVariables, setPreviewVariables] = useState<string[]>([]);

  const { createTemplate } = useTemplateMutations();

  // Create a mock template for preview
  const mockTemplate: Template = {
    id: 'preview',
    name: 'Preview Template',
    description: 'Template preview',
    content: previewContent,
    category: 'other' as any,
    userId: 'current-user',
    isPublic: false,
    variables: previewVariables,
    sections: [],
    tags: [],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleSubmit = async (data: CreateTemplateRequest | UpdateTemplateRequest) => {
    try {
      await createTemplate.mutateAsync(data as CreateTemplateRequest);
      toast.success('Template created successfully!');
      navigate('/templates');
    } catch (error) {
      toast.error('Failed to create template');
      console.error('Create error:', error);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <TemplateForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onPreview={handlePreview}
        loading={createTemplate.isPending}
        mode="create"
      />

      <TemplatePreview
        template={previewContent ? mockTemplate : null}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
