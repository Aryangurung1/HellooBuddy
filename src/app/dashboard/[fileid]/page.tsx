import ChatWrapper from "@/components/chat/ChatWrapper";
import PdfRenderer from "@/components/PdfRenderer";
import { PLANS } from "@/config/stripe";
import { db } from "@/db";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { notFound, redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import axios from "axios";

// Fixed type definition to match Next.js expectations
type PageProps = {
  params: Promise<{
    fileid: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const downloadFile = async (url: string, localPath: string) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(localPath, response.data);
};

const Page = async ({ params }: PageProps) => {
  //retrive the file id
  const { fileid } = await params;
  const subscriptionPlan = await getUserSubscriptionPlan();

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect(`/sign-in`);

  const file = await db.file.findFirst({
    where: {
      id: fileid,
      userId: user.id,
    },
  });

  if (!file) notFound();

  const tempFilePath = path.join(process.cwd(), "temp", `${file.id}.pdf`);
  fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
  await downloadFile(file.url, tempFilePath);

  const loader = new PDFLoader(tempFilePath);
  const pageLevelDocs = await loader.load();

  // Clean up temporary file
  fs.unlinkSync(tempFilePath);

  const pagesAmt = pageLevelDocs.length;
  const { isSubscribed } = subscriptionPlan;

  const isProExceeded =
    pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;

  const isFreeExceeded =
    pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

  const exceededLimit =
    (isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded);

  // Update file status based on the current limit
  if (exceededLimit && file.uploadStatus !== "FAILED") {
    await db.file.update({
      data: {
        uploadStatus: "FAILED",
      },
      where: {
        id: fileid,
      },
    });
  } else if (!exceededLimit && file.uploadStatus === "FAILED") {
    await db.file.update({
      data: {
        uploadStatus: "SUCCESS",
      },
      where: {
        id: fileid,
      },
    });
  }

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* left side */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <PdfRenderer url={file.url} />
          </div>
        </div>

        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <ChatWrapper
            fileId={file.id}
            isSubscribed={!!subscriptionPlan?.isSubscribed}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;