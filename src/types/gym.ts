export interface Client {
  id: number;
  clientId: string;
  name: string;
  address: string;
  occupation: string;
  mobile: string;
  dob: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  email: string;
  slot: 'morning' | 'evening';
  membershipType: MembershipType;
  membershipPeriod: number;
  startDate: string;
  endDate: string;
  registrationDay: string;
  createdAt: string;
  payments: Payment[];
  finalAmount?: number;
  termsAcceptedBy?: string;
  photo?: string;
}

export interface MembershipType {
  gym: boolean;
  cardio: boolean;
  crossfit: boolean;
  pt: boolean;
}

export interface Payment {
  id: number;
  clientId: string;
  clientName?: string;
  amount: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  membershipPeriod?: number;
  offerDiscount?: number;
  discount: number;
  discountType: string;
  paidDate: string;
  notes: string;
  createdAt?: string;
  freeMonths?: number; // For PT free months offer
}

export interface PricingConfig {
  admissionFee: number;
  gymPerMonth: number;
  cardioPerMonth: number;
  crossfitPerMonth: number;
  ptPerMonth: number;
}

export const PRICING: PricingConfig = {
  admissionFee: 100,
  gymPerMonth: 1500,
  cardioPerMonth: 500,
  crossfitPerMonth: 500,
  ptPerMonth: 15000, // Updated from 12000 to 15000
};

// Membership type + duration based offers
export interface MembershipOffer {
  membershipKey: string;
  months: number;
  discountPercent: number;
  freeMonths?: number; // For PT alternative offer
  label: string;
}

// All offers based on membership type and duration
export const MEMBERSHIP_OFFERS: MembershipOffer[] = [
  // Gym only
  { membershipKey: 'gym', months: 3, discountPercent: 10, label: 'Gym 3 Months - 10% Off' },
  { membershipKey: 'gym', months: 6, discountPercent: 20, label: 'Gym 6 Months - 20% Off' },
  { membershipKey: 'gym', months: 12, discountPercent: 30, label: 'Gym 12 Months - 30% Off' },
  
  // Gym + Cardio
  { membershipKey: 'gym_cardio', months: 3, discountPercent: 10, label: 'Gym + Cardio 3 Months - 10% Off' },
  { membershipKey: 'gym_cardio', months: 6, discountPercent: 20, label: 'Gym + Cardio 6 Months - 20% Off' },
  { membershipKey: 'gym_cardio', months: 12, discountPercent: 40, label: 'Gym + Cardio 12 Months - 40% Off' },
  
  // Gym + Cardio + Crossfit
  { membershipKey: 'gym_cardio_crossfit', months: 3, discountPercent: 20, label: 'Gym + Cardio + Crossfit 3 Months - 20% Off' },
  { membershipKey: 'gym_cardio_crossfit', months: 6, discountPercent: 30, label: 'Gym + Cardio + Crossfit 6 Months - 30% Off' },
  { membershipKey: 'gym_cardio_crossfit', months: 12, discountPercent: 50, label: 'Gym + Cardio + Crossfit 12 Months - 50% Off' },
  
  // PT offers (discount option)
  { membershipKey: 'pt', months: 3, discountPercent: 10, label: 'PT 3 Months - 10% Off' },
  { membershipKey: 'pt', months: 6, discountPercent: 20, label: 'PT 6 Months - 20% Off' },
  { membershipKey: 'pt', months: 12, discountPercent: 40, label: 'PT 12 Months - 40% Off' },
  
  // PT offers (free months option)
  { membershipKey: 'pt_free', months: 3, discountPercent: 0, freeMonths: 1, label: 'PT 3 Months + 1 Month Free' },
  { membershipKey: 'pt_free', months: 6, discountPercent: 0, freeMonths: 3, label: 'PT 6 Months + 3 Months Free' },
  { membershipKey: 'pt_free', months: 12, discountPercent: 0, freeMonths: 6, label: 'PT 12 Months + 6 Months Free' },
];

// Helper function to get membership key from membership type
export function getMembershipKey(membershipType: MembershipType): string {
  const hasGym = membershipType.gym;
  const hasCardio = membershipType.cardio;
  const hasCrossfit = membershipType.crossfit;
  const hasPT = membershipType.pt;
  
  // PT only
  if (hasPT && !hasGym && !hasCardio && !hasCrossfit) {
    return 'pt';
  }
  
  // Gym + Cardio + Crossfit
  if (hasGym && hasCardio && hasCrossfit && !hasPT) {
    return 'gym_cardio_crossfit';
  }
  
  // Gym + Cardio
  if (hasGym && hasCardio && !hasCrossfit && !hasPT) {
    return 'gym_cardio';
  }
  
  // Gym only
  if (hasGym && !hasCardio && !hasCrossfit && !hasPT) {
    return 'gym';
  }
  
  return 'none';
}

// Legacy exports (kept for backward compatibility but not used)
export const DAY_OFFERS: Record<string, number> = {};
export const SPECIAL_OFFERS = {};
export const MONTH_OFFERS: Record<number, number> = {};
