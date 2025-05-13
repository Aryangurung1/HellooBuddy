"use client";

import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import {
  LoginLink,
  RegisterLink,
  useKindeBrowserClient,
} from "@kinde-oss/kinde-auth-nextjs";
import { ArrowRight, Loader2 } from "lucide-react";
import UserAccountNav from "./UserAccountNav";
import MobileNav from "./MobileNav";
import { trpc } from "@/app/_trpc/client";

const Navbar = () => {
  const { user: kindeUser, isLoading: isKindeLoading } = useKindeBrowserClient();
  const { data: userData, isLoading: isUserDataLoading } = trpc.getCurrentUserFromKinde.useQuery(undefined, {
    enabled: !!kindeUser,
    retry: 3,
  });

  const isLoading = isKindeLoading || (!!kindeUser && isUserDataLoading);

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <span>HelloBuddy</span>
          </Link>

          <MobileNav isAuth={!!kindeUser} />

          <div className="hidden items-center space-x-4 sm:flex">
            {isLoading ? (
              // Show loading spinner while authentication is being checked
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
              </div>
            ) : !kindeUser ? (
              <>
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Pricing
                </Link>
                <LoginLink
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Sign in
                </LoginLink>
                <RegisterLink
                  className={buttonVariants({
                    size: "sm",
                  })}
                >
                  Get started <ArrowRight className="ml-1.5 h-5 w-5" />
                </RegisterLink>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Dashboard
                </Link>

                <UserAccountNav
                  name={
                    userData
                      ? `${userData.given_name || ''} ${userData.family_name || ''}`.trim() || "Your Account"
                      : "Your Account"
                  }
                  email={userData?.email || kindeUser.email || ""}
                  isLoading={isLoading}
                />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
