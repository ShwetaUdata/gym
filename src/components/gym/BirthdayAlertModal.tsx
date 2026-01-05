import { useState } from 'react';
import { Client } from '@/types/gym';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { emailApi } from '@/services/apiService';
import { Cake, Send, Mail, User } from 'lucide-react';

interface BirthdayAlertModalProps {
  clients: Client[];
  onClose: () => void;
}

export function BirthdayAlertModal({ clients, onClose }: BirthdayAlertModalProps) {
  const { toast } = useToast();
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [sentEmails, setSentEmails] = useState<Set<string>>(new Set());

  // Get today's birthday clients
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  const birthdayClients = clients.filter((client) => {
    if (!client.dob) return false;
    
    // Handle different DOB formats
    let dobDate: Date;
    if (client.dob.includes('-')) {
      // Format: DD-MM-YYYY or YYYY-MM-DD
      const parts = client.dob.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        dobDate = new Date(client.dob);
      } else {
        // DD-MM-YYYY
        dobDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    } else if (client.dob.includes('/')) {
      // Format: DD/MM/YYYY
      const parts = client.dob.split('/');
      dobDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      return false;
    }
    
    return dobDate.getMonth() + 1 === todayMonth && dobDate.getDate() === todayDay;
  });

  const handleSendBirthdayEmail = async (client: Client) => {
    setSendingTo(client.clientId);
    
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #f59e0b); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🎂 Happy Birthday! 🎉</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 18px; color: #374151;">Dear ${client.name},</p>
            <p style="color: #374151;">On this special day, the entire <strong>US Gymnasium</strong> family wishes you health, happiness, and strength!</p>
            <p style="color: #374151;">As a birthday treat, enjoy a special workout session on us. Visit the front desk to claim your birthday reward.</p>
            <p style="color: #374151;">Keep crushing your goals!</p>
            <p style="color: #374151; margin-top: 20px;">Warm wishes,<br/><strong>US Gymnasium Team</strong></p>
          </div>
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>© ${new Date().getFullYear()} US Gymnasium. All rights reserved.</p>
          </div>
        </div>
      `;

      await emailApi.send({
        clientId: client.clientId,
        emailType: 'birthday',
        subject: `Happy Birthday ${client.name}! 🎂🎉 - US Gymnasium`,
        html,
      });

      setSentEmails(prev => new Set([...prev, client.clientId]));
      
      toast({
        title: "Birthday Email Sent! 🎂",
        description: `Birthday wishes sent to ${client.name}`,
      });
    } catch (error) {
      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSendingTo(null);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Cake className="w-6 h-6 text-primary" />
            Today's Birthdays
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {birthdayClients.length === 0 ? (
            <div className="text-center py-8">
              <Cake className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No birthdays today!</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {birthdayClients.length} member{birthdayClients.length > 1 ? 's have' : ' has'} birthday today!
              </p>
              
              {birthdayClients.map((client) => (
                <Card key={client.clientId} variant="glass">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                          <p className="text-xs text-muted-foreground">ID: {client.clientId}</p>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant={sentEmails.has(client.clientId) ? "outline" : "hero"}
                        onClick={() => handleSendBirthdayEmail(client)}
                        disabled={sendingTo === client.clientId || sentEmails.has(client.clientId)}
                        className="gap-2"
                      >
                        {sentEmails.has(client.clientId) ? (
                          <>
                            <Mail className="w-4 h-4" />
                            Sent
                          </>
                        ) : sendingTo === client.clientId ? (
                          'Sending...'
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Wish
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
