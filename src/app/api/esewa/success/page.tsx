"use client";

import React, { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";

const EsewaSuccessContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dataQuery = searchParams.get("data");
  const [loading, setLoading] = useState(false);
  const [processed, setProcessed] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('payment_processed');
      return stored === 'true';
    }
    return false;
  });
  const [error, setError] = useState<string | null>(null);

  const updatePayment = trpc.updatePayment.useMutation();
  const navigateToDashboard = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  useEffect(() => {
    // Prevent multiple processing attempts
    if (processed || loading || !dataQuery) {
      console.log('Skipping payment processing:', { processed, loading, hasData: !!dataQuery });
      return;
    }

    const processPayment = async () => {
      try {
        console.log('Starting payment processing');
        setLoading(true);
        // Decode and parse the `data` parameter
        const decodedData = atob(dataQuery); // Decode Base64
        const parsedData = JSON.parse(decodedData); // Parse JSON

        const { transaction_code: transactionCode } = parsedData;
        console.log('Transaction code:', transactionCode);

        if (!transactionCode) {
          throw new Error("Invalid transaction code.");
        }

        await updatePayment.mutateAsync({ transactionCode });
        console.log('Payment processed successfully');
        setProcessed(true);
        // Store in localStorage
        localStorage.setItem('payment_processed', 'true');
        navigateToDashboard();
      } catch (error) {
        console.error("Error processing payment:", error);
        setError(error instanceof Error ? error.message : "Failed to update payment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [dataQuery, navigateToDashboard, updatePayment, processed, loading]);

  // Clean up localStorage when component unmounts
  useEffect(() => {
    return () => {
      if (processed) {
        // Only clear if we've successfully processed the payment
        localStorage.removeItem('payment_processed');
      }
    };
  }, [processed]);

  if (loading) {
    return <div className="text-center py-8">Processing your payment...</div>;
  }

  if (error) {
    return (
      <div className="payment-container text-center py-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => router.push("/dashboard")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="payment-container text-center py-8">
      <p className="text-2xl font-semibold">Payment Successful</p>
      <p className="text-lg text-green-600 mt-2">
        Redirecting to your dashboard...
      </p>
    </div>
  );
};

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <EsewaSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
