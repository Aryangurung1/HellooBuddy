import { PLANS } from "@/config/stripe";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
  typescript: true,
});

export async function getUserSubscriptionPlan() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user.id) {
    return {
      ...PLANS[0],
      stripeSubscriptionId: null,
      stripeCustomerId: null,
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
      paymentMethod: "none",
      esewaCurrentPeriodEnd: null,
    };
  }

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    return {
      ...PLANS[0],
      stripeSubscriptionId: null,
      stripeCustomerId: null,
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
      paymentMethod: "none",
      esewaCurrentPeriodEnd: null,
    };
  }

  // const isSubscribed = Boolean(
  //   dbUser.stripePriceId &&
  //     dbUser.stripeCurrentPeriodEnd && // 86400000 = 1 day
  //     dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
  // );

  const isSubscribed = Boolean(
    (dbUser.stripeCurrentPeriodEnd &&
      dbUser.stripeCurrentPeriodEnd.getTime() > Date.now()) ||
      (dbUser.esewaCurrentPeriodEnd &&
        dbUser.esewaCurrentPeriodEnd.getTime() > Date.now())
  );

  const plan = isSubscribed
    ? dbUser.paymentMethod === "Stripe"
      ? PLANS.find((plan) => plan.price.priceIds.test === dbUser.stripePriceId)
      : PLANS.find((plan) => plan.slug === "esewa")
    : null;

  let isCanceled = false;
  if (isSubscribed && dbUser.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      dbUser.stripeSubscriptionId
    );
    isCanceled = stripePlan.cancel_at_period_end;
  }

  return {
    ...(plan ?? PLANS[0]),
    stripeSubscriptionId: dbUser.stripeSubscriptionId,
    stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
    stripeCustomerId: dbUser.stripeCustomerId,
    isSubscribed,
    isCanceled,
    paymentMethod: dbUser.paymentMethod || "none",
    esewaCurrentPeriodEnd: dbUser.esewaCurrentPeriodEnd,
  };
}
