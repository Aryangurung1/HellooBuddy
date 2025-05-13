"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { TermsAndConditionsDialog } from "@/components/TermsAndConditionsDialog";
import { trpc } from "@/app/_trpc/client";
import { toast } from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import type { SubscriptionPlan } from "@/types/subscription";

interface DashboardWrapperProps {
  subscriptionPlan: SubscriptionPlan;
  userId: string;
}

const DashboardWrapper: React.FC<DashboardWrapperProps> = ({
  subscriptionPlan,
}) => {
  const [showTerms, setShowTerms] = useState(false);
  const router = useRouter();

  const { data: userTermsStatus, isLoading } =
    trpc.getUserTermsStatus.useQuery();
  const { data: termsAndConditions } = trpc.getTermsAndConditions.useQuery();

  const { mutate: acceptTerms } = trpc.acceptTermsAndConditions.useMutation({
    onSuccess: () => {
      setShowTerms(false);
      toast.success("Terms and conditions accepted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: rejectTerms } = trpc.rejectTermsAndConditions.useMutation({
    onSuccess: () => {
      router.push("/api/auth/logout");
      toast.success("You have been logged out");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!isLoading && userTermsStatus && !userTermsStatus.hasAcceptedTerms) {
      setShowTerms(true);
    }
  }, [userTermsStatus, isLoading]);

  const handleAcceptTerms = () => {
    acceptTerms();
  };

  const handleRejectTerms = () => {
    rejectTerms();
  };

  if (isLoading || !termsAndConditions) {
    return <Skeleton height={100} className="my-2" count={3} />;
  }

  if (showTerms) {
    return (
      <TermsAndConditionsDialog
        isOpen={showTerms}
        onAccept={handleAcceptTerms}
        onReject={handleRejectTerms}
        content={termsAndConditions.content}
        version={termsAndConditions.version}
        showActions={true}
      />
    );
  }

  return <Dashboard subscriptionPlan={subscriptionPlan} />;
};

export default DashboardWrapper;