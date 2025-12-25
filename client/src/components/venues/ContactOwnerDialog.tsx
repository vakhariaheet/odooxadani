import { useState } from 'react';
import { Mail, User, MessageSquare, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { apiClient } from '../../services/apiClient';
import type { Venue } from '../../types/venue';

interface ContactOwnerDialogProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
}

export function ContactOwnerDialog({ venue, isOpen, onClose }: ContactOwnerDialogProps) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    senderName: user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user?.emailAddresses[0]?.emailAddress || '',
    senderEmail: user?.emailAddresses[0]?.emailAddress || '',
    inquiryType: 'general',
    subject: `Inquiry about ${venue.name}`,
    message: `Hi,\n\nI'm interested in your venue "${venue.name}" and would like to know more about availability and pricing.\n\nThank you!`
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.senderName.trim() || !formData.senderEmail.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await apiClient.post(`/api/venues/${venue.venueId}/contact`, {
        senderName: formData.senderName,
        senderEmail: formData.senderEmail,
        inquiryType: formData.inquiryType,
        subject: formData.subject,
        message: formData.message
      });

      console.log('Contact owner success:', result);
      toast.success('Your message has been sent to the venue owner!');
      onClose();
      
      // Reset form
      setFormData({
        senderName: user?.firstName && user?.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user?.emailAddresses[0]?.emailAddress || '',
        senderEmail: user?.emailAddresses[0]?.emailAddress || '',
        inquiryType: 'general',
        subject: `Inquiry about ${venue.name}`,
        message: `Hi,\n\nI'm interested in your venue "${venue.name}" and would like to know more about availability and pricing.\n\nThank you!`
      });
      
    } catch (error) {
      console.error('Contact owner error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Contact Venue Owner
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Send a message to the owner of "<span className="font-medium">{venue.name}</span>"
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sender Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="senderName">Your Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="senderName"
                  value={formData.senderName}
                  onChange={(e) => handleInputChange('senderName', e.target.value)}
                  placeholder="Your full name"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="senderEmail">Your Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="senderEmail"
                  type="email"
                  value={formData.senderEmail}
                  onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                  placeholder="your.email@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Inquiry Type */}
          <div>
            <Label htmlFor="inquiryType">Inquiry Type</Label>
            <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange('inquiryType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Inquiry</SelectItem>
                <SelectItem value="booking">Booking Request</SelectItem>
                <SelectItem value="pricing">Pricing Information</SelectItem>
                <SelectItem value="availability">Availability Check</SelectItem>
                <SelectItem value="tour">Venue Tour Request</SelectItem>
                <SelectItem value="catering">Catering Options</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Subject of your inquiry"
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message *</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Write your message to the venue owner..."
                className="pl-10 min-h-[120px]"
                required
              />
            </div>
          </div>

          {/* Venue Info Display */}
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-1">Venue Details</h4>
            <p className="text-sm text-muted-foreground">
              <strong>{venue.name}</strong> • {venue.location.city}, {venue.location.state}
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}