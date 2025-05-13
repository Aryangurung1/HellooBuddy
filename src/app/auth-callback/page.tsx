// "use client";

// import { useRouter, useSearchParams } from "next/navigation";
// import { trpc } from "../_trpc/client";
// import { Loader2 } from "lucide-react";
// import { useEffect } from "react";

// const AuthCallback = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const origin = searchParams.get("origin");

//   // TRPC Query for auth callback
//   const { isLoading, isSuccess, error } = trpc.authCallback.useQuery(
//     undefined,
//     {
//       retry: true,
//       retryDelay: 500,
//     }
//   );

//   // Effect to handle redirection based on the auth status
//   useEffect(() => {
//     if (error?.data?.code === "UNAUTHORIZED") {
//       router.push("/sign-in");
//     }

//     if (isSuccess) {
//       router.push(origin ? `/${origin}` : "/dashboard");
//     }
//   }, [isSuccess, error, origin, router]);

//   // Loading state UI
//   return (
//     <div className="w-full mt-24 flex justify-center">
//       <div className="flex flex-col items-center gap-2">
//         <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
//         <h3 className="font-semibold text-xl">Setting up your account...</h3>
//         <p>You will be redirected automatically.</p>
//         {isLoading && <p className="text-sm text-gray-600">Loading...</p>}
//         {error && (
//           <p className="text-sm text-red-500">Error: {error.message}</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AuthCallback;

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";
import { useEffect, Suspense } from "react";
import { toast } from "react-hot-toast"; // Importing toast

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  // TRPC Query for auth callback
  const { isLoading, data, error } = trpc.authCallback.useQuery(undefined, {
    retry: true,
    retryDelay: 500,
  });

  useEffect(() => {
    if (error?.data?.code === "UNAUTHORIZED") {
      router.push("/sign-in");
    }

    if (data?.success) {
      // Check if user is admin and redirect to admin dashboard
      if (data.isAdmin) {
        console.log("going on admin Dashboard");
        router.push("/admindashboard");
      } else {
        console.log("going into normal dashboard");
        router.push(origin ? `/${origin}` : "/dashboard");
      }
    }

    // Handle suspended user case and show a toast notification
    if (
      error?.message ===
      "Your account is temporarily suspended. Please contact support."
    ) {
      toast.error(
        "Your account is temporarily suspended. Please contact support."
      );
    }
  }, [error, data, origin, router]);

  // Loading state UI
  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected automatically.</p>
        {isLoading && <p className="text-sm text-gray-600">Loading...</p>}
        {error && (
          <p className="text-sm text-red-500">Error: {error.message}</p>
        )}
      </div>
    </div>
  );
};

export default function AuthCallbackWrapper() {
  return (
    <>
      <Suspense
        fallback={<Loader2 className="h-8 w-8 animate-spin text-zinc-800" />}
      >
        <AuthCallback />
      </Suspense>
    </>
  );
}
