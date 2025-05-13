import { db } from "@/db";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

const Page = async () => {
  const { isAuthenticated, getPermission } = getKindeServerSession();
  const isLoggedIn = await isAuthenticated();

  if (!isLoggedIn) {
    redirect("/sign-in");
  }

  const requiredPermission = await getPermission("admin:permission");

  if (requiredPermission?.isGranted) {
    redirect("/admindashboard");
  }

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) redirect("/auth-callback?origin=dashboard");

  const subscriptionPlan = await getUserSubscriptionPlan();

  return (
    <DashboardClient
      subscriptionPlan={subscriptionPlan}
      // hasAcceptedTerms={dbUser.hasAcceptedTerms}
      userId={user.id}
    />
  );
};

export default Page;
