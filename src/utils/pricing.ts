import { MembershipType, PRICING, DAY_OFFERS, SPECIAL_OFFERS, MONTH_OFFERS } from '@/types/gym';

export function calculateBasePrice(membershipType: MembershipType, months: number): number {
  let monthlyTotal = 0;
  
  if (membershipType.gym) monthlyTotal += PRICING.gymPerMonth;
  if (membershipType.cardio) monthlyTotal += PRICING.cardioPerMonth;
  if (membershipType.crossfit) monthlyTotal += PRICING.crossfitPerMonth;
  if (membershipType.pt) monthlyTotal += PRICING.ptPerMonth;
  
  return PRICING.admissionFee + (monthlyTotal * months);
}

export function getDayOfWeek(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

export function getDayOffer(date: Date): number {
  const day = getDayOfWeek(date);
  return DAY_OFFERS[day] || 0;
}

export function getMonthOffer(months: number): number {
  // For 12+ months, yearly offer applies separately
  if (months >= 12) return 0;
  return MONTH_OFFERS[months] || 0;
}

export function getSpecialOffers(membershipType: MembershipType, months: number): { type: string; percentage: number }[] {
  const offers: { type: string; percentage: number }[] = [];
  
  // Month-based offer (only for less than 12 months)
  const monthOffer = getMonthOffer(months);
  if (monthOffer > 0) {
    offers.push({ type: `${months} Month${months > 1 ? 's' : ''} Membership`, percentage: monthOffer });
  }
  
  // Yearly membership offer
  if (months >= 12) {
    offers.push({ type: 'Yearly Membership', percentage: SPECIAL_OFFERS.yearlyMembership });
  }
  
  // Gym + PT combo offer
  if (membershipType.gym && membershipType.pt) {
    offers.push({ type: 'Gym + PT Combo', percentage: SPECIAL_OFFERS.gymPtCombo });
  }
  
  return offers;
}

export function calculateFinalPrice(
  basePrice: number,
  dayOffer: number,
  selectedSpecialOffer?: number
): { finalPrice: number; totalDiscount: number } {
  let discount = 0;
  
  if (selectedSpecialOffer) {
    discount = Math.max(dayOffer, selectedSpecialOffer);
  } else {
    discount = dayOffer;
  }
  
  const discountAmount = (basePrice * discount) / 100;
  const finalPrice = basePrice - discountAmount;
  
  return { finalPrice, totalDiscount: discount };
}

// Calculate discounted price based on membership period for admin dashboard display
export function calculateDiscountedPrice(membershipType: MembershipType, months: number): number {
  const basePrice = calculateBasePrice(membershipType, months);
  const offers = getSpecialOffers(membershipType, months);
  
  // Get the best offer percentage
  let maxOffer = 0;
  offers.forEach(offer => {
    if (offer.percentage > maxOffer) {
      maxOffer = offer.percentage;
    }
  });
  
  const discountAmount = (basePrice * maxOffer) / 100;
  return basePrice - discountAmount;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateEndDate(startDate: string, months: number): string {
  const start = new Date(startDate);
  start.setMonth(start.getMonth() + months);
  return start.toISOString().split('T')[0];
}

export function calculateAge(dob: string): number {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
