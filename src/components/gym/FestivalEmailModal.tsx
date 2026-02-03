import { useState } from 'react';
import { Client } from '@/types/gym';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { emailApi } from '@/services/apiService';
import { PartyPopper, Send, Users } from 'lucide-react';

interface FestivalEmailModalProps {
  clients: Client[];
  onClose: () => void;
}

const FESTIVAL_TEMPLATES = {
  diwali: {
    subject: '🪔 Happy Diwali from US Gymnasium!',
    message: `Wishing you and your family a very Happy Diwali! 🪔✨

May this festival of lights bring joy, prosperity, and good health into your life.

Stay fit, stay healthy, and keep shining bright!`,
  },
  holi: {
    subject: '🎨 Happy Holi from US Gymnasium!',
    message: `Wishing you a colorful and joyful Holi! 🎨🌈

May your life be filled with vibrant colors of happiness and good health.

Don't forget to stay hydrated and keep up with your fitness routine!`,
  },
  newyear: {
    subject: '🎉 Happy New Year from US Gymnasium!',
    message: `Happy New Year! 🎉🥳

Wishing you a year filled with health, happiness, and fitness achievements!

Let's make this year your strongest year yet!`,
  },
  independence: {
    subject: '🇮🇳 Happy Independence Day from US Gymnasium!',
    message: `Happy Independence Day! 🇮🇳

Saluting the spirit of freedom and the strength of our nation.

Stay fit, stay strong, and keep making our nation proud!`,
  },
  custom: {
    subject: '',
    message: '',
  },
};

export function FestivalEmailModal({ clients, onClose }: FestivalEmailModalProps) {
  const { toast } = useToast();
  const [templateType, setTemplateType] = useState<keyof typeof FESTIVAL_TEMPLATES>('diwali');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, total: 0 });

  const getEmailContent = () => {
    if (templateType === 'custom') {
      return {
        subject: customSubject,
        message: customMessage,
      };
    }
    return FESTIVAL_TEMPLATES[templateType];
  };

  const handleSendToAll = async () => {
    const { subject, message } = getEmailContent();
    
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Missing Content",
        description: "Please provide both subject and message",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    setProgress({ sent: 0, total: clients.length });

    let successCount = 0;
    let failCount = 0;

    for (const client of clients) {
      try {
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #8b5cf6, #f59e0b); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">US Gymnasium</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 18px; color: #374151;">Dear ${client.name},</p>
              ${message.split('\n').map(line => `<p style="color: #374151; margin: 10px 0;">${line || '&nbsp;'}</p>`).join('')}
              <p style="color: #374151; margin-top: 20px;">Warm wishes,<br/><strong>US Gymnasium Team</strong></p>
            </div>
            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
              <p>© ${new Date().getFullYear()} US Gymnasium. All rights reserved.</p>
            </div>
          </div>
        `;

        await emailApi.send({
          clientId: client.clientId,
          emailType: 'festival',
          subject,
          html,
        });

        successCount++;
      } catch (error) {
        failCount++;
        console.error(`Failed to send to ${client.email}:`, error);
      }
      
      setProgress(prev => ({ ...prev, sent: prev.sent + 1 }));
    }

    setIsSending(false);

    if (successCount > 0) {
      toast({
        title: "Emails Sent! 🎉",
        description: `Successfully sent to ${successCount} member${successCount > 1 ? 's' : ''}${failCount > 0 ? `. Failed: ${failCount}` : ''}`,
      });
    } else {
      toast({
        title: "Failed to send emails",
        description: "Could not send emails. Please try again.",
        variant: "destructive",
      });
    }

    if (failCount === 0) {
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <PartyPopper className="w-6 h-6 text-primary" />
            Festival / Holiday Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm">
              This email will be sent to <strong>{clients.length}</strong> member{clients.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-2">
            <Label>Select Occasion</Label>
            <Select
              value={templateType}
              onValueChange={(value) => setTemplateType(value as keyof typeof FESTIVAL_TEMPLATES)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diwali">🪔 Diwali</SelectItem>
                <SelectItem value="holi">🎨 Holi</SelectItem>
                <SelectItem value="newyear">🎉 New Year</SelectItem>
                <SelectItem value="independence">🇮🇳 Independence Day</SelectItem>
                <SelectItem value="custom">✏️ Custom Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {templateType === 'custom' ? (
            <>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Enter email subject"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Type your message here..."
                  rows={6}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label>Message Preview</Label>
              <div className="p-4 rounded-lg bg-secondary/50 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                <p className="font-semibold mb-2">{FESTIVAL_TEMPLATES[templateType].subject}</p>
                <p>{FESTIVAL_TEMPLATES[templateType].message}</p>
              </div>
            </div>
          )}

          {isSending && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sending emails...</span>
                <span>{progress.sent} / {progress.total}</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(progress.sent / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              onClick={onClose}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button 
              variant="hero" 
              className="flex-1 gap-2" 
              onClick={handleSendToAll}
              disabled={isSending || clients.length === 0}
            >
              <Send className="w-4 h-4" />
              {isSending ? `Sending... (${progress.sent}/${progress.total})` : 'Send to All'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
