import { useState } from 'react';
import { Client } from '@/types/gym';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, calculateBasePrice } from '@/utils/pricing';
import { Send, Mail, Loader } from 'lucide-react';

interface SendEmailModalProps {
  client: Client;
  onClose: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to PowerFit Gym!',
    body: `Dear {{name}},

Welcome to the PowerFit Gym family! 🎉

We're thrilled to have you join us on your fitness journey. Your membership is now active and you can start working out immediately.

Membership Details:
- Client ID: {{clientId}}
- Start Date: {{startDate}}
- End Date: {{endDate}}

Remember, consistency is key! We can't wait to see you achieve your fitness goals.

Best regards,
PowerFit Gym Team`,
  },
  birthday: {
    subject: 'Happy Birthday from PowerFit Gym! 🎂',
    body: `Dear {{name}},

Happy Birthday! 🎉🎂

On this special day, the entire PowerFit Gym family wishes you health, happiness, and strength!

As a birthday treat, enjoy a special workout session on us. Visit the front desk to claim your birthday reward.

Keep crushing your goals!

Warm wishes,
PowerFit Gym Team`,
  },
  payment: {
    subject: 'Payment Reminder - PowerFit Gym',
    body: `Dear {{name}},

This is a friendly reminder regarding your membership payment.

Payment Status:
- Total Amount: {{totalAmount}}
- Paid: {{paidAmount}}
- Remaining: {{remainingAmount}}

Please complete your payment at your earliest convenience to continue enjoying uninterrupted access to our facilities.

If you have any questions, feel free to reach out.

Thank you,
PowerFit Gym Team`,
  },
  custom: {
    subject: '',
    body: '',
  },
};

export function SendEmailModal({ client, onClose }: SendEmailModalProps) {
  const { toast } = useToast();
  const [templateType, setTemplateType] = useState<keyof typeof EMAIL_TEMPLATES>('welcome');
  const [subject, setSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const totalPaid = client.payments?.reduce((sum, p) => sum + p.paidAmount, 0) || 0;
  const finalPrice = calculateBasePrice(client.membershipType, client.membershipPeriod);
  const remainingAmount = finalPrice - totalPaid;

  const getProcessedMessage = () => {
    if (templateType === 'custom') return customMessage;
    
    let body = EMAIL_TEMPLATES[templateType].body;
    body = body.replace(/{{name}}/g, client.name);
    body = body.replace(/{{clientId}}/g, client.clientId);
    body = body.replace(/{{startDate}}/g, new Date(client.startDate).toLocaleDateString());
    body = body.replace(/{{endDate}}/g, new Date(client.endDate).toLocaleDateString());
    body = body.replace(/{{totalAmount}}/g, formatCurrency(finalPrice));
    body = body.replace(/{{paidAmount}}/g, formatCurrency(totalPaid));
    body = body.replace(/{{remainingAmount}}/g, formatCurrency(remainingAmount));
    
    return body;
  };

  const getEmailSubject = () => {
    if (templateType === 'custom') return subject;
    return EMAIL_TEMPLATES[templateType].subject;
  };

  const handleSend = async () => {
    if (!getEmailSubject().trim()) {
      toast({
        title: "Missing Subject",
        description: "Please enter an email subject",
        variant: "destructive",
      });
      return;
    }

    if (!getProcessedMessage().trim()) {
      toast({
        title: "Missing Message",
        description: "Please enter email content",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: client.clientId,
          emailType: templateType,
          subject: getEmailSubject(),
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; white-space: pre-wrap;">${getProcessedMessage()}</div>`
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      toast({
        title: "Email Sent! ✉️",
        description: `Email has been successfully sent to ${client.email}`,
      });
      
      setIsSending(false);
      onClose();
    } catch (error) {
      setIsSending(false);
      toast({
        title: "Email Send Failed",
        description: error instanceof Error ? error.message : "Please ensure backend server is running on port 5000",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Send Email to {client.name}
          </DialogTitle>
          <DialogDescription>
            Choose an email template and customize the message before sending
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email Template</Label>
            <Select
              value={templateType}
              onValueChange={(value) => setTemplateType(value as keyof typeof EMAIL_TEMPLATES)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">Welcome Message</SelectItem>
                <SelectItem value="birthday">Birthday Wishes</SelectItem>
                <SelectItem value="payment">Payment Reminder</SelectItem>
                <SelectItem value="custom">Custom Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Recipient</Label>
            <p className="text-sm text-muted-foreground">{client.email}</p>
          </div>

          {templateType === 'custom' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="custom-subject">Subject</Label>
                <input
                  id="custom-subject"
                  type="text"
                  placeholder="Enter email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-message">Custom Message</Label>
                <Textarea
                  id="custom-message"
                  placeholder="Type your message here..."
                  rows={8}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Subject</Label>
                <p className="text-sm text-muted-foreground font-medium">{getEmailSubject()}</p>
              </div>
              <div className="space-y-2">
                <Label>Message Preview</Label>
                <div className="p-4 rounded-lg bg-secondary/50 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto border border-border">
                  {getProcessedMessage()}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="hero" 
              className="flex-1 gap-2" 
              onClick={handleSend}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
