"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Trash2, FileText, FileX } from "lucide-react";
import { format } from "date-fns";

interface PDFFile {
  id: string;
  name: string;
  createdAt: string;
  url: string;
}

export function PDFManager({
  userId,
  isPending,
  setIsPending,
}: {
  userId: string;
  setIsPending: Dispatch<SetStateAction<boolean>>;
  isPending: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<PDFFile | null>(null);
  const [pdfToDelete, setPdfToDelete] = useState<PDFFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: pdfs,
    isLoading: isPDFsLoading,
    refetch,
  } = trpc.getUserPDFs.useQuery<PDFFile[]>({ userId });
  const { mutate: deletePDF } = trpc.deletePDF.useMutation({
    onSuccess: () => {
      refetch();
      setPdfToDelete(null);
      setIsDeleting(false);
    },
    onError: () => {
      setIsDeleting(false);
    }
  });

  useEffect(() => {
    // console.log("ispending", isPending);
    // console.log("isPDFpending", isPDFsLoading);
    if (!isPDFsLoading && !isPending) {
      setIsPending(false);
    }
  }, [isPDFsLoading, isPending, setIsPending]);

  console.log("hello", !isPDFsLoading && !isPending);
  if (isPDFsLoading) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  const truncateName = (name: string, maxLength: number) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + "...";
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Show PDFs</Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px] sm:h-[60vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>User PDFs</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-hidden">
            {pdfs && pdfs.length > 0 ? (
              <ScrollArea className="h-full">
                <div className="grid gap-4 p-4">
                  {pdfs.map((pdf) => (
                    <div
                      key={pdf.id}
                      className="flex items-center justify-between"
                    >
                      <Button
                        variant="ghost"
                        className="flex items-center max-w-[200px]"
                        onClick={() => setSelectedPDF(pdf)}
                      >
                        <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {truncateName(pdf.name, 20)}
                        </span>
                      </Button>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 hidden sm:inline">
                          {format(new Date(pdf.createdAt), "MMM d, yyyy")}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPdfToDelete(pdf)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <FileX className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-lg font-semibold text-gray-700">
                  No PDFs Found
                </p>
                <p className="text-sm text-gray-500 text-center mt-2">
                  This user hasn&apos;t uploaded any PDFs yet.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedPDF && (
        <Dialog open={!!selectedPDF} onOpenChange={() => setSelectedPDF(null)}>
          <DialogContent className="sm:max-w-[80vw] sm:max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{selectedPDF.name}</DialogTitle>
            </DialogHeader>
            <div className="w-full h-[60vh]">
              <iframe
                src={selectedPDF.url}
                className="w-full h-full"
                title={selectedPDF.name}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!pdfToDelete} onOpenChange={() => setPdfToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete PDF</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {pdfToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPdfToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (pdfToDelete) {
                  setIsDeleting(true);
                  deletePDF({ id: pdfToDelete.id });
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}