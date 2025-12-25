/**
 * Wishlist Hook for managing user's favorite venues
 * Uses localStorage for persistence (can be upgraded to backend later)
 */

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';

const WISHLIST_STORAGE_KEY = 'venue_wishlist';

interface WishlistItem {
  venueId: string;
  addedAt: string;
}

export function useWishlist() {
  const { user } = useUser();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get user-specific storage key
  const getUserWishlistKey = useCallback(() => {
    return user?.id ? `${WISHLIST_STORAGE_KEY}_${user.id}` : null;
  }, [user]);

  // Load wishlist from localStorage on mount and when user changes
  useEffect(() => {
    const loadWishlist = () => {
      const userKey = getUserWishlistKey();
      if (userKey) {
        try {
          const stored = localStorage.getItem(userKey);
          console.log('Loading wishlist for user:', user?.id, 'stored:', stored);
          if (stored) {
            const parsed = JSON.parse(stored);
            setWishlistItems(parsed);
            console.log('Loaded wishlist items:', parsed);
          } else {
            setWishlistItems([]);
          }
        } catch (error) {
          console.error('Error loading wishlist:', error);
          setWishlistItems([]);
        }
      } else {
        setWishlistItems([]);
      }
      setIsLoaded(true);
    };

    loadWishlist();

    // Listen for venue deletion events to refresh wishlist
    const handleVenueDeleted = (event: CustomEvent) => {
      const { venueId } = event.detail;
      console.log('Venue deleted event received:', venueId);
      // Reload wishlist to reflect the cleanup done by useDeleteVenue
      loadWishlist();
    };

    window.addEventListener('venue-deleted', handleVenueDeleted as EventListener);

    return () => {
      window.removeEventListener('venue-deleted', handleVenueDeleted as EventListener);
    };
  }, [user?.id, getUserWishlistKey]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && user?.id) {
      const userKey = getUserWishlistKey();
      if (userKey) {
        console.log('Saving wishlist for user:', user.id, 'items:', wishlistItems);
        localStorage.setItem(userKey, JSON.stringify(wishlistItems));
      }
    }
  }, [wishlistItems, user?.id, getUserWishlistKey, isLoaded]);

  const addToWishlist = useCallback((venueId: string) => {
    if (!user?.id) {
      console.log('No user ID, cannot add to wishlist');
      return false;
    }
    
    setWishlistItems(prev => {
      const exists = prev.some(item => item.venueId === venueId);
      if (exists) {
        console.log('Venue already in wishlist:', venueId);
        return prev;
      }

      const newItem: WishlistItem = {
        venueId,
        addedAt: new Date().toISOString()
      };

      const newItems = [...prev, newItem];
      console.log('Adding to wishlist:', venueId, 'new items:', newItems);
      return newItems;
    });
    return true;
  }, [user?.id]);

  const removeFromWishlist = useCallback((venueId: string) => {
    if (!user?.id) {
      console.log('No user ID, cannot remove from wishlist');
      return false;
    }
    
    setWishlistItems(prev => {
      const newItems = prev.filter(item => item.venueId !== venueId);
      console.log('Removing from wishlist:', venueId, 'new items:', newItems);
      return newItems;
    });
    return true;
  }, [user?.id]);

  const toggleWishlist = useCallback((venueId: string) => {
    const isWishlisted = wishlistItems.some(item => item.venueId === venueId);
    console.log('Toggling wishlist for:', venueId, 'currently wishlisted:', isWishlisted);
    
    if (isWishlisted) {
      return removeFromWishlist(venueId);
    } else {
      return addToWishlist(venueId);
    }
  }, [wishlistItems, addToWishlist, removeFromWishlist]);

  const isInWishlist = useCallback((venueId: string): boolean => {
    const result = wishlistItems.some(item => item.venueId === venueId);
    console.log('Checking if in wishlist:', venueId, 'result:', result, 'current items:', wishlistItems);
    return result;
  }, [wishlistItems]);

  const getWishlistVenueIds = useCallback((): string[] => {
    return wishlistItems.map(item => item.venueId);
  }, [wishlistItems]);

  const getWishlistCount = useCallback((): number => {
    return wishlistItems.length;
  }, [wishlistItems]);

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
  }, []);

  // Clean up deleted venues from wishlist
  const cleanupDeletedVenues = useCallback((existingVenueIds: string[]) => {
    if (!user?.id || !isLoaded) return 0;
    
    const validItems = wishlistItems.filter(item => 
      existingVenueIds.includes(item.venueId)
    );
    
    if (validItems.length !== wishlistItems.length) {
      const removedCount = wishlistItems.length - validItems.length;
      console.log(`Cleaning up ${removedCount} deleted venues from wishlist`);
      setWishlistItems(validItems);
      return removedCount;
    }
    
    return 0;
  }, [wishlistItems, user?.id, isLoaded]);

  // Validate and clean up wishlist against a list of venue IDs
  const validateWishlistItems = useCallback((availableVenueIds: string[]) => {
    if (!user?.id || !isLoaded || wishlistItems.length === 0) return 0;
    
    const invalidItems = wishlistItems.filter(item => 
      !availableVenueIds.includes(item.venueId)
    );
    
    if (invalidItems.length > 0) {
      console.log(`Found ${invalidItems.length} invalid venues in wishlist:`, invalidItems.map(i => i.venueId));
      
      // Remove invalid items
      invalidItems.forEach(item => {
        removeFromWishlist(item.venueId);
      });
      
      return invalidItems.length;
    }
    
    return 0;
  }, [wishlistItems, user?.id, isLoaded, removeFromWishlist]);

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    getWishlistVenueIds,
    getWishlistCount,
    clearWishlist,
    cleanupDeletedVenues,
    validateWishlistItems,
    isAuthenticated: !!user?.id,
    isLoaded
  };
}