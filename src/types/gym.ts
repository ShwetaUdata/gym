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
  membershipType: MembershipType;
  membershipPeriod: number;
  startDate: string;
  endDate: string;
  registrationDay: string;
  createdAt: string;
  payments: Payment[];
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
