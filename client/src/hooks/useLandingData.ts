import { useEffect, useState } from 'react';
import { useApi } from './useApi';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  image?: string;
  category: string;
  organizer: string;
  capacity: number;
  attendees: number;
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  pricePerHour: number;
  image?: string;
  amenities: string[];
  rating: number;
  reviews: number;
  availability: boolean;
}

export interface PlatformStats {
  totalEvents: number;
  totalVenues: number;
  totalBookings: number;
  activeUsers: number;
}

export const useLandingData = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[] | null>(null);
  const [featuredVenues, setFeaturedVenues] = useState<Venue[] | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{ events: string | null; venues: string | null }>({
    events: null,
    venues: null,
  });

  const eventsApi = useApi<Event[]>();
  const venuesApi = useApi<Venue[]>();
  const statsApi = useApi<PlatformStats>();

  // Fallback data for demo purposes
  const fallbackEvents: Event[] = [
    {
      id: '1',
      title: 'Tech Conference 2024',
      description: 'Annual technology conference featuring industry leaders',
      date: '2024-03-15',
      time: '09:00',
      location: 'San Francisco Convention Center',
      price: 299,
      category: 'Technology',
      organizer: 'TechCorp',
      capacity: 500,
      attendees: 342,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    },
    {
      id: '2',
      title: 'Music Festival',
      description: 'Three-day outdoor music festival with top artists',
      date: '2024-04-20',
      time: '14:00',
      location: 'Golden Gate Park',
      price: 150,
      category: 'Music',
      organizer: 'Music Events Inc',
      capacity: 2000,
      attendees: 1850,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    },
    {
      id: '3',
      title: 'Food & Wine Expo',
      description: 'Culinary experience with renowned chefs and wineries',
      date: '2024-05-10',
      time: '11:00',
      location: 'Napa Valley Resort',
      price: 89,
      category: 'Food & Drink',
      organizer: 'Culinary Arts Society',
      capacity: 300,
      attendees: 267,
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    },
  ];

  const fallbackVenues: Venue[] = [
    {
      id: '1',
      name: 'Grand Ballroom',
      description: 'Elegant ballroom perfect for weddings and corporate events',
      location: 'Downtown San Francisco',
      capacity: 300,
      pricePerHour: 500,
      amenities: ['Audio/Visual Equipment', 'Catering Kitchen', 'Parking', 'WiFi'],
      rating: 4.8,
      reviews: 124,
      availability: true,
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
    },
    {
      id: '2',
      name: 'Rooftop Terrace',
      description: 'Stunning outdoor venue with city skyline views',
      location: 'SOMA District',
      capacity: 150,
      pricePerHour: 350,
      amenities: ['Outdoor Seating', 'Bar Setup', 'City Views', 'Climate Control'],
      rating: 4.9,
      reviews: 89,
      availability: true,
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
    },
    {
      id: '3',
      name: 'Conference Center',
      description: 'Modern conference facility with state-of-the-art technology',
      location: 'Financial District',
      capacity: 500,
      pricePerHour: 750,
      amenities: ['Presentation Equipment', 'Breakout Rooms', 'Catering', 'Tech Support'],
      rating: 4.7,
      reviews: 156,
      availability: true,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    },
  ];

  const fallbackStats: PlatformStats = {
    totalEvents: 1247,
    totalVenues: 389,
    totalBookings: 5632,
    activeUsers: 12450,
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        // Try to fetch events from API
        try {
          const events = await eventsApi.get('/api/events/popular?limit=6');
          setFeaturedEvents(events);
          localStorage.setItem('eventHub_featuredEvents', JSON.stringify(events));
        } catch (error) {
          // Fallback to cached data or demo data
          const cached = localStorage.getItem('eventHub_featuredEvents');
          setFeaturedEvents(cached ? JSON.parse(cached) : fallbackEvents);
          setErrors((prev) => ({ ...prev, events: 'Failed to load events' }));
        }

        // Try to fetch venues from API
        try {
          const venues = await venuesApi.get('/api/venues?limit=8&featured=true');
          setFeaturedVenues(venues);
          localStorage.setItem('eventHub_featuredVenues', JSON.stringify(venues));
        } catch (error) {
          // Fallback to cached data or demo data
          const cached = localStorage.getItem('eventHub_featuredVenues');
          setFeaturedVenues(cached ? JSON.parse(cached) : fallbackVenues);
          setErrors((prev) => ({ ...prev, venues: 'Failed to load venues' }));
        }

        // Try to fetch stats from API
        try {
          const platformStats = await statsApi.get('/api/admin/stats');
          setStats(platformStats);
          localStorage.setItem('eventHub_stats', JSON.stringify(platformStats));
        } catch (error) {
          // Fallback to cached data or demo data
          const cached = localStorage.getItem('eventHub_stats');
          setStats(cached ? JSON.parse(cached) : fallbackStats);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    featuredEvents: featuredEvents || fallbackEvents,
    featuredVenues: featuredVenues || fallbackVenues,
    stats: stats || fallbackStats,
    loading,
    errors,
  };
};
