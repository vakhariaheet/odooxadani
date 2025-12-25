/**
 * Ideas API Service
 * Handles all API calls related to idea management
 */

import { apiClient } from './apiClient';
import type {
  CreateIdeaRequest,
  UpdateIdeaRequest,
  VoteIdeaRequest,
  ListIdeasQuery,
  IdeaListResponse,
  IdeaResponse,
  VoteResponse,
} from '../types/idea';

// Mock data for testing when backend is not available
const initialMockIdeas = [
  {
    id: 'idea_1',
    title: 'AI-Powered Code Review Assistant',
    description:
      'An intelligent code review tool that uses machine learning to identify bugs, security vulnerabilities, and suggest improvements in real-time.',
    skills: ['Python', 'Machine Learning', 'React', 'Node.js'],
    category: 'ai' as const,
    difficulty: 'intermediate' as const,
    teamSize: 4,
    authorId: 'user_1',
    authorName: 'John Doe',
    votes: 15,
    status: 'published' as const,
    tags: ['AI', 'Code Quality', 'Developer Tools', 'Automation'],
    feasibilityScore: 8,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'idea_2',
    title: 'Sustainable Campus Food Tracker',
    description:
      'A mobile app that helps students track food waste, find sustainable dining options, and connect with local food recovery programs.',
    skills: ['React Native', 'Firebase', 'UI/UX Design'],
    category: 'mobile' as const,
    difficulty: 'beginner' as const,
    teamSize: 3,
    authorId: 'user_2',
    authorName: 'Jane Smith',
    votes: 23,
    status: 'published' as const,
    tags: ['Sustainability', 'Mobile App', 'Social Impact'],
    feasibilityScore: 9,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'idea_3',
    title: 'Blockchain-Based Voting System',
    description:
      'A secure, transparent voting platform using blockchain technology to ensure election integrity and voter privacy.',
    skills: ['Solidity', 'Web3.js', 'React', 'Cryptography'],
    category: 'blockchain' as const,
    difficulty: 'advanced' as const,
    teamSize: 5,
    authorId: 'user_3',
    authorName: 'Mike Johnson',
    votes: 8,
    status: 'published' as const,
    tags: ['Blockchain', 'Security', 'Democracy', 'Cryptography'],
    feasibilityScore: 6,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

const MOCK_IDEAS_STORAGE_KEY = 'hackathon_mock_ideas';
const USE_MOCK_DATA = import.meta.env.VITE_API_URL === 'http://localhost:3000';

// Helper functions for localStorage persistence
const getMockIdeas = () => {
  if (!USE_MOCK_DATA) return [];

  try {
    const stored = localStorage.getItem(MOCK_IDEAS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load mock ideas from localStorage:', error);
  }

  // Initialize with default ideas if nothing in storage
  saveMockIdeas(initialMockIdeas);
  return [...initialMockIdeas];
};

const saveMockIdeas = (ideas: any[]) => {
  if (!USE_MOCK_DATA) return;

  try {
    localStorage.setItem(MOCK_IDEAS_STORAGE_KEY, JSON.stringify(ideas));
  } catch (error) {
    console.warn('Failed to save mock ideas to localStorage:', error);
  }
};

const addMockIdea = (idea: any) => {
  const ideas = getMockIdeas();
  ideas.unshift(idea);
  saveMockIdeas(ideas);
  return idea;
};

const updateMockIdea = (id: string, updates: any) => {
  const ideas = getMockIdeas();
  const ideaIndex = ideas.findIndex((i: any) => i.id === id);
  if (ideaIndex === -1) {
    throw new Error('Idea not found');
  }

  ideas[ideaIndex] = {
    ...ideas[ideaIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveMockIdeas(ideas);
  return ideas[ideaIndex];
};

const deleteMockIdea = (id: string) => {
  const ideas = getMockIdeas();
  const ideaIndex = ideas.findIndex((i: any) => i.id === id);
  if (ideaIndex === -1) {
    throw new Error('Idea not found');
  }

  ideas.splice(ideaIndex, 1);
  saveMockIdeas(ideas);
};

const voteMockIdea = (id: string, vote: number) => {
  const ideas = getMockIdeas();
  const idea = ideas.find((i: any) => i.id === id);
  if (!idea) {
    throw new Error('Idea not found');
  }

  idea.votes = Math.max(0, idea.votes + vote);
  saveMockIdeas(ideas);
  return idea;
};

// Utility function to reset mock data (useful for testing)
export const resetMockData = () => {
  if (USE_MOCK_DATA) {
    localStorage.removeItem(MOCK_IDEAS_STORAGE_KEY);
    console.log('Mock data reset to initial state');
  }
};

// Utility function to check if we're using mock data
export const isUsingMockData = () => USE_MOCK_DATA;

export const ideasApi = {
  /**
   * List ideas with filtering and pagination
   */
  async listIdeas(query?: ListIdeasQuery): Promise<IdeaListResponse> {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for ideas (with localStorage persistence)');
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      let filteredIdeas = getMockIdeas();

      // Apply filters
      if (query?.category && query.category !== 'all') {
        filteredIdeas = filteredIdeas.filter((idea: any) => idea.category === query.category);
      }

      if (query?.difficulty && query.difficulty !== 'all') {
        filteredIdeas = filteredIdeas.filter((idea: any) => idea.difficulty === query.difficulty);
      }

      if (query?.search) {
        const searchLower = query.search.toLowerCase();
        filteredIdeas = filteredIdeas.filter(
          (idea: any) =>
            idea.title.toLowerCase().includes(searchLower) ||
            idea.description.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      if (query?.sortBy === 'votes') {
        filteredIdeas.sort((a: any, b: any) =>
          query.sortOrder === 'asc' ? a.votes - b.votes : b.votes - a.votes
        );
      } else if (query?.sortBy === 'feasibility') {
        filteredIdeas.sort((a: any, b: any) =>
          query.sortOrder === 'asc'
            ? a.feasibilityScore - b.feasibilityScore
            : b.feasibilityScore - a.feasibilityScore
        );
      } else {
        // Sort by creation date (default)
        filteredIdeas.sort((a: any, b: any) => {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();
          return query?.sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
        });
      }

      // Apply pagination
      const offset = query?.offset || 0;
      const limit = query?.limit || 20;
      const paginatedIdeas = filteredIdeas.slice(offset, offset + limit);

      return {
        success: true,
        data: {
          ideas: paginatedIdeas,
          totalCount: filteredIdeas.length,
        },
      };
    }

    const params = new URLSearchParams();

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/api/ideas?${queryString}` : '/api/ideas';

    return apiClient.get<IdeaListResponse>(url);
  },

  /**
   * Get a single idea by ID
   */
  async getIdea(id: string): Promise<IdeaResponse> {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for idea details');
      await new Promise((resolve) => setTimeout(resolve, 300));

      const ideas = getMockIdeas();
      const idea = ideas.find((i: any) => i.id === id);
      if (!idea) {
        throw new Error('Idea not found');
      }

      return {
        success: true,
        data: idea,
      };
    }

    return apiClient.get<IdeaResponse>(`/api/ideas/${id}`);
  },

  /**
   * Create a new idea
   */
  async createIdea(data: CreateIdeaRequest): Promise<IdeaResponse> {
    if (USE_MOCK_DATA) {
      console.log('Mock: Creating idea (with localStorage persistence)', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate AI enhancement
      const enhancedDescription =
        data.description +
        '\n\n✨ Enhanced with AI: This idea has great potential for a hackathon project with clear technical implementation path and strong user impact.';

      const newIdea = {
        id: `idea_${Date.now()}`,
        ...data,
        description: enhancedDescription,
        authorId: 'current_user',
        authorName: 'Current User',
        votes: 0,
        tags: ['New Idea', 'AI Enhanced', ...data.skills.slice(0, 2)],
        feasibilityScore: Math.floor(Math.random() * 3) + 7, // 7-9 for new ideas
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const savedIdea = addMockIdea(newIdea);

      return {
        success: true,
        data: savedIdea,
      };
    }

    return apiClient.post<IdeaResponse>('/api/ideas', data);
  },

  /**
   * Update an existing idea
   */
  async updateIdea(id: string, data: UpdateIdeaRequest): Promise<IdeaResponse> {
    if (USE_MOCK_DATA) {
      console.log('Mock: Updating idea (with localStorage persistence)', id, data);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedIdea = updateMockIdea(id, data);

      return {
        success: true,
        data: updatedIdea,
      };
    }

    return apiClient.put<IdeaResponse>(`/api/ideas/${id}`, data);
  },

  /**
   * Delete an idea
   */
  async deleteIdea(id: string): Promise<VoteResponse> {
    if (USE_MOCK_DATA) {
      console.log('Mock: Deleting idea (with localStorage persistence)', id);
      await new Promise((resolve) => setTimeout(resolve, 500));

      deleteMockIdea(id);

      return {
        success: true,
        data: { message: 'Idea deleted successfully' },
      };
    }

    return apiClient.delete<VoteResponse>(`/api/ideas/${id}`);
  },

  /**
   * Vote on an idea
   */
  async voteIdea(id: string, vote: number): Promise<VoteResponse> {
    if (USE_MOCK_DATA) {
      console.log('Mock: Voting on idea (with localStorage persistence)', id, vote);
      await new Promise((resolve) => setTimeout(resolve, 300));

      voteMockIdea(id, vote);

      return {
        success: true,
        data: { message: vote === 1 ? 'Upvoted successfully' : 'Downvoted successfully' },
      };
    }

    const data: VoteIdeaRequest = { vote };
    return apiClient.post<VoteResponse>(`/api/ideas/${id}/vote`, data);
  },
};
