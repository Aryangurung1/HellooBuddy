"use client";

import DashboardWrapper from "./DashboardWrapper";
import type { SubscriptionPlan } from "@/types/subscription";

interface DashboardClientProps {
  subscriptionPlan: SubscriptionPlan;
  userId: string;
}

const DashboardClient: React.FC<DashboardClientProps> = ({
  subscriptionPlan,
  userId,
}) => {
  return (
    <DashboardWrapper subscriptionPlan={subscriptionPlan} userId={userId} />
  );
};

export default DashboardClient;