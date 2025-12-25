/**
 * IdeaList Component
 * Displays a list of ideas with filtering, sorting, and pagination
 */

import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { IdeaCard } from './IdeaCard';
import { useIdeas } from '../../hooks/useIdeas';
import { useDebounce } from '../../hooks/useDebounce';
import type {
  Idea,
  ListIdeasQuery,
  IdeaCategory,
  IdeaDifficulty,
  IdeaStatus,
} from '../../types/idea';
import { IDEA_CATEGORIES, IDEA_DIFFICULTIES, IDEA_STATUSES, SORT_OPTIONS } from '../../types/idea';

interface IdeaListProps {
  onCreateIdea?: () => void;
  onEditIdea?: (idea: Idea) => void;
  onViewIdea?: (idea: Idea) => void;
  showCreateButton?: boolean;
  initialFilters?: Partial<ListIdeasQuery>;
}

export function IdeaList({
  onCreateIdea,
  onEditIdea,
  onViewIdea,
  showCreateButton = true,
  initialFilters = {},
}: IdeaListProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<IdeaCategory | 'all'>('all');
  const [difficulty, setDifficulty] = useState<IdeaDifficulty | 'all'>('all');
  const [status, setStatus] = useState<IdeaStatus | 'all'>('published');
  const [sortBy, setSortBy] = useState<ListIdeasQuery['sortBy']>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const itemsPerPage = 12;

  // Build query parameters
  const queryParams = useMemo(
    (): ListIdeasQuery => ({
      ...initialFilters,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
      search: debouncedSearch || undefined,
      category: category !== 'all' ? category : undefined,
      difficulty: difficulty !== 'all' ? difficulty : undefined,
      status: status !== 'all' ? status : undefined,
      sortBy,
      sortOrder,
    }),
    [initialFilters, currentPage, debouncedSearch, category, difficulty, status, sortBy, sortOrder]
  );

  const { data, isLoading, error } = useIdeas(queryParams);

  const ideas = data?.data?.ideas || [];
  const totalCount = data?.data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('all');
    setDifficulty('all');
    setStatus('published');
    setSortBy('created');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search || category !== 'all' || difficulty !== 'all' || status !== 'published';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Ideas</h1>
          </div>
          <p className="text-gray-600">Discover and share innovative hackathon ideas</p>
        </div>
        {showCreateButton && (
          <Button onClick={onCreateIdea} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Submit Idea
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search ideas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {
                  [search, category !== 'all', difficulty !== 'all', status !== 'published'].filter(
                    Boolean
                  ).length
                }
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as IdeaCategory | 'all')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {IDEA_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <Select
                value={difficulty}
                onValueChange={(value) => setDifficulty(value as IdeaDifficulty | 'all')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {IDEA_DIFFICULTIES.map((diff) => (
                    <SelectItem key={diff.value} value={diff.value}>
                      {diff.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as IdeaStatus | 'all')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IDEA_STATUSES.map((stat) => (
                    <SelectItem key={stat.value} value={stat.value}>
                      {stat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [newSortBy, newSortOrder] = value.split('-');
                  setSortBy(newSortBy as ListIdeasQuery['sortBy']);
                  setSortOrder(newSortOrder as 'asc' | 'desc');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={`${option.value}-desc`} value={`${option.value}-desc`}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <div className="md:col-span-4 flex justify-end">
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-2">Failed to load ideas.</p>
            <p className="text-sm text-gray-500 mb-4">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {hasActiveFilters ? 'No ideas match your filters.' : 'No ideas found.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters} className="mt-2">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Showing {ideas.length} of {totalCount} ideas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} onEdit={onEditIdea} onView={onViewIdea} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant={currentPage === totalPages ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
