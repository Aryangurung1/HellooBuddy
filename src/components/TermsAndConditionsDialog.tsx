// "use client";

// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { ScrollArea } from "@/components/ui/scroll-area";

// interface TermsAndConditionsDialogProps {
//   isOpen: boolean;
//   onAccept: () => void;
//   onReject: () => void;
// }

// export function TermsAndConditionsDialog({
//   isOpen,
//   onAccept,
//   onReject,
// }: TermsAndConditionsDialogProps) {
//   const [accepted, setAccepted] = useState(false);

//   return (
//     <Dialog open={isOpen} onOpenChange={() => {}}>
//       <DialogContent className="sm:max-w-[625px]">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-bold">
//             Terms and Conditions
//           </DialogTitle>
//           <DialogDescription>
//             Please read and accept our terms and conditions to continue using
//             HelloBuddy.
//           </DialogDescription>
//         </DialogHeader>
//         <ScrollArea className="h-[40vh] w-full rounded-md border p-4">
//           <div className="space-y-4 pr-4">
//             <p className="text-sm text-muted-foreground">
//               Welcome to our platform (the "HelloBuddy"). By using the Service,
//               you agree to the following terms and conditions. Please read them
//               carefully.
//             </p>

//             <section>
//               <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
//               <p className="text-sm">
//                 By accessing or using the Service, you confirm that you have
//                 read, understood, and agree to be bound by these Terms and
//                 Conditions, as well as our Privacy Policy. If you do not agree,
//                 you must not use the Service.
//               </p>
//             </section>

//             <section>
//               <h2 className="text-lg font-semibold">
//                 2. User Responsibilities
//               </h2>
//               <h3 className="text-md font-medium">
//                 2.1 Account Creation and Authentication
//               </h3>
//               <ul className="list-disc pl-5 text-sm">
//                 <li>
//                   You must create an account using our authentication system
//                   powered by Kinde.
//                 </li>
//                 <li>
//                   You are responsible for maintaining the confidentiality of
//                   your account credentials.
//                 </li>
//               </ul>
//               <h3 className="text-md font-medium mt-2">2.2 Usage Limits</h3>
//               <ul className="list-disc pl-5 text-sm">
//                 <li>
//                   Free-tier users have limited access to upload and interact
//                   with PDFs, including restrictions on file size and page count.
//                 </li>
//                 <li>
//                   Subscription users gain access to higher file size and page
//                   limits.
//                 </li>
//               </ul>
//               <h3 className="text-md font-medium mt-2">
//                 2.3 Prohibited Actions
//               </h3>
//               <p className="text-sm">You agree not to:</p>
//               <ul className="list-disc pl-5 text-sm">
//                 <li>Violate any laws or regulations.</li>
//                 <li>
//                   Upload PDFs containing illegal, harmful, or offensive content.
//                 </li>
//                 <li>Attempt to bypass usage limits or security measures.</li>
//               </ul>
//               <h3 className="text-md font-medium mt-2">2.4 Violations</h3>
//               <p className="text-sm">
//                 Accounts found violating these terms may be suspended or
//                 permanently deleted at the sole discretion of the Service.
//               </p>
//             </section>

//             <section>
//               <h2 className="text-lg font-semibold">
//                 3. User Data and Privacy
//               </h2>
//               <h3 className="text-md font-medium">3.1 Data Collection</h3>
//               <p className="text-sm">
//                 Your interactions with the chatbot, including uploaded PDFs, are
//                 stored securely in an encrypted format.
//               </p>
//               <h3 className="text-md font-medium mt-2">3.2 Data Usage</h3>
//               <ul className="list-disc pl-5 text-sm">
//                 <li>
//                   Administrators can view details such as which PDFs you have
//                   uploaded and delete them if necessary.
//                 </li>
//                 <li>
//                   Administrators cannot access your chat interactions unless
//                   required by law.
//                 </li>
//               </ul>
//               <h3 className="text-md font-medium mt-2">3.3 Data Security</h3>
//               <p className="text-sm">
//                 All user data is stored in a secure environment, akin to
//                 platforms like S3 buckets, to ensure the highest level of
//                 security and encryption.
//               </p>
//             </section>

//             <section>
//               <h2 className="text-lg font-semibold">4. Administrator Rights</h2>
//               <h3 className="text-md font-medium">4.1 Access to Information</h3>
//               <p className="text-sm">
//                 Administrators can only access user information or take action
//                 on accounts in compliance with applicable laws.
//               </p>
//               <h3 className="text-md font-medium mt-2">4.2 PDF Management</h3>
//               <p className="text-sm">
//                 Administrators may delete uploaded PDFs if deemed necessary for
//                 policy enforcement or legal compliance.
//               </p>
//             </section>

//             <section>
//               <h2 className="text-lg font-semibold">
//                 5. Subscription and Cancellation
//               </h2>
//               <h3 className="text-md font-medium">5.1 Subscription Benefits</h3>
//               <p className="text-sm">
//                 Paid subscription users enjoy increased file size limits,
//                 additional page access, and other premium features.
//               </p>
//               <h3 className="text-md font-medium mt-2">5.2 Cancellation</h3>
//               <p className="text-sm">
//                 You may cancel your subscription at any time. Upon cancellation,
//                 your access will revert to the free-tier limitations at the end
//                 of the billing cycle.
//               </p>
//             </section>

//             <section>
//               <h2 className="text-lg font-semibold">
//                 6. Limitation of Liability
//               </h2>
//               <ul className="list-disc pl-5 text-sm">
//                 <li>
//                   The Service is provided "as is" and "as available." We do not
//                   guarantee uninterrupted access or functionality.
//                 </li>
//                 <li>
//                   We are not responsible for any loss or damages resulting from
//                   your use of the Service, including but not limited to data
//                   breaches caused by factors beyond our control.
//                 </li>
//               </ul>
//             </section>

//             <section>
//               <h2 className="text-lg font-semibold">
//                 7. Modifications to Terms
//               </h2>
//               <p className="text-sm">
//                 We reserve the right to modify these Terms and Conditions at any
//                 time. Any changes will be communicated through the Service.
//                 Continued use after changes constitutes acceptance of the
//                 revised terms.
//               </p>
//             </section>

//             <section>
//               <h2 className="text-lg font-semibold">8. Governing Law</h2>
//               <p className="text-sm">
//                 These Terms and Conditions are governed by and construed in
//                 accordance with the laws of Nepal.
//               </p>
//             </section>
//           </div>
//         </ScrollArea>
//         <div className="flex items-center space-x-2 mt-4">
//           <Checkbox
//             id="terms"
//             checked={accepted}
//             onCheckedChange={(checked) => setAccepted(checked as boolean)}
//           />
//           <label
//             htmlFor="terms"
//             className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//           >
//             I have read and accept the terms and conditions
//           </label>
//         </div>
//         <DialogFooter className="mt-4">
//           <Button onClick={onReject} variant="outline">
//             Reject
//           </Button>
//           <Button onClick={onAccept} disabled={!accepted}>
//             Accept
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { ScrollArea } from "@/components/ui/scroll-area";

// interface TermsAndConditionsDialogProps {
//   isOpen: boolean;
//   onAccept: () => void;
//   onReject: () => void;
//   content: string;
// }

// export function TermsAndConditionsDialog({
//   isOpen,
//   onAccept,
//   onReject,
//   content,
// }: TermsAndConditionsDialogProps) {
//   return (
//     <Dialog open={isOpen} onOpenChange={onReject}>
//       <DialogContent className="sm:max-w-[625px]">
//         <DialogHeader>
//           <DialogTitle>Terms and Conditions</DialogTitle>
//           <DialogDescription>
//             Please read and accept our terms and conditions to continue using
//             our service.
//           </DialogDescription>
//         </DialogHeader>
//         <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
//           <div
//             className="prose prose-sm"
//             dangerouslySetInnerHTML={{ __html: content }}
//           />
//         </ScrollArea>
//       </DialogContent>
//     </Dialog>
//   );
// }

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface TermsAndConditionsDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  content: string;
  version: string;
  onAccept?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

export function TermsAndConditionsDialog({
  isOpen,
  onClose,
  content,
  version,
  onAccept,
  onReject,
  showActions = false,
}: TermsAndConditionsDialogProps) {
  const [accepted, setAccepted] = useState(false);

  const formattedContent = formatTermsContent(content);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Terms and Conditions
          </DialogTitle>
          <DialogDescription>
            Please read our terms and conditions carefully. Version: {version}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea
          className={`${
            showActions ? "h-[40vh]" : "h-[60vh]"
          } w-full rounded-md border p-4`}
        >
          <div className="space-y-4 pr-4">{formattedContent}</div>
        </ScrollArea>
        {showActions && (
          <>
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="terms"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and accept the terms and conditions
              </label>
            </div>
            <DialogFooter className="mt-4">
              <Button onClick={onReject} variant="outline">
                Reject
              </Button>
              <Button onClick={onAccept} disabled={!accepted}>
                Accept
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function formatTermsContent(content: string) {
  // Split the content into main sections
  const sections = content.split(/(?=^\d+\.\s)/m);

  return sections.map((section, index) => {
    const lines = section.split("\n");
    const mainTitle = lines[0].trim();
    const restContent = lines.slice(1);

    // Process the content of each main section
    const formattedContent = restContent.reduce((acc, line) => {
      const subtitleMatch = line.match(/^(\d+\.\d+)\s(.+)/);
      if (subtitleMatch) {
        // It's a subtitle
        if (acc.length > 0) {
          acc.push(
            <p
              key={`content-${acc.length}`}
              className="text-sm mt-2 leading-relaxed"
            >
              {acc.pop()}
            </p>
          );
        }
        acc.push(
          <p
            key={`subtitle-${subtitleMatch[1]}`}
            className="font-semibold text-base mt-4"
          >
            {subtitleMatch[1]} {subtitleMatch[2]}
          </p>
        );
      } else if (line.trim() !== "") {
        // It's content
        if (typeof acc[acc.length - 1] === "string") {
          acc[acc.length - 1] += " " + line.trim();
        } else {
          acc.push(line.trim());
        }
      }
      return acc;
    }, [] as (JSX.Element | string)[]);

    // Ensure any remaining content is wrapped in a paragraph
    if (typeof formattedContent[formattedContent.length - 1] === "string") {
      formattedContent.push(
        <p
          key={`content-${formattedContent.length}`}
          className="text-sm mt-2 leading-relaxed"
        >
          {formattedContent.pop() as string}
        </p>
      );
    }

    return (
      <section key={index} className="mt-6">
        <h2 className="text-lg font-bold mb-2">{mainTitle}</h2>
        {formattedContent}
      </section>
    );
  });
}
