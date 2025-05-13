"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Users, UserCheck, UserX } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import Skeleton from "react-loading-skeleton";
import RevenuePieChart from "./revenue-pie-chart";
import type { DateRange } from "react-day-picker";

export default function DashboardContent() {
  // Using destructuring syntax with just the first element to avoid the unused variable warning
  const [dateRange] = useState<DateRange | undefined>(undefined);
  const { data, isLoading } = trpc.getCounts.useQuery();
  const { data: dataUser } = trpc.getUserGrowth.useQuery();

  if (isLoading) {
    return <Skeleton height={100} className="my-2" count={3} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Suspended Users
            </CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.suspendedUsers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                users: {
                  label: "Users",
                  color: "rgb(37, 99, 235)",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dataUser} // Dynamic data
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${Math.floor(value).toString()}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="rgb(37, 99, 235)"
                    strokeWidth={2}
                    dot={{ fill: "rgb(37, 99, 235)", strokeWidth: 2 }}
                    activeDot={{ r: 8 }}
                  />
                  <ChartTooltip content={<CustomTooltip />} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Add the Revenue Pie Chart */}
        <RevenuePieChart dateRange={dateRange} />
      </div>
    </div>
  );
}

// Fix 2: Replace 'any' with proper types for the tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded shadow">
        <p className="font-semibold">{label}</p>
        <p className="text-[rgb(37,99,235)]">Users: {payload[0].value}</p>
      </div>
    );
  }
  return null;
}