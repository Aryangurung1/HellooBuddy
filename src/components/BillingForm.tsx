"use client";

import { getUserSubscriptionPlan } from "@/lib/stripe";
import { trpc } from "@/app/_trpc/client";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { cn } from "@/lib/utils";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface BillingFormProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}

const BillingForm = ({ subscriptionPlan }: BillingFormProps) => {
  const { toast } = useToast();
  // const [isLoading, setIsLoading] = useState(false);

  const { mutate: createStripeSession, isPending } =
    trpc.createStripeSession.useMutation({
      // onMutate: () => setIsLoading(true),
      onSuccess: ({ url }) => {
        console.log("Stripe session URL:", url);
        // setIsLoading(false);
        if (url) window.location.href = url;
        if (!url) {
          toast({
            title: "There was a problem...",
            description: "Please try again in a moment",
            variant: "destructive",
          });
        }
      },
      onError: () => {
        // setIsLoading(false);
        toast({
          title: "Error",
          description: "Something went wrong. Please try again later.",
          variant: "destructive",
        });
      },
    });

  return (
    <MaxWidthWrapper className="max-w-5xl">
      <form
        className="mt-12"
        onSubmit={(e) => {
          e.preventDefault();
          createStripeSession();
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              You are currently on the <strong>{subscriptionPlan.name}</strong>{" "}
              plan.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
            <Button
              type="submit"
              className={cn(
                "block",
                subscriptionPlan.paymentMethod === "eSewa" && "hidden"
              )}
            >
              {isPending ? (
                <Loader2 className="mr-4 h-4 w-4 animate-spin" />
              ) : null}
              {subscriptionPlan.isSubscribed
                ? "Manage Subscription"
                : "Upgrade to PRO"}
            </Button>

            {subscriptionPlan.isSubscribed ? (
              <p className="rounded-full text-xs font-medium">
                {subscriptionPlan.isCanceled
                  ? "Your plan will be canceled on "
                  : "Your plan renews on"}
                {subscriptionPlan.paymentMethod === "Stripe"
                  ? format(
                      subscriptionPlan.stripeCurrentPeriodEnd!,
                      "dd.MM.yyyy"
                    )
                  : format(
                      subscriptionPlan.esewaCurrentPeriodEnd!,
                      "dd.MM.yyyy"
                    )}
                .
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </MaxWidthWrapper>
  );
};

export default BillingForm;
