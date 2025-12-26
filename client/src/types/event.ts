/**
 * Event Management Types - Frontend
 *
 * Frontend-specific types for event management functionality
 */

// =============================================================================
// CORE EVENT TYPES
// =============================================================================

export interface Event {
  id: string;
  name: string;
  description: string;
  organizerId: string;
  organizerName: string;
  startDate: string; // ISO timestamp
  endDate: string; // ISO timestamp
  registrationDeadline: string; // ISO timestamp
  location: string; // physical location or "Virtual"
  maxParticipants: number;
  currentParticipants: number;
  categories: string[];
  prizes: Prize[];
  rules: string;
  status: EventStatus;
  isPublic: boolean;
  requiresApproval: boolean;
  tags: string[]; // AI-generated tags
  trendScore: number; // AI-assessed trend relevance 1-10
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface Prize {
  position: number; // 1st, 2nd, 3rd, etc.
  title: string;
  description: string;
  value?: string; // monetary value or description
}

export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';

// =============================================================================
// EVENT PARTICIPANT TYPES
// =============================================================================

export interface EventParticipant {
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  skills: string[];
  registrationStatus: ParticipantStatus;
  registeredAt: string; // ISO timestamp
  approvedAt?: string; // ISO timestamp, optional
}

export type ParticipantStatus = 'registered' | 'approved' | 'waitlisted' | 'cancelled';

// =============================================================================
// EVENT SETTINGS TYPES
// =============================================================================

export interface EventSettings {
  eventId: string;
  allowTeamFormation: boolean;
  allowIdeaSubmission: boolean;
  allowJudgeScoring: boolean;
  maxTeamSize: number;
  ideaSubmissionDeadline?: string; // ISO timestamp
  judgingStartDate?: string; // ISO timestamp
  customFields: CustomField[];
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox';
  required: boolean;
  options?: string[]; // for select/multiselect
  placeholder?: string;
}

// =============================================================================
// REQUEST/RESPONSE TYPES
// =============================================================================

export interface CreateEventRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  location: string;
  maxParticipants: number;
  categories: string[];
  prizes: Prize[];
  rules: string;
  isPublic: boolean;
  requiresApproval: boolean;
  settings?: Partial<EventSettings>;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: EventStatus;
}

export interface ListEventsQuery {
  limit?: number;
  offset?: number;
  status?: EventStatus;
  category?: string;
  location?: string;
  organizerId?: string;
  isPublic?: boolean;
  search?: string;
  sortBy?: 'startDate' | 'createdAt' | 'trendScore' | 'currentParticipants';
  sortOrder?: 'asc' | 'desc';
}

export interface EventListResponse {
  events: Event[];
  total: number;
  hasMore: boolean;
}

export interface EventRegistrationRequest {
  skills: string[];
  customFieldResponses?: Record<string, any>;
}

// =============================================================================
// FORM TYPES
// =============================================================================

export interface EventFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  location: string;
  maxParticipants: number;
  categories: string[];
  prizes: Prize[];
  rules: string;
  isPublic: boolean;
  requiresApproval: boolean;
}

export interface EventFilters {
  status?: EventStatus;
  category?: string;
  location?: string;
  search?: string;
  sortBy?: 'startDate' | 'createdAt' | 'trendScore' | 'currentParticipants';
  sortOrder?: 'asc' | 'desc';
}

// =============================================================================
// UI STATE TYPES
// =============================================================================

export interface EventCardProps {
  event: Event;
  onRegister?: (eventId: string) => void;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  showActions?: boolean;
  isOwner?: boolean;
}

export interface EventListState {
  events: Event[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
}

export interface EventFormState {
  data: EventFormData;
  loading: boolean;
  error: string | null;
  isValid: boolean;
}

// =============================================================================
// COMMON HACKATHON CATEGORIES
// =============================================================================

export const HACKATHON_CATEGORIES = [
  'Web Development',
  'Mobile Apps',
  'AI/ML',
  'Blockchain',
  'IoT',
  'Gaming',
  'FinTech',
  'HealthTech',
  'EdTech',
  'Social Impact',
  'Open Source',
  'DevTools',
  'AR/VR',
  'Cybersecurity',
  'Data Science',
  'Cloud Computing',
  'API Development',
  'UI/UX Design',
] as const;

export type HackathonCategory = (typeof HACKATHON_CATEGORIES)[number];

// =============================================================================
// EVENT STATUS DISPLAY
// =============================================================================

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  draft: 'gray',
  published: 'green',
  ongoing: 'blue',
  completed: 'purple',
  cancelled: 'red',
};

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export const validateEventForm = (data: EventFormData): string[] => {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push('Event name is required');
  }

  if (!data.description.trim()) {
    errors.push('Event description is required');
  }

  if (!data.location.trim()) {
    errors.push('Location is required');
  }

  if (data.maxParticipants <= 0) {
    errors.push('Max participants must be greater than 0');
  }

  if (data.categories.length === 0) {
    errors.push('At least one category is required');
  }

  // Date validation
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const registrationDeadline = new Date(data.registrationDeadline);
  const now = new Date();

  if (startDate <= now) {
    errors.push('Start date must be in the future');
  }

  if (endDate <= startDate) {
    errors.push('End date must be after start date');
  }

  if (registrationDeadline >= startDate) {
    errors.push('Registration deadline must be before start date');
  }

  return errors;
};
