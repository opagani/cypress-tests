// rental-manager
const PAYMENTS_LANDLORD_WEB = 'rental-manager/payments';

export const getLandlordPaymentsOnboardingUrl = (listingId: string) => {
  return `${PAYMENTS_LANDLORD_WEB}/properties/${listingId}`;
};
