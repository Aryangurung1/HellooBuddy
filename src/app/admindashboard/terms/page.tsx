"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TermsAndConditionsDialog } from "@/components/TermsAndConditionsDialog";
import { TermsAndConditionsEditDialog } from "../components/TermsAndConditionEditDialog";
import { trpc } from "@/app/_trpc/client";
import { toast } from "react-hot-toast";
import Skeleton from "react-loading-skeleton";

export default function TermsAndConditionsPage() {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    data: termsData,
    isLoading,
    error,
    refetch,
  } = trpc.getLatestTermsAndConditions.useQuery();

  const updateTermsMutation = trpc.updateTermsAndConditions.useMutation({
    onSuccess: () => {
      toast.success("Terms and conditions updated successfully");
      refetch();
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to update terms: ${error.message}`);
    },
  });

  const handleEdit = (newContent: string) => {
    const newVersion = (parseFloat(termsData?.version || "1.0") + 0.1).toFixed(
      1
    );
    updateTermsMutation.mutate({ content: newContent, version: newVersion });
  };

  if (isLoading) {
    return <Skeleton height={100} className="my-2" count={3} />;
  }
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Terms and Conditions Management
      </h1>
      <div className="space-x-4">
        <Button onClick={() => setIsViewDialogOpen(true)}>
          View Current Terms
        </Button>
        <Button onClick={() => setIsEditDialogOpen(true)}>Edit Terms</Button>
      </div>
      {termsData && (
        <>
          <TermsAndConditionsDialog
            isOpen={isViewDialogOpen}
            onClose={() => setIsViewDialogOpen(false)}
            content={termsData.content}
            version={termsData.version}
          />
          <TermsAndConditionsEditDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            content={termsData.content}
            onSave={handleEdit}
            isSaving={updateTermsMutation.isPending}
          />
        </>
      )}
    </div>
  );
}
