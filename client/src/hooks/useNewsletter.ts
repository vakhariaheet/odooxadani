import { useState } from 'react';
import { toast } from 'sonner';

export const useNewsletter = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call - replace with actual newsletter service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically call your newsletter service API
      // Example: await subscribeToNewsletter(email);
      
      toast.success('Successfully subscribed to our newsletter!', {
        description: 'You\'ll receive updates about new features and tips.'
      });
      
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return {
    email,
    setEmail,
    isLoading,
    subscribe
  };
};