"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, CreditCard, Calendar, X } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InvoiceStatsCardsProps {
  onFilterChange?: (dateRange: DateRange | undefined) => void;
}

// Current NPR to USD exchange rate (this would ideally come from an API)
const NPR_TO_USD_RATE = 0.0075; // Example: 1 NPR = 0.0075 USD

export default function InvoiceStatsCards({
  onFilterChange,
}: InvoiceStatsCardsProps) {
  // State for custom date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (onFilterChange) {
      onFilterChange(range);
    }
  };

  // Fetch invoice statistics based on date range
  const { data, isLoading } = trpc.getInvoiceStats.useQuery({
    startDate: dateRange?.from,
    endDate: dateRange?.to,
  });

  // Format currency based on payment method
  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat(currency === "NPR" ? "ne-NP" : "en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Calculate total revenue in USD equivalent with currency conversion
  const calculateTotalRevenue = () => {
    if (!data) return { usd: 0, original: { usd: 0, npr: 0 } };

    const stripeAmount = data.paymentMethodCounts?.Stripe?.amount || 0;
    const esewaAmount = data.paymentMethodCounts?.eSewa?.amount || 0;

    // Convert eSewa amount from NPR to USD
    const esewaInUSD = esewaAmount * NPR_TO_USD_RATE;

    // Total in USD
    const totalUSD = stripeAmount + esewaInUSD;

    return {
      usd: totalUSD,
      original: {
        usd: stripeAmount,
        npr: esewaAmount,
      },
    };
  };

  const totalRevenue = calculateTotalRevenue();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Revenue Overview</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {dateRange?.from ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {dateRange.to ? format(dateRange.to, "LLL dd, y") : ""}
                </>
              ) : (
                "All time (no filter)"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-3 border-b flex justify-between items-center">
              <span className="font-medium">Date Range</span>
              {dateRange && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateRangeChange(undefined)}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
            <DatePickerWithRange
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TooltipProvider>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(totalRevenue.usd)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Combined revenue (USD equivalent)
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="p-4 w-60">
                    <p className="font-medium mb-2">Revenue Breakdown:</p>
                    <div className="space-y-1">
                      <p>
                        Stripe:{" "}
                        {formatCurrency(totalRevenue.original.usd, "USD")}
                      </p>
                      <p>
                        eSewa:{" "}
                        {formatCurrency(totalRevenue.original.npr, "NPR")}
                      </p>
                      <p>
                        eSewa (USD equivalent):{" "}
                        {formatCurrency(
                          totalRevenue.original.npr * NPR_TO_USD_RATE,
                          "USD"
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Using exchange rate: 1 NPR = {NPR_TO_USD_RATE} USD
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </CardContent>
          </Card>
        </TooltipProvider>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {data?.statusCounts?.PAID || 0}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stripe Revenue
            </CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 9.5V7C14 5.89543 13.1046 5 12 5H7C5.89543 5 5 5.89543 5 7V17C5 18.1046 5.89543 19 7 19H12C13.1046 19 14 18.1046 14 17V14.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M9 9L19 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M16 6L19 9L16 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    data?.paymentMethodCounts?.Stripe?.amount || 0,
                    "USD"
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data?.paymentMethodCounts?.Stripe?.count || 0} transactions
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">eSewa Revenue</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 10H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    data?.paymentMethodCounts?.eSewa?.amount || 0,
                    "NPR"
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data?.paymentMethodCounts?.eSewa?.count || 0} transactions
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
