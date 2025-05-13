import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsAndConditionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  version: string;
}

export function TermsAndConditionsDialog({
  isOpen,
  onClose,
  content,
  version,
}: TermsAndConditionsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Terms and Conditions (Version {version})</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
          <div
            className="prose prose-sm"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
