"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Link from "next/link";
import { Gem, Loader2 } from "lucide-react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import { Icons } from "./Icons";
import { trpc } from "@/app/_trpc/client";
import Image from "next/image";

interface UserAccountNavProps {
  email: string | undefined;
  name: string;
  isLoading?: boolean;
}

const UserAccountNav = ({ email, name, isLoading }: UserAccountNavProps) => {
  const { data: subscriptionPlan } = trpc.getUserSubscriptionPlan.useQuery();
  const { data: currentUser } = trpc.getCurrentUser.useQuery();

  if (isLoading) {
    return (
      <Button className="rounded-full h-8 w-8 aspect-square bg-slate-400" disabled>
        <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible">
        <Button className="rounded-full h-8 w-8 aspect-square bg-slate-400">
          <Avatar className="relative w-8 h-8">
            {currentUser?.image ? (
              <Image
                src={currentUser.image}
                alt={name}
                fill
                className="object-cover"
              />
            ) : (
              <AvatarFallback>
                <span className="sr-only">{name}</span>
                <Icons.user className="h-4 w-4 text-zinc-900" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-0.5 leading-none">
            {name && <p className="font-medium text-sm text-black">{name}</p>}
            {email && (
              <p className="w-[200px] truncate text-xs text-zinc-700">
                {email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          {subscriptionPlan?.isSubscribed ? (
            <Link href="/dashboard/billing">Manage Subscription</Link>
          ) : (
            <Link href="/pricing">
              Upgrade <Gem className="text-blue-600 h-4 w-4 ml-1.5" />
            </Link>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile">My Profile</Link>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer" asChild>
          <LogoutLink>Log out</LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
