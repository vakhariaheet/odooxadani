import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { TemplateList } from '../../components/templates/TemplateList';
import { TemplatePreview } from '../../components/templates/TemplatePreview';
import { useMyTemplates, useTemplateMutations } from '../../hooks/useTemplates';
import type { Template, TemplateCategory, TemplateVariables } from '../../types/template';

export function TemplateListPage() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

  const { data: templatesResponse, isLoading, error } = useMyTemplates(50);
  const { deleteTemplate } = useTemplateMutations();

  const templates = templatesResponse?.templates || [];

  // Debug logging
  console.log('Templates Response:', templatesResponse);
  console.log('Templates:', templates);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

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

  const handleEdit = (template: Template) => {
    navigate(`/templates/${template.id}/edit`);
  };

  const handleDelete = async (template: Template) => {
    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      try {
        await deleteTemplate.mutateAsync(template.id);
        toast.success('Template deleted successfully');
      } catch (error) {
        toast.error('Failed to delete template');
        console.error('Delete error:', error);
      }
    }
  };

  const handleUse = (template: Template, variables?: TemplateVariables) => {
    // This would typically navigate to a proposal creation page with the template
    console.log('Using template:', template.id, 'with variables:', variables);
    toast.success('Template ready to use!');
    setPreviewOpen(false);
  };

  const handleCreateNew = () => {
    navigate('/templates/new');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <TemplateList
        templates={filteredTemplates}
        loading={isLoading}
        error={error?.message || null}
        currentUserId={userId || undefined}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateNew={handleCreateNew}
        onSearch={setSearchQuery}
        onCategoryFilter={setSelectedCategory}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        showCreateButton={true}
        title="My Templates"
        emptyMessage="You haven't created any templates yet"
      />

      <TemplatePreview
        template={selectedTemplate}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onUse={handleUse}
        onEdit={handleEdit}
        isOwner={true}
      />
    </div>
  );
}
