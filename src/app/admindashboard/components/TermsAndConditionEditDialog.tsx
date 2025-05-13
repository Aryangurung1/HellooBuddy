import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface TermsAndConditionsEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onSave: (newContent: string) => void;
  isSaving: boolean;
}

export function TermsAndConditionsEditDialog({
  isOpen,
  onClose,
  content,
  onSave,
  isSaving,
}: TermsAndConditionsEditDialogProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditedContent(content);
    setHasChanges(false);
  }, [content, isOpen]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
    setHasChanges(e.target.value !== content);
  };

  const handleSave = () => {
    if (hasChanges) {
      onSave(editedContent);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Terms and Conditions</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] w-full rounded-md border">
          <Textarea
            value={editedContent}
            onChange={handleContentChange}
            className="min-h-[60vh] resize-none border-0"
          />
        </ScrollArea>
        <DialogFooter>
          <Button onClick={onClose} variant="outline" disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
