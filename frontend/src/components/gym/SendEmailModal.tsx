import { useState } from 'react';
import { Client } from '@/types/gym';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, calculateDiscountedPrice } from '@/utils/pricing';
import { emailApi } from '@/services/apiService';
import { Send, Mail } from 'lucide-react';

interface SendEmailModalProps {
  client: Client;
  onClose: () => void;
}

const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to US Gymnasium! 🎉',
    body: `Dear {{name}},

Welcome to the US Gymnasium family! 🎉

We're thrilled to have you join us on your fitness journey. Your membership is now active and you can start working out immediately.

Membership Details:
- Time Slot: {{slot}}
- Start Date: {{startDate}}
- End Date: {{endDate}}

Remember, consistency is key! We can't wait to see you achieve your fitness goals.

Best regards,
US Gymnasium Team`,
  },
  birthday: {
    subject: 'Happy Birthday from US Gymnasium! 🎂',
    body: `Dear {{name}},

Happy Birthday! 🎉🎂

On this special day, the entire US Gymnasium family wishes you health, happiness, and strength!

As a birthday treat, enjoy a special workout session on us. Visit the front desk to claim your birthday reward.

Keep crushing your goals!

Warm wishes,
US Gymnasium Team`,
  },
  payment: {
    subject: 'Payment Reminder - US Gymnasium',
    body: `Dear {{name}},

This is a friendly reminder regarding your membership payment.

Payment Status:
- Total Amount (After Discount): {{totalAmount}}
- Paid: {{paidAmount}}
- Remaining: {{remainingAmount}}

Please complete your payment at your earliest convenience to continue enjoying uninterrupted access to our facilities.

If you have any questions, feel free to reach out.

Thank you,
US Gymnasium Team`,
  },
  custom: {
    subject: 'Message from US Gymnasium',
    body: '',
  },
};

export function SendEmailModal({ client, onClose }: SendEmailModalProps) {
  const { toast } = useToast();
  const [templateType, setTemplateType] = useState<keyof typeof EMAIL_TEMPLATES>('welcome');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const totalPaid = client.payments?.reduce((sum, p) => sum + p.paidAmount, 0) || 0;
  const totalAmount = client.finalAmount || calculateDiscountedPrice(client.membershipType, client.membershipPeriod);
  const remainingAmount = totalAmount - totalPaid;

  const getProcessedMessage = () => {
    if (templateType === 'custom') return customMessage;
    
    let body = EMAIL_TEMPLATES[templateType].body;
    body = body.replace(/{{name}}/g, client.name);
    body = body.replace(/{{clientId}}/g, client.clientId);
    body = body.replace(/{{slot}}/g, client.slot ? client.slot.charAt(0).toUpperCase() + client.slot.slice(1) : 'Not specified');
    body = body.replace(/{{startDate}}/g, new Date(client.startDate).toLocaleDateString());
    body = body.replace(/{{endDate}}/g, new Date(client.endDate).toLocaleDateString());
    body = body.replace(/{{totalAmount}}/g, formatCurrency(totalAmount));
    body = body.replace(/{{paidAmount}}/g, formatCurrency(totalPaid));
    body = body.replace(/{{remainingAmount}}/g, formatCurrency(remainingAmount));
    
    return body;
  };

  const getHtmlMessage = () => {
  const subject =
    templateType === 'custom'
      ? 'Message from US Gymnasium'
      : EMAIL_TEMPLATES[templateType].subject;

  let contentHtml = '';

  // 🔴 PAYMENT TEMPLATE → TABLE FORMAT
  if (templateType === 'payment') {
    contentHtml = `
      <p>Dear <strong>${client.name}</strong>,</p>
      <p>This is a friendly reminder regarding your membership payment.</p>

      <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background:#f3f4f6;">
          <th style="border:1px solid #e5e7eb; padding:10px; text-align:left;">Description</th>
          <th style="border:1px solid #e5e7eb; padding:10px; text-align:right;">Amount</th>
        </tr>
        <tr>
          <td style="border:1px solid #e5e7eb; padding:10px;">Total Amount</td>
          <td style="border:1px solid #e5e7eb; padding:10px; text-align:right;">
            ${formatCurrency(totalAmount)}
          </td>
        </tr>
        <tr>
          <td style="border:1px solid #e5e7eb; padding:10px;">Paid Amount</td>
          <td style="border:1px solid #e5e7eb; padding:10px; text-align:right;">
            ${formatCurrency(totalPaid)}
          </td>
        </tr>
        <tr style="background:#fef2f2; font-weight:bold;">
          <td style="border:1px solid #e5e7eb; padding:10px; color:#dc2626;">Remaining Amount</td>
          <td style="border:1px solid #e5e7eb; padding:10px; text-align:right; color:#dc2626;">
            ${formatCurrency(remainingAmount)}
          </td>
        </tr>
      </table>

      <p>Please complete your payment to continue uninterrupted access.</p>
      <p>Thank you,<br/><strong>US Gymnasium Team</strong></p>
    `;
  }
  // 🟢 OTHER TEMPLATES → NORMAL TEXT
  else {
    const message = getProcessedMessage();
    contentHtml = message
      .split('\n')
      .map(
        line =>
          `<p style="margin: 10px 0; color: #374151;">${line || '&nbsp;'}</p>`
      )
      .join('');
  }

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
      
      <!-- HEADER -->
      <div style="background: linear-gradient(135deg, #8b5cf6, #f59e0b); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">US Gymnasium</h1>
      </div>

      <!-- CONTENT -->
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
        ${contentHtml}
      </div>

      <!-- FOOTER -->
      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
        <p>© ${new Date().getFullYear()} US Gymnasium. All rights reserved.</p>
      </div>
    </div>
  `;
};

  const handleSend = async () => {
    setIsSending(true);
    
    try {
      const subject = templateType === 'custom' ? 'Message from US Gymnasium' : EMAIL_TEMPLATES[templateType].subject;
      const html = getHtmlMessage();

      // Call Express backend API
      await emailApi.send({
        clientId: client.clientId,
        emailType: templateType,
        subject,
        html,
      });

      toast({
        title: "Email Sent! ✉️",
        description: `Email has been sent to ${client.email}`,
      });
      
      onClose();
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Failed to send email",
        description: error.message || "Please try again later. Make sure the backend server is running.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
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
            <div className="space-y-2">
              <Label>Custom Message</Label>
              <Textarea
                placeholder="Type your message here..."
                rows={8}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Message Preview</Label>
              <div className="p-4 rounded-lg bg-secondary/50 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                {getProcessedMessage()}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="hero" 
              className="flex-1 gap-2" 
              onClick={handleSend}
              disabled={isSending || (templateType === 'custom' && !customMessage.trim())}
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
