import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ProposalCard } from './ProposalCard';
import type { Proposal, ListProposalsQuery } from '../../types/proposal';
import {
  PROPOSAL_STATUS_OPTIONS,
  PROPOSAL_SORT_OPTIONS,
  ProposalStatus,
} from '../../types/proposal';
import { Search, Filter, Plus, Grid, List } from 'lucide-react';

interface ProposalListProps {
  proposals: Proposal[];
  totalCount: number;
  hasMore: boolean;
  loading: boolean;
  query: ListProposalsQuery;
  onQueryChange: (query: ListProposalsQuery) => void;
  onLoadMore: () => void;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSend?: (id: string) => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCreateNew?: () => void;
  showCreateButton?: boolean;
}

export function ProposalList({
  proposals,
  totalCount,
  hasMore,
  loading,
  query,
  onQueryChange,
  onLoadMore,
  onView,
  onEdit,
  onDelete,
  onSend,
  onAccept,
  onReject,
  onCreateNew,
  showCreateButton = true,
}: ProposalListProps) {
  const [searchTerm, setSearchTerm] = useState(query.clientEmail || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onQueryChange({
      ...query,
      clientEmail: value || undefined,
      offset: 0, // Reset to first page
    });
  };

  const handleStatusFilter = (status: string) => {
    onQueryChange({
      ...query,
      status: (status === 'all' ? undefined : status) as ProposalStatus | undefined,
      offset: 0, // Reset to first page
    });
  };

  const handleSortChange = (sortBy: string) => {
    onQueryChange({
      ...query,
      sortBy: sortBy as any,
      offset: 0, // Reset to first page
    });
  };

  const handleSortOrderChange = (sortOrder: string) => {
    onQueryChange({
      ...query,
      sortOrder: sortOrder as any,
      offset: 0, // Reset to first page
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proposals</h1>
          <p className="text-muted-foreground">
            {totalCount} proposal{totalCount !== 1 ? 's' : ''} total
          </p>
        </div>
        {showCreateButton && onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Proposal
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search by client email</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="client@example.com"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={query.status || 'all'} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  {PROPOSAL_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort by</label>
              <Select value={query.sortBy || 'createdAt'} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPOSAL_SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Order</label>
              <Select value={query.sortOrder || 'desc'} onValueChange={handleSortOrderChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest first</SelectItem>
                  <SelectItem value="asc">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {proposals.length} of {totalCount} proposals
          </span>
          {query.status && (
            <Badge variant="secondary">
              Status: {PROPOSAL_STATUS_OPTIONS.find((opt) => opt.value === query.status)?.label}
            </Badge>
          )}
          {query.clientEmail && <Badge variant="secondary">Client: {query.clientEmail}</Badge>}
        </div>

        <div className="flex items-center gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Proposals Grid/List */}
      {loading && proposals.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading proposals...</p>
          </div>
        </div>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No proposals found</p>
            {showCreateButton && onCreateNew && (
              <Button onClick={onCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create your first proposal
              </Button>
            )}
            {!showCreateButton && (
              <p className="text-sm text-muted-foreground">
                Only freelancers can create proposals. Set your role to "freelancer" in your
                profile.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onSend={onSend}
              onAccept={onAccept}
              onReject={onReject}
              loading={loading}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button variant="outline" onClick={onLoadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
