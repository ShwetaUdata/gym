import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Search, Scan } from 'lucide-react';
import { formatCurrency } from '@/utils/pricing';

interface QRScannerProps {
  amount: number;
  clientId: string;
  clientName: string;
}

export function QRScanner({ amount, clientId, clientName }: QRScannerProps) {
  const [showQR, setShowQR] = useState(true);

  // Generate a simple QR code data URL using a placeholder service
  const qrData = encodeURIComponent(`upi://pay?pa=powerfit@upi&pn=PowerFit Gym&am=${amount}&cu=INR&tn=Membership-${clientId}`);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrData}`;

  return (
    <Card variant="glass" className="animate-slide-up">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl gradient-text flex items-center justify-center gap-2">
          <QrCode className="w-6 h-6" />
          Scan to Pay
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Client: <span className="text-foreground font-medium">{clientName}</span></p>
          <p className="text-muted-foreground">Client ID: <span className="text-primary font-medium">{clientId}</span></p>
        </div>

        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-2xl glow">
            {showQR ? (
              <img 
                src={qrCodeUrl} 
                alt="Payment QR Code" 
                className="w-64 h-64 rounded-lg"
                onError={() => setShowQR(false)}
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-secondary rounded-lg">
                <div className="text-center space-y-2">
                  <Scan className="w-16 h-16 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">QR Code</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/20 to-gym-gold/20 border border-primary/30">
          <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
          <p className="text-4xl font-bold gradient-text">{formatCurrency(amount)}</p>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Scan the QR code with any UPI app to complete payment</p>
        </div>
      </CardContent>
    </Card>
  );
}
