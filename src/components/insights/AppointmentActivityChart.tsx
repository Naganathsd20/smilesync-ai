"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CalendarIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const chartConfig = {
  upcoming: {
    label: "Upcoming confirmed",
    color: "hsl(217 91% 60%)",
  },
  completed: {
    label: "Completed",
    color: "hsl(160 84% 39%)",
  },
  total: {
    label: "Total",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export default function AppointmentActivityChart({
  upcomingCount,
  completedCount,
  totalCount,
}: {
  upcomingCount: number;
  completedCount: number;
  totalCount: number;
}) {
  if (totalCount === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-border/50 rounded-2xl bg-muted/5">
        <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
          <CalendarIcon className="w-6 h-6 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          No Appointment Activity
        </p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Book an appointment to see activity here. Charts use your real booking
          counts only.
        </p>
        <Link href="/appointments">
          <Button size="sm" className="gap-1.5">
            Book Appointment
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    );
  }

  const chartData = [
    {
      key: "upcoming",
      label: "Upcoming",
      count: upcomingCount,
      fill: "var(--color-upcoming)",
    },
    {
      key: "completed",
      label: "Completed",
      count: completedCount,
      fill: "var(--color-completed)",
    },
    {
      key: "total",
      label: "Total",
      count: totalCount,
      fill: "var(--color-total)",
    },
  ];

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-[16/9] w-full min-h-[180px] max-h-[300px] min-w-0 max-w-full"
    >
      <BarChart
        data={chartData}
        margin={{ left: 4, right: 16, top: 12, bottom: 8 }}
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          className="stroke-border/40"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          className="text-[11px] fill-muted-foreground"
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={28}
          domain={[0, "auto"]}
          className="text-[11px] fill-muted-foreground"
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted) / 0.3)", radius: 6 }}
          content={<ChartTooltipContent hideLabel nameKey="key" />}
        />
        <Bar dataKey="count" radius={8} maxBarSize={60} name="Appointments">
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
