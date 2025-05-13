export type Invoice = {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
  };
  description: string | null;
  status: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentId: string | null;
  subscriptionPeriodStart: string;
  subscriptionPeriodEnd: string;
  paidAt: string | null;
  createdAt: string;
};
