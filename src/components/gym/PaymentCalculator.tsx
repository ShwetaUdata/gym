import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Client } from '@/types/gym';
import { 
  calculateBasePrice, 
  getDayOffer, 
  getSpecialOffers, 
  calculateFinalPrice, 
  formatCurrency 
} from '@/utils/pricing';
import { Percent, Sparkles, CreditCard, Check } from 'lucide-react';

interface PaymentCalculatorProps {
  client: Client;
  onProceedToPayment: (amount: number, discount: number) => void;
}

export function PaymentCalculator({ client, onProceedToPayment }: PaymentCalculatorProps) {
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);
  const [showOffers, setShowOffers] = useState(true);

  const basePrice = calculateBasePrice(client.membershipType, client.membershipPeriod);
  const dayOffer = getDayOffer(new Date(client.createdAt));
  const specialOffers = getSpecialOffers(client.membershipType, client.membershipPeriod);
  
  const { finalPrice, totalDiscount } = calculateFinalPrice(
    basePrice,
    dayOffer,
    selectedOffer || undefined
  );

  const allOffers = [
    ...(dayOffer > 0 ? [{ type: `${client.registrationDay.charAt(0).toUpperCase() + client.registrationDay.slice(1)} Special`, percentage: dayOffer }] : []),
    ...specialOffers,
  ];

  const bestOffer = allOffers.reduce((best, offer) => 
    offer.percentage > (best?.percentage || 0) ? offer : best, 
    null as { type: string; percentage: number } | null
  );

  return (
    <Card variant="glass" className="animate-slide-up">
      <CardHeader>
        <CardTitle className="text-2xl gradient-text flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          Payment Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Breakdown */}
        <div className="space-y-3 p-4 rounded-xl bg-secondary/30">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Admission Fee</span>
            <span>₹100</span>
          </div>
          
          {client.membershipType.gym && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gym ({client.membershipPeriod} months)</span>
              <span>{formatCurrency(1500 * client.membershipPeriod)}</span>
            </div>
          )}
          
          {client.membershipType.cardio && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cardio ({client.membershipPeriod} months)</span>
              <span>{formatCurrency(500 * client.membershipPeriod)}</span>
            </div>
          )}
          
          {client.membershipType.crossfit && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Crossfit ({client.membershipPeriod} months)</span>
              <span>{formatCurrency(500 * client.membershipPeriod)}</span>
            </div>
          )}
          
          {client.membershipType.pt && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Personal Training ({client.membershipPeriod} months)</span>
              <span>{formatCurrency(12000 * client.membershipPeriod)}</span>
            </div>
          )}
          
          <div className="border-t border-border pt-3 flex justify-between font-semibold">
            <span>Subtotal</span>
            <span>{formatCurrency(basePrice)}</span>
          </div>
        </div>

        {/* Available Offers */}
        {allOffers.length > 0 && showOffers && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gym-gold" />
              Available Offers
            </h4>
            
            <div className="grid gap-3">
              {allOffers.map((offer, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOffer(offer.percentage)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                    selectedOffer === offer.percentage
                      ? 'border-primary bg-primary/10 glow-sm'
                      : 'border-border hover:border-primary/50 bg-secondary/20'
                  } ${offer === bestOffer ? 'animate-zoom-pulse' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedOffer === offer.percentage ? 'bg-primary' : 'bg-secondary'
                      }`}>
                        <Percent className={`w-5 h-5 ${
                          selectedOffer === offer.percentage ? 'text-primary-foreground' : 'text-primary'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold">{offer.type}</p>
                        <p className="text-sm text-muted-foreground">
                          Save {formatCurrency((basePrice * offer.percentage) / 100)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">{offer.percentage}%</span>
                      <span className="text-sm text-muted-foreground block">OFF</span>
                    </div>
                  </div>
                  
                  {selectedOffer === offer.percentage && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  
                  {offer === bestOffer && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gym-gold text-primary-foreground text-xs font-bold rounded-full">
                      BEST
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Final Amount */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-gym-gold/20 border border-primary/30">
          {totalDiscount > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Discount ({totalDiscount}%)</span>
              <span className="text-success">-{formatCurrency((basePrice * totalDiscount) / 100)}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount</span>
            <div className="text-right">
              {totalDiscount > 0 && (
                <span className="text-sm text-muted-foreground line-through block">
                  {formatCurrency(basePrice)}
                </span>
              )}
              <span className="text-3xl font-bold gradient-text">{formatCurrency(finalPrice)}</span>
            </div>
          </div>
        </div>

        <Button 
          variant="hero" 
          size="xl" 
          className="w-full"
          onClick={() => onProceedToPayment(finalPrice, totalDiscount)}
        >
          Proceed to Payment
        </Button>
      </CardContent>
    </Card>
  );
}
