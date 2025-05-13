import BillingForm from "@/components/BillingForm";
import { getUserSubscriptionPlan } from "@/lib/stripe";

const Page = async () => {
  try {
    const subscriptionPlan = await getUserSubscriptionPlan();

    // Check if subscriptionPlan or its id is null/undefined
    if (!subscriptionPlan) {
      console.error("Invalid subscription plan data:", subscriptionPlan);
      throw new Error("Subscription plan not found or invalid data returned.");
    }

    return <BillingForm subscriptionPlan={subscriptionPlan} />;
  } catch (error) {
    console.log(error);
  }
};

export default Page;
