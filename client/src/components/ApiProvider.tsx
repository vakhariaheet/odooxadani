/**
 * API Provider Component
 * Initializes the apiClient with Clerk authentication
 */

import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { apiClient } from '../services/apiClient';

interface ApiProviderProps {
  children: React.ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set up the auth provider for API client
    apiClient.setAuthProvider(async () => {
      try {
        // Get token from Clerk
        const token = await getToken({template: "rbac"});

        if (token) {
          // Debug: Decode JWT payload to see what's inside (for debugging only)
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('🔍 JWT Payload (FULL):', JSON.stringify(payload, null, 2));
            console.log('🔍 Role in payload:', payload.role);
            console.log('🔍 Metadata in payload:', payload.metadata);
            console.log('🔍 Public metadata in payload:', payload.public_metadata);
          } catch (e) {
            console.log('🔍 Could not decode JWT payload');
          }
        }
        
        return token;
      } catch (error) {
        console.error('Failed to get auth token:', error);
        return null;
      }
    });
  }, [getToken]);

  return <>{children}</>;
}
