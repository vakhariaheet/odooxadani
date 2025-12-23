import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Search, Filter, Plus, Grid, List } from 'lucide-react';
import { TemplateCard } from './TemplateCard';
import type { Template, TemplateVariables, TemplateCategory } from '../../types/template';
import { TEMPLATE_CATEGORY_LABELS } from '../../types/template';

interface TemplateListProps {
  templates: Template[];
  loading?: boolean;
  error?: string | null;
  currentUserId?: string;
  onView?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onUse?: (template: Template, variables?: TemplateVariables) => void;
  onCreateNew?: () => void;
  onSearch?: (query: string) => void;
  onCategoryFilter?: (category: TemplateCategory | 'all') => void;
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  searchQuery?: string;
  selectedCategory?: TemplateCategory | 'all';
  showCreateButton?: boolean;
  title?: string;
  emptyMessage?: string;
}

export function TemplateList({
  templates,
  loading = false,
  error = null,
  currentUserId,
  onView,
  onEdit,
  onDelete,
  onUse,
  onCreateNew,
  onSearch,
  onCategoryFilter,
  onSortChange,
  searchQuery = '',
  selectedCategory = 'all',
  showCreateButton = false,
  title = 'Templates',
  emptyMessage = 'No templates found',
}: TemplateListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSortChange = (newSortBy: string) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    onSortChange?.(newSortBy, newSortOrder);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">
            {templates.length} template{templates.length !== 1 ? 's' : ''} available
          </p>
        </div>
        {showCreateButton && onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => onSearch?.(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={selectedCategory}
          onValueChange={(value) => onCategoryFilter?.(value as TemplateCategory | 'all')}
        >
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(TEMPLATE_CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="updatedAt">Updated Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="usageCount">Usage Count</SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-l-none"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedCategory !== 'all' || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {TEMPLATE_CATEGORY_LABELS[selectedCategory as TemplateCategory]}
              <button
                onClick={() => onCategoryFilter?.('all')}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                ×
              </button>
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
              <button
                onClick={() => onSearch?.('')}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-48"></div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Grid/List */}
      {!loading && templates.length > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }
        >
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isOwner={template.userId === currentUserId}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onUse={onUse}
              className={viewMode === 'list' ? 'max-w-none' : ''}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && templates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-2">{emptyMessage}</div>
          {showCreateButton && onCreateNew && (
            <Button onClick={onCreateNew} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
