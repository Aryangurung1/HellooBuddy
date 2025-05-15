// In your app/invoices/page.tsx file

"use client";

import { useState } from "react";
import type { Invoice } from "@/types/invoice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Copy,
  Search,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { trpc } from "@/app/_trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import InvoiceStatsCards from "@/components/invoice-stats-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateExcelFile } from "@/lib/generate-excel";
import type { DateRange } from "react-day-picker";

type PaymentMethod = "all" | "Stripe" | "eSewa";

export default function InvoicesPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("all");

  // Fetch invoices with pagination and date range filter
  const { data, isLoading } = trpc.getInvoices.useQuery(
    {
      limit: 10,
      cursor: currentPage > 0 ? `page_${currentPage}` : undefined,
      startDate: dateRange?.from,
      endDate: dateRange?.to,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Handle date range change from InvoiceStatsCards
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  // Filter invoices based on search query and payment method
  const filteredInvoices =
    data?.invoices?.filter((invoice) => {
      // Payment method filter
      if (selectedPaymentMethod !== "all" && invoice.paymentMethod !== selectedPaymentMethod) {
        return false;
      }

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      // Search by invoice ID
      const idMatch = invoice.id.toLowerCase().includes(query);
      // Search by customer email
      const emailMatch = invoice.user.email.toLowerCase().includes(query);

      return idMatch || emailMatch;
    }) || [];

  const formatCurrency = (amount: number, currency: string) => {
    // Always use 'en-US' for both USD and NPR, and use 'NPR' for eSewa
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      currencyDisplay: "code",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return "—";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Function to copy invoice ID to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Invoice ID copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  // Function to download invoice as Excel
  const downloadExcel = (invoice: Invoice) => {
    try {
      generateExcelFile([invoice], `invoice-${invoice.id}`);
    } catch (error) {
      console.error("Failed to generate Excel file:", error);
      alert("Failed to generate Excel file. Please try again.");
    }
  };

  // Function to export all invoices as Excel
  const exportAllAsExcel = () => {
    if (!filteredInvoices || filteredInvoices.length === 0) {
      alert("No invoices to export");
      return;
    }

    try {
      generateExcelFile(filteredInvoices, "all-invoices");
    } catch (error) {
      console.error("Failed to generate Excel file:", error);
      alert("Failed to generate Excel file. Please try again.");
    }
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Subscription Invoices</h1>
        <Button onClick={exportAllAsExcel}>
          <Download className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
      </div>

      <div className="space-y-6">
        <InvoiceStatsCards onFilterChange={handleDateRangeChange} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>
                View and manage all subscription invoices.
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {selectedPaymentMethod === "all" 
                      ? "All Payment Methods" 
                      : `${selectedPaymentMethod} Only`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuCheckboxItem
                    checked={selectedPaymentMethod === "all"}
                    onCheckedChange={() => setSelectedPaymentMethod("all")}
                  >
                    All Payment Methods
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={selectedPaymentMethod === "Stripe"}
                    onCheckedChange={() => setSelectedPaymentMethod("Stripe")}
                  >
                    Stripe Only
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedPaymentMethod === "eSewa"}
                    onCheckedChange={() => setSelectedPaymentMethod("eSewa")}
                  >
                    eSewa Only
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by ID or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Subscription Period</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Loading state
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </TableCell>
                        </TableRow>
                      ))
                  ) : filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {searchQuery.trim()
                          ? "No invoices found matching your search"
                          : selectedPaymentMethod !== "all"
                          ? `No ${selectedPaymentMethod} invoices found for the selected time period`
                          : "No invoices found for the selected time period"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="flex items-center gap-1 cursor-pointer"
                                  onClick={() => copyToClipboard(invoice.id)}
                                >
                                  {invoice.id.substring(0, 8)}...
                                  <Copy className="h-3 w-3 text-muted-foreground" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{invoice.id} (Click to copy)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>{invoice.user.email}</TableCell>
                        <TableCell>
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                        <TableCell>
                          {formatDate(invoice.subscriptionPeriodStart)} —{" "}
                          {formatDate(invoice.subscriptionPeriodEnd)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => downloadExcel(invoice)}
                              >
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Download Excel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!data?.nextCursor || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
