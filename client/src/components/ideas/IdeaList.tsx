import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Plus } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { IdeaCard } from './IdeaCard';
import { useIdeas } from '../../hooks/useIdeas';
import type { Idea, IdeaFilters } from '../../types/idea';
import { COMPLEXITY_LEVELS, TIME_COMMITMENTS, IDEA_STATUSES } from '../../types/idea';

interface IdeaListProps {
  onCreateNew?: () => void;
  onEdit?: (idea: Idea) => void;
  onDelete?: (idea: Idea) => void;
  showActions?: boolean;
  showCreateButton?: boolean;
  creatorId?: string; // Filter by specific creator
}

export const IdeaList = ({
  onCreateNew,
  onEdit,
  onDelete,
  showActions = false,
  showCreateButton = true,
  creatorId,
}: IdeaListProps) => {
  const [filters, setFilters] = useState<IdeaFilters>({
    search: '',
    techStack: [],
    complexityLevel: '',
    timeCommitment: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [newTech, setNewTech] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 300);

  const {
    data: ideasResponse,
    isLoading,
    error,
    refetch,
  } = useIdeas({
    search: debouncedSearch || undefined,
    techStack: filters.techStack.length > 0 ? filters.techStack : undefined,
    complexityLevel: filters.complexityLevel || undefined,
    timeCommitment: filters.timeCommitment || undefined,
    status: filters.status || undefined,
    creatorId,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    limit: 20,
  });

  const ideas = ideasResponse?.ideas || [];
  const totalCount = ideasResponse?.totalCount || 0;

  const updateFilter = <K extends keyof IdeaFilters>(key: K, value: IdeaFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const addTechFilter = () => {
    if (!newTech.trim() || filters.techStack.includes(newTech.trim())) return;

    updateFilter('techStack', [...filters.techStack, newTech.trim()]);
    setNewTech('');
  };

  const removeTechFilter = (tech: string) => {
    updateFilter(
      'techStack',
      filters.techStack.filter((t) => t !== tech)
    );
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      techStack: [],
      complexityLevel: '',
      timeCommitment: '',
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setNewTech('');
  };

  const hasActiveFilters =
    filters.search ||
    filters.techStack.length > 0 ||
    filters.complexityLevel ||
    filters.timeCommitment ||
    filters.status;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load ideas</p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ideas</h2>
          <p className="text-muted-foreground">
            {totalCount} idea{totalCount !== 1 ? 's' : ''} found
          </p>
        </div>

        {showCreateButton && onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Idea
          </Button>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search ideas..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-muted' : ''}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearAllFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Complexity Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Complexity</label>
                <Select
                  value={filters.complexityLevel || 'all'}
                  onValueChange={(value) =>
                    updateFilter('complexityLevel', value === 'all' ? '' : (value as any))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any complexity</SelectItem>
                    {COMPLEXITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Commitment */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Commitment</label>
                <Select
                  value={filters.timeCommitment || 'all'}
                  onValueChange={(value) =>
                    updateFilter('timeCommitment', value === 'all' ? '' : (value as any))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any duration</SelectItem>
                    {TIME_COMMITMENTS.map((commitment) => (
                      <SelectItem key={commitment.value} value={commitment.value}>
                        {commitment.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) =>
                    updateFilter('status', value === 'all' ? '' : (value as any))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any status</SelectItem>
                    {IDEA_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tech Stack Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tech Stack</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add technology filter..."
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechFilter())}
                />
                <Button type="button" onClick={addTechFilter} size="sm">
                  Add
                </Button>
              </div>

              {filters.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.techStack.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => removeTechFilter(tech)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Options */}
            <div className="flex gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort by</label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilter('sortBy', value as any)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="updatedAt">Updated Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Order</label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value) => updateFilter('sortOrder', value as any)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest</SelectItem>
                    <SelectItem value="asc">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ideas Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters ? 'No ideas match your filters' : 'No ideas found'}
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" onClick={clearAllFilters}>
              Clear Filters
            </Button>
          ) : (
            showCreateButton &&
            onCreateNew && (
              <Button onClick={onCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Idea
              </Button>
            )
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onEdit={onEdit}
              onDelete={onDelete}
              showActions={showActions}
            />
          ))}
        </div>
      )}
    </div>
  );
};
