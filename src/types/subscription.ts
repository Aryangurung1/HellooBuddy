export interface SubscriptionPlan {
  stripeSubscriptionId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  stripeCustomerId: string | null;
  isSubscribed: boolean;
  isCanceled: boolean;
  paymentMethod: string;
  esewaCurrentPeriodEnd: Date | null;
  name: string;
  slug: string;
  quota: number;
  pagesPerPdf: number;
  price: {
    amount: number;
    priceIds: {
      test: string;
      production: string;
    };
  };
} 