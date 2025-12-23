import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { TemplateList } from '../../components/templates/TemplateList';
import { TemplatePreview } from '../../components/templates/TemplatePreview';
import { usePublicTemplates } from '../../hooks/useTemplates';
import type { Template, TemplateCategory, TemplateVariables } from '../../types/template';

export function TemplateLibraryPage() {
  const { userId } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

  const { data: templatesResponse, isLoading, error } = usePublicTemplates(100);
  const templates = templatesResponse?.templates || [];

  // Filter templates based on search and category
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleView = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleUse = (template: Template, variables?: TemplateVariables) => {
    // This would typically navigate to a proposal creation page with the template
    console.log('Using template:', template.id, 'with variables:', variables);
    toast.success('Template ready to use!');
    setPreviewOpen(false);

    // In a real app, you might:
    // navigate('/proposals/new', { state: { template, variables } });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <TemplateList
        templates={filteredTemplates}
        loading={isLoading}
        error={error?.message || null}
        currentUserId={userId || undefined}
        onView={handleView}
        onUse={handleUse}
        onSearch={setSearchQuery}
        onCategoryFilter={setSelectedCategory}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        showCreateButton={false}
        title="Template Library"
        emptyMessage="No public templates available"
      />

      <TemplatePreview
        template={selectedTemplate}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onUse={handleUse}
        isOwner={selectedTemplate?.userId === userId}
      />
    </div>
  );
}
