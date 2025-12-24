import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalsApi } from '@/services/proposalsApi';
import { MessageCircle, Send, User } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

interface ProposalCommentsProps {
  proposalId: string;
}

interface Comment {
  id: string;
  proposalId: string;
  userId: string;
  userRole: 'freelancer' | 'client';
  userName: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

export const ProposalComments: React.FC<ProposalCommentsProps> = ({ proposalId }) => {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['proposal-comments', proposalId],
    queryFn: () => proposalsApi.getComments(proposalId),
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: { content: string; isInternal?: boolean }) =>
      proposalsApi.addComment(proposalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-comments', proposalId] });
      setNewComment('');
      setIsInternal(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addCommentMutation.mutate({
      content: newComment.trim(),
      isInternal,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' at ' +
      date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  const userRole = user?.publicMetadata?.role as string;
  const isFreelancer = userRole === 'freelancer';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Comments</span>
            <Badge variant="secondary">{comments?.length || 0}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Comment Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />

            {isFreelancer && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="internal"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="internal" className="text-sm text-muted-foreground">
                  Internal note (only visible to you)
                </label>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newComment.trim() || addCommentMutation.isPending}
                className="flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{addCommentMutation.isPending ? 'Sending...' : 'Send'}</span>
              </Button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : comments && comments.length > 0 ? (
              comments.map((comment: Comment) => (
                <div
                  key={comment.id}
                  className={`p-4 rounded-lg border ${
                    comment.isInternal ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{comment.userName}</span>
                      <Badge
                        variant={comment.userRole === 'freelancer' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {comment.userRole}
                      </Badge>
                      {comment.isInternal && (
                        <Badge variant="outline" className="text-xs">
                          Internal
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No comments yet. Start the conversation!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
