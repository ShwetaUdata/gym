import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Search, Scan } from 'lucide-react';
import { formatCurrency } from '@/utils/pricing';
import phonePeQR from '@/assets/phonepe-qr.jpeg';

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
    <Card variant="glass" className="animate-slide-up bg-black/90 border-purple-500/30">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">₱</span>
          </div>
          <span className="text-2xl font-semibold text-white">Payment Process</span>
        </div>
        <p className="text-purple-400 font-semibold tracking-wide">ACCEPTED HERE</p>
        <p className="text-gray-300 text-sm">Please scan & pay using online processer</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          {/* <p className="text-muted-foreground">Client: <span className="text-foreground font-medium">{clientName}</span></p> */}
          {/* <p className="text-muted-foreground">Client ID: <span className="text-primary font-medium">{clientId}</span></p> */}
        </div>

        <div className="flex justify-center">
          <div className="p-2 bg-white rounded-xl">
            <img 
              src={phonePeQR} 
              alt="PhonePe Payment QR Code" 
              className="w-64 h-64 object-contain rounded-lg"
            />
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-xl font-bold text-white uppercase tracking-wide">{clientName}</p>
          {/* <p className="text-gray-400 text-sm">Client ID: <span className="text-purple-400">{clientId}</span></p> */}
        </div>

        <div className="text-center p-4 rounded-xl bg-purple-600/20 border border-purple-500/30">
          <p className="text-sm text-gray-400 mb-1">Amount to Pay</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(amount)}</p>
        </div>

        <div className="text-center text-sm text-gray-400">
          <p>Open PhonePe app → Scan QR → Pay</p>
        </div>
      </CardContent>
    </Card>
  );
}
