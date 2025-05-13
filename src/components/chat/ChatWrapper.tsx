"use client";

import { trpc } from "@/app/_trpc/client";
import ChatInput from "./ChatInput";
import Messages from "./Messages";
import { useEffect } from "react";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ChatContextProvider } from "./ChatContext";
import { PLANS } from "@/config/stripe";

interface ChatWrapperProps {
  fileId: string;
  isSubscribed: boolean;
}

const ChatWrapper = ({ fileId, isSubscribed }: ChatWrapperProps) => {
  const { data, isLoading, refetch } = trpc.getFileUploadStatus.useQuery({
    fileId,
  });
  const proPage = PLANS.find((plan) => plan.name === "Pro")?.pagesPerPdf;
  const freePage = PLANS.find((plan) => plan.name === "Free")?.pagesPerPdf;

  useEffect(() => {
    if (data?.status !== "SUCCESS" && data?.status !== "FAILED") {
      const intervalId = setInterval(() => {
        refetch();
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [data?.status, refetch]);

  if (isLoading)
    return (
      <div className="relative min-h-full bg-zince-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Loading...</h3>
            <p className="text-zinc-500 text-sm">
              We&apos;re preparing your PDF.
            </p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    );

  if (data?.status === "PROCESSING")
    return (
      <div className="relative min-h-full bg-zince-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Processing PDF...</h3>
            <p className="text-zinc-500 text-sm">This won&apos;t take long.</p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    );

  if (data?.status === "FAILED")
    return (
      <div className="relative min-h-full bg-zince-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-500" />
            <h3 className="font-semibold text-xl">Too many Pages in PDF</h3>

            {isSubscribed ? (
              <p className="text-zinc-500 text-sm">
                Your <span className="font-medium">Pro </span> plan supports up
                to {proPage} pages per PDF.
              </p>
            ) : (
              <p className="text-zinc-500 text-sm">
                Your <span className="font-medium">Free </span> plan supports up
                to {freePage} pages per PDF.{" "}
              </p>
            )}

            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "secondary",
                className: "mt-4",
              })}
            >
              <ChevronLeft className="h3 w-3 mr-1.5" />
              Back
            </Link>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    );

  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative min-h-full bg-zince-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 justify-between flex flex-col mb-28">
          <Messages fileId={fileId} />
        </div>
        <ChatInput />
      </div>
    </ChatContextProvider>
  );
};

export default ChatWrapper;
