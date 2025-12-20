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
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  discount: number;
  discountType: string;
  paidDate: string;
  notes: string;
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
  ptPerMonth: 12000,
};

export const DAY_OFFERS: Record<string, number> = {
  monday: 10,
  tuesday: 15,
  wednesday: 20,
  thursday: 10,
  friday: 15,
  saturday: 20,
  sunday: 0,
};

export const SPECIAL_OFFERS = {
  yearlyMembership: 25,
  gymPtCombo: 30,
};

// Month-based discount offers
export const MONTH_OFFERS: Record<number, number> = {
  1: 5,    // 1 month = 5%
  2: 7,    // 2 months = 7%
  3: 10,   // 3 months = 10%
  4: 12,   // 4 months = 12%
  5: 12,   // 5 months = 12%
  6: 15,   // 6 months = 15%
  7: 17,   // 7 months = 17%
  8: 17,   // 8 months = 17%
  9: 17,   // 9 months = 17%
  10: 17,  // 10 months = 17%
  11: 17,  // 11 months = 17%
};
