import { useState } from "react";
import { Client } from "@/types/gym";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { emailApi } from "@/services/apiService";
import { formatCurrency, calculateDiscountedPrice } from "@/utils/pricing";
import {
  CreditCard,
  Send,
  Mail,
  User,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";

interface PendingPaymentsModalProps {
  clients: Client[];
  onClose: () => void;
  onAddPayment: (client: Client) => void;
}

const paymentKey = (clientId: string, remaining: number) =>
  `payment_reminder_${clientId}_${remaining}`;

const isPaymentReminderSent = (clientId: string, remaining: number) =>
  localStorage.getItem(paymentKey(clientId, remaining)) === "1";

const markPaymentReminderSent = (clientId: string, remaining: number) =>
  localStorage.setItem(paymentKey(clientId, remaining), "1");

export function PendingPaymentsModal({
  clients,
  onClose,
  onAddPayment,
}: PendingPaymentsModalProps) {
  const { toast } = useToast();
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [sentEmails, setSentEmails] = useState<Set<string>>(
    new Set(
      clients
        .filter((c) => {
          const totalPaid =
            c.payments?.reduce((s, p) => s + p.paidAmount, 0) || 0;
          const total =
            c.finalAmount ||
            calculateDiscountedPrice(c.membershipType, c.membershipPeriod);
          return isPaymentReminderSent(c.clientId, total - totalPaid);
        })
        .map((c) => c.clientId)
    )
  );

  // Get clients with pending payments
  const clientsWithPendingPayments = clients
    .filter((client) => {
      const totalPaid =
        client.payments?.reduce((sum, p) => sum + p.paidAmount, 0) || 0;
      const totalAmount =
        client.finalAmount ||
        calculateDiscountedPrice(
          client.membershipType,
          client.membershipPeriod
        );
      return totalAmount - totalPaid > 0;
    })
    .map((client) => {
      const totalPaid =
        client.payments?.reduce((sum, p) => sum + p.paidAmount, 0) || 0;
      const totalAmount =
        client.finalAmount ||
        calculateDiscountedPrice(
          client.membershipType,
          client.membershipPeriod
        );
      return {
        ...client,
        totalAmount,
        totalPaid,
        remainingAmount: totalAmount - totalPaid,
      };
    })
    .sort((a, b) => b.remainingAmount - a.remainingAmount);

  const handleSendReminder = async (
    client: (typeof clientsWithPendingPayments)[0]
  ) => {
    setSendingTo(client.clientId);

    try {
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #f59e0b); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Payment Reminder</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 18px; color: #374151;">Dear ${client.name},</p>
            <p style="color: #374151;">This is a friendly reminder regarding your membership payment at <strong>US Gymnasium</strong>.</p>
            
            <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">Payment Status:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Total Amount:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${client.totalAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Paid:</td>
                  <td style="padding: 8px 0; text-align: right; color: #22c55e; font-weight: bold;">₹${client.totalPaid.toLocaleString()}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #ef4444; font-weight: bold;">Remaining:</td>
                  <td style="padding: 12px 0; text-align: right; color: #ef4444; font-weight: bold; font-size: 18px;">₹${client.remainingAmount.toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #374151;">Please complete your payment at your earliest convenience to continue enjoying uninterrupted access to our facilities.</p>
            <p style="color: #374151; margin-top: 20px;">Thank you,<br/><strong>US Gymnasium Team</strong></p>
          </div>
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>© ${new Date().getFullYear()} US Gymnasium. All rights reserved.</p>
          </div>
        </div>
      `;

      await emailApi.send({
        clientId: client.clientId,
        emailType: "payment_reminder",
        subject: "Payment Reminder - US Gymnasium",
        html,
      });

      markPaymentReminderSent(client.clientId, client.remainingAmount);

      setSentEmails((prev) => {
        const next = new Set(prev);
        next.add(client.clientId);
        return next;
      });

      toast({
        title: "Reminder Sent! 📧",
        description: `Payment reminder sent to ${client.name}`,
      });
    } catch (error) {
      toast({
        title: "Failed to send email",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSendingTo(null);
    }
  };

  const totalPending = clientsWithPendingPayments.reduce(
    (sum, c) => sum + c.remainingAmount,
    0
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="w-6 h-6 text-primary" />
            Pending Payments
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {clientsWithPendingPayments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No pending payments!</p>
            </div>
          ) : (
            <>
              <Card
                variant="glass"
                className="bg-destructive/10 border-destructive/20"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      <span className="font-medium">Total Pending</span>
                    </div>
                    <span className="text-xl font-bold text-destructive">
                      {formatCurrency(totalPending)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {clientsWithPendingPayments.length} member
                    {clientsWithPendingPayments.length > 1
                      ? "s have"
                      : " has"}{" "}
                    pending payments
                  </p>
                </CardContent>
              </Card>

              {clientsWithPendingPayments.map((client) => (
                <Card key={client.clientId} variant="glass">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{client.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {client.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {client.clientId}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span>Total:</span>
                          <span>{formatCurrency(client.totalAmount)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-success">
                          <span>Paid:</span>
                          <span>{formatCurrency(client.totalPaid)}</span>
                        </div>
                        <div className="flex items-center gap-1 font-bold text-destructive mt-1">
                          <IndianRupee className="w-4 h-4" />
                          <span>{client.remainingAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onAddPayment(client);
                          onClose();
                        }}
                        className="gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Add Payment
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          sentEmails.has(client.clientId) ? "outline" : "hero"
                        }
                        onClick={() => handleSendReminder(client)}
                        disabled={
                          sendingTo === client.clientId ||
                          sentEmails.has(client.clientId)
                        }
                        className="gap-2"
                      >
                        {sentEmails.has(client.clientId) ? (
                          <>
                            <Mail className="w-4 h-4" />
                            Sent
                          </>
                        ) : sendingTo === client.clientId ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Reminder
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
