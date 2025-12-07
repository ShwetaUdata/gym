import { useState } from 'react';
import { Client } from '@/types/gym';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, calculateBasePrice } from '@/utils/pricing';
import { CreditCard, IndianRupee } from 'lucide-react';

interface PaymentModalProps {
  client: Client;
  onClose: () => void;
  offerAmount?: number;
}

export function PaymentModal({ client, onClose, offerAmount }: PaymentModalProps) {
  const { addPayment } = useGym();
  const { toast } = useToast();
  
  const totalPaid = client.payments?.reduce((sum, p) => sum + p.paidAmount, 0) || 0;
  const baseAmount = calculateBasePrice(client.membershipType, client.membershipPeriod);
  const finalAmount = offerAmount || baseAmount;
  const remainingAmount = finalAmount - totalPaid;

  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    const newRemainingAmount = remainingAmount - paymentAmount;

    addPayment(client.clientId, {
      amount: baseAmount,
      finalAmount: finalAmount,
      paidAmount: paymentAmount,
      remainingAmount: Math.max(0, newRemainingAmount),
      discount: offerAmount ? baseAmount - offerAmount : 0,
      discountType: offerAmount ? 'offer' : '',
      paidDate,
      notes,
    });

    toast({
      title: "Payment Recorded! 💰",
      description: `${formatCurrency(paymentAmount)} payment recorded for ${client.name}`,
    });

    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record payment for {client.name}. Remaining amount: {formatCurrency(remainingAmount)}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-gym-gold/10 border border-primary/20 mb-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Due</p>
              <p className="text-xl font-bold">{formatCurrency(finalAmount)}</p>
              {offerAmount && offerAmount < baseAmount && (
                <p className="text-xs text-muted-foreground line-through">{formatCurrency(baseAmount)}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-xl font-bold text-destructive">{formatCurrency(remainingAmount)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                className="pl-10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidDate">Payment Date</Label>
            <Input
              id="paidDate"
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" className="flex-1">
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
