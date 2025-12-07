import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface TermsAndConditionsModalProps {
  open: boolean;
  onAccept: (typedName: string) => void;
  onReject: () => void;
  clientName: string;
}

const TERMS_CONTENT = `
POWERFIT GYM - TERMS AND CONDITIONS

Effective Date: December 2024

1. MEMBERSHIP AGREEMENT
This agreement is between PowerFit Gym (hereinafter "Gym") and the member (hereinafter "Member"). By accepting these terms, the Member agrees to comply with all Gym policies and procedures.

2. MEMBERSHIP DURATION
- Membership period is as selected during registration
- Membership is non-transferable
- Renewal is automatic unless cancelled in writing 30 days before expiration

3. PAYMENT TERMS
- Full payment or initial installment must be made before membership activation
- Remaining balance (if applicable) must be paid as per agreed schedule
- Late payments may result in membership suspension
- Gym reserves the right to cancel membership for non-payment

4. FACILITIES AND EQUIPMENT
- Members must use equipment according to instructions provided by Gym staff
- Members are responsible for their own injuries resulting from misuse
- Gym is not liable for damage or loss of personal belongings
- Smoking, alcohol, and illegal substances are strictly prohibited

5. CODE OF CONDUCT
- Members must treat all staff and other members with respect
- Loud or abusive behavior is not permitted
- Members must follow hygiene standards
- Members must follow equipment usage rules

6. CANCELLATION POLICY
- Membership can be cancelled with 30 days written notice
- Refund policy follows the Gym's current refund policy
- No refunds for unused portion of membership after cancellation

7. LIABILITY WAIVER
- Member acknowledges the physical risks associated with gym activities
- Member assumes all risk of personal injury or death
- Gym is not responsible for injuries caused by equipment or exercises
- Member releases Gym from all liability

8. PRIVACY AND DATA PROTECTION
- Personal information collected will be used for membership management
- Information will not be shared with third parties without consent
- Member data is protected according to privacy laws

9. MODIFICATION OF TERMS
- Gym reserves the right to modify these terms with 30 days notice
- Continued membership after modification constitutes acceptance

10. DISPUTE RESOLUTION
- Any disputes will be resolved through mutual discussion
- If unresolved, disputes will be handled through legal channels

By signing below, the Member acknowledges:
✓ I have read and understood all terms and conditions
✓ I agree to abide by all Gym policies and rules
✓ I assume all risks associated with gym activities
✓ I am physically fit to engage in exercise
✓ I accept responsibility for my own safety
`;

export function TermsAndConditionsModal({
  open,
  onAccept,
  onReject,
  clientName,
}: TermsAndConditionsModalProps) {
  const [agree, setAgree] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [typedName, setTypedName] = useState(clientName);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isBottom = scrollHeight - scrollTop <= clientHeight + 20;
    setScrolledToBottom(isBottom);
  };

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setAgree(false);
      setScrolledToBottom(false);
      setTypedName(clientName);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [open, clientName]);

  const handleAccept = () => {
    if (agree && scrolledToBottom && typedName.trim()) {
      onAccept(typedName);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Terms and Conditions</DialogTitle>
          <DialogDescription>
            Please read and accept the terms to continue with your membership registration
          </DialogDescription>
        </DialogHeader>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 border rounded-lg p-4 bg-secondary/30 overflow-y-auto"
        >
          <div className="space-y-4">
            <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono text-foreground/90">
              {TERMS_CONTENT}
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-3">Member Information:</h4>
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-3">
                <div>
                  <label className="text-sm font-semibold block mb-2">Client Name:</label>
                  <input 
                    type="text" 
                    value={typedName} 
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border border-foreground/20 rounded bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <p className="text-sm">
                  <span className="font-semibold">Date of Acceptance:</span>{' '}
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          {!scrolledToBottom && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Please scroll down to view all terms before accepting
              </p>
            </div>
          )}

          <div className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-lg">
            <Checkbox
              id="agree"
              checked={agree}
              onCheckedChange={(checked) => setAgree(checked as boolean)}
              disabled={!scrolledToBottom}
            />
            <Label htmlFor="agree" className="flex-1 cursor-pointer">
              <span className="text-sm font-medium">
                I have read and agree to the Terms and Conditions of PowerFit Gym
              </span>
            </Label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onReject}
            >
              Decline
            </Button>
            <Button
              variant="hero"
              className="flex-1"
              onClick={handleAccept}
              disabled={!agree || !scrolledToBottom || !typedName.trim()}
            >
              Accept & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
