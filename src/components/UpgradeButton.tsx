"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const UpgradeButton = () => {
  const router = useRouter();

  return (
    <Button onClick={() => router.push("/payment-method")} className="w-full">
      Upgrade now <ArrowRight className="h-5 w-5 ml-1.5" />
    </Button>
  );
};

export default UpgradeButton;
